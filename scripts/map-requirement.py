#!/usr/bin/env python3
"""Map a requirement to the files that must change to deliver it.

Reads a ticket from jira-tasks.md, matches its vocabulary against the deterministic
code graph, then follows impact edges outward to find what else the change reaches.

    python3 scripts/map-requirement.py FIEL-12
    python3 scripts/map-requirement.py FIEL-12 --hops 3 --json

Output is a change-set: files ranked by how directly the requirement names them, the
blast radius around them, and - the part that matters on a brownfield repo - the
requirement terms that match nothing, which is the surface that has to be written new.

This is lexical matching over a deterministic graph, not semantic understanding. Every
row carries the term that produced it, so a wrong row is visible rather than silent.
"""
import json
import math
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Relations that carry impact. Structural relations (contains/imports/imports_from)
# are deliberately excluded: everything imports the type modules, so propagating along
# them marks the whole repo as affected and the answer becomes noise.
IMPACT = {"calls", "references", "method", "extends", "indirect_call", "uses", "inherits"}

STOP = set("""a an and are as at be by can for from has have i if in into is it its me my not of
on or so that the their them then there these they this to want when which will with you your
should must able want need needs so-that as-a i-want user story acceptance criteria implement
work described feature support provide allow enable show see view get set new add update
create make use using via per each all any one two both same other out type run first did
shows showing most only also than more less item items data value values name names main
src test tests index config json build dist node modules package tsconfig""".split())

# Only source files can be "changed to deliver a requirement". Config and lockfiles
# match on generic vocabulary ("type", "out") and drown the real answer.
SOURCE_EXT = {".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".java", ".rb", ".rs",
              ".cs", ".php", ".kt", ".swift", ".scala", ".c", ".cc", ".cpp", ".h"}


def sh(*args):
    p = subprocess.run(args, cwd=str(ROOT), capture_output=True, text=True)
    return p.stdout


def load_graph():
    """Prefer the published graph; fall back to a local build."""
    out = sh("git", "show", "origin/graph:graph.json")
    if out.strip():
        return json.loads(out), "origin/graph"
    local = ROOT / "graph.json"
    if local.exists():
        return json.loads(local.read_text()), "local graph.json"
    sys.exit("No graph. Run: python3 scripts/build-graph.py")


def load_ticket(key):
    """Pull one ticket's title and body out of jira-tasks.md."""
    md = (ROOT / "jira-tasks.md").read_text()
    m = re.search(r"^## \[" + re.escape(key) + r"\](.*?)(?=^## \[|\Z)", md, re.S | re.M)
    if not m:
        sys.exit(f"{key} not found in jira-tasks.md")
    block = m.group(0)
    title = re.match(r"^## \[" + re.escape(key) + r"\]\s*(.+)", block).group(1).strip()
    body = ""
    b = re.search(r"### What to build\s*(.*?)(?=^###|\Z)", block, re.S | re.M)
    if b:
        body = b.group(1).strip()
    return title, body


def split_ident(s):
    """Break camelCase / kebab / snake / path segments into lowercase words."""
    s = re.sub(r"[^A-Za-z0-9]+", " ", s)
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", s)
    return [w.lower() for w in s.split() if len(w) > 2]


def terms_of(text):
    words = [w for w in split_ident(text) if w not in STOP and not w.isdigit()]
    seen, out = set(), []
    for w in words:
        if w not in seen:
            seen.add(w); out.append(w)
    return out


def main():
    args = [a for a in sys.argv[1:]]
    as_json = "--json" in args
    args = [a for a in args if not a.startswith("--") or a == "--hops"]
    hops = 2
    if "--hops" in sys.argv:
        hops = int(sys.argv[sys.argv.index("--hops") + 1])
    keys = [a for a in args if re.fullmatch(r"[A-Z]+-\d+", a)]
    if not keys:
        sys.exit("usage: map-requirement.py <TICKET-KEY> [--hops N] [--json]")
    key = keys[0]

    title, body = load_ticket(key)
    graph, source = load_graph()
    terms = terms_of(title + " " + body)

    nodes = {n["id"]: n for n in graph["nodes"]}
    code = {i: n for i, n in nodes.items()
            if n.get("file_type") == "code"
            and Path(n.get("source_file", "")).suffix in SOURCE_EXT}

    # --- score every code node against the requirement vocabulary ---
    hits = defaultdict(list)          # node id -> matched terms
    for nid, n in code.items():
        vocab = set(split_ident(n.get("label", "")) + split_ident(n.get("source_file", "")))
        for t in terms:
            if t in vocab:
                hits[nid].append(t)

    # A term that matches half the repo carries almost no information; a term that
    # matches two symbols points straight at the change. Weight by inverse frequency
    # so "risk" does not rank the same as "queue".
    freq = defaultdict(int)
    for ts in hits.values():
        for t in set(ts):
            freq[t] += 1
    total = max(1, len(code))
    weight = {t: math.log(1 + total / max(1, freq[t])) for t in freq}

    seeds = {nid: ts for nid, ts in hits.items() if ts}
    matched_terms = set(t for ts in seeds.values() for t in ts)
    unmatched = [t for t in terms if t not in matched_terms]

    # --- expand along impact edges only ---
    out_adj, in_adj = defaultdict(list), defaultdict(list)
    for e in graph["edges"]:
        if e["relation"] not in IMPACT:
            continue
        if e["source"] in code and e["target"] in code:
            out_adj[e["source"]].append(e["target"])
            in_adj[e["target"]].append(e["source"])

    reach = {nid: 0 for nid in seeds}
    frontier = list(seeds)
    for hop in range(1, hops + 1):
        nxt = []
        for nid in frontier:
            for other in out_adj[nid] + in_adj[nid]:
                if other not in reach:
                    reach[other] = hop
                    nxt.append(other)
        frontier = nxt

    # --- roll up to files ---
    files = defaultdict(lambda: {"direct": [], "reached": 0, "hop": 99, "symbols": [], "score": 0.0})
    for nid, hop in reach.items():
        n = code[nid]
        f = n.get("source_file", "?")
        rec = files[f]
        rec["hop"] = min(rec["hop"], hop)
        if hop == 0:
            rec["direct"].extend(hits[nid])
            rec["symbols"].append(n.get("label", ""))
        else:
            rec["reached"] += 1
    for f, rec in files.items():
        rec["score"] = round(sum(weight.get(t, 0) for t in set(rec["direct"])), 2)

    ranked = sorted(files.items(), key=lambda kv: (kv[1]["hop"], -kv[1]["score"], kv[0]))

    if as_json:
        print(json.dumps({
            "ticket": key, "title": title, "source": source,
            "terms": terms, "unmatched_terms": unmatched,
            "files": [{"file": f, "hop": r["hop"], "matched_terms": sorted(set(r["direct"])),
                       "symbols": sorted(set(r["symbols"])), "reached_symbols": r["reached"],
                       "score": r["score"]}
                      for f, r in ranked],
        }, indent=2))
        return

    print(f"{key}  {title}")
    print(f"graph: {source}  |  {len(code)} code symbols  |  impact edges only, {hops} hops\n")

    if not ranked:
        print("No existing code matches this requirement.")
        print("This is new surface - nothing to change, everything to write.\n")
    else:
        print("CHANGE SET")
        print(f"  {'file':<46} {'why':<36} depth / weight")
        for f, r in ranked[:20]:
            if r["hop"] == 0:
                strong = sorted(set(r["direct"]), key=lambda x: -weight.get(x, 0))[:3]
                why = "names: " + ", ".join(strong)
                depth = f"direct  {r['score']:.1f}"
            else:
                why = f"reached from {r['reached']} symbol(s)"
                depth = f"{r['hop']} hop"
            print(f"  {f:<46} {why:<36} {depth}")
        if len(ranked) > 20:
            print(f"  ... {len(ranked) - 20} more")

    if unmatched:
        print("\nNEW SURFACE - requirement terms with no counterpart in the code")
        print("  " + ", ".join(unmatched[:24]))
        print("  These are what the ticket adds rather than changes.")

    direct = [f for f, r in ranked if r["hop"] == 0]
    print(f"\n{len(direct)} file(s) named directly, {len(ranked) - len(direct)} reached by impact, "
          f"{len(unmatched)}/{len(terms)} terms unmatched.")


if __name__ == "__main__":
    main()

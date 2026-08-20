#!/usr/bin/env python3
"""Render the code graph to a local HTML page and open it in the browser.

Source order:
  1. the graph published by CI on the orphan `graph` branch (origin/graph)
  2. a local build, if the branch is missing or --local is passed

Writes graph-viewer.html in the repo root and opens it. Nothing is uploaded.

    python scripts/show-graph.py            # published graph
    python scripts/show-graph.py --local    # build from the working tree first
    python scripts/show-graph.py --no-open  # write the file, don't launch a browser
"""
import json
import subprocess
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = Path(__file__).resolve().parent / "graph-viewer.template.html"
OUT = ROOT / "graph-viewer.html"


def git(*args, check=True):
    p = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True)
    if check and p.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)}: {p.stderr.strip()}")
    return p.stdout


def from_branch():
    """Read graph.json + manifest.json off origin/graph."""
    subprocess.run(["git", "-C", str(ROOT), "fetch", "-q", "origin", "graph"],
                   capture_output=True, text=True)
    graph = json.loads(git("show", "origin/graph:graph.json"))
    man = json.loads(git("show", "origin/graph:manifest.json"))
    return graph, man, "origin/graph"


def from_local():
    """Build the graph from the working tree."""
    subprocess.run([sys.executable, str(ROOT / "scripts" / "build-graph.py")],
                   cwd=str(ROOT), check=True)
    graph = json.loads((ROOT / "graph.json").read_text())
    man = json.loads((ROOT / "manifest.json").read_text())
    return graph, man, "local build"


def slim(graph):
    """Drop fields the viewer does not read — the payload is inlined in the page."""
    return {
        "nodes": [{"i": n["id"], "l": n.get("label", ""), "f": n.get("source_file", ""),
                   "t": n.get("file_type", ""), "L": n.get("source_location", ""),
                   "c": 1 if n.get("_callable") else 0} for n in graph["nodes"]],
        "edges": [{"s": e["source"], "t": e["target"], "r": e["relation"],
                   "c": e.get("confidence", "")} for e in graph["edges"]],
    }


def main():
    args = sys.argv[1:]
    want_local = "--local" in args
    open_it = "--no-open" not in args

    if not TEMPLATE.exists():
        sys.exit(f"missing template: {TEMPLATE}")

    if want_local:
        graph, man, source = from_local()
    else:
        try:
            graph, man, source = from_branch()
        except Exception as e:
            print(f"no published graph ({e}); building locally", file=sys.stderr)
            graph, man, source = from_local()

    payload = json.dumps(slim(graph), separators=(",", ":")).replace("</", "<\\/")
    # The viewer does not surface the builder tool, so keep its version out
    # of the embedded payload rather than shipping an unused field.
    man_embed = {k: v for k, v in man.items() if k != "graphify_version"}
    manifest = json.dumps(man_embed, separators=(",", ":")).replace("</", "<\\/")

    html = TEMPLATE.read_text()
    html = html.replace("__GRAPH__", payload).replace("__MANIFEST__", manifest)
    OUT.write_text(html)

    head = git("rev-parse", "HEAD").strip()
    state = "current" if man.get("sha") == head else "stale"
    dirty = len([l for l in git("status", "--porcelain").splitlines() if l.strip()])
    if state == "current" and dirty:
        state = f"stale locally ({dirty} uncommitted)"

    print(f"graph      {man.get('node_count')} nodes, {man.get('edge_count')} edges")
    print(f"commit     {str(man.get('sha'))[:8]} ({state})")
    print(f"source     {source}")
    print(f"written    {OUT}")

    if open_it:
        webbrowser.open(OUT.as_uri())
        print("opened in your browser")


if __name__ == "__main__":
    main()

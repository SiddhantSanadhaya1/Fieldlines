#!/usr/bin/env python3
"""Build the deterministic code graph for this repo.

Runs graphify (tree-sitter, ~36 languages) over the working tree and writes:

    graph.json      the {nodes, edges} graph
    manifest.json   {sha, built_at, graphify_version, node_count, edge_count}

The manifest is what makes the graph checkable: any consumer compares
manifest.sha against `git rev-parse HEAD` to know whether the graph matches the
code. graphify.extract makes no network or LLM calls, so the same SHA always
produces the same graph.
"""
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

OUT_DIR = Path(os.getenv("GRAPH_OUT_DIR", "."))
TIMEOUT_S = int(os.getenv("GRAPH_TIMEOUT_S", "600"))

# graphify writes progress ("  AST extraction: 190/190 uncached files …") to
# *stdout*, ahead of the JSON, but only on repos big enough to be worth
# reporting. A naive json.loads() therefore passes on small repos and fails in
# production. Parse from the first line that begins a JSON object.
_JSON_START_RE = re.compile(r"^\{", re.MULTILINE)


def parse_graphify_stdout(raw: str) -> dict:
    m = _JSON_START_RE.search(raw)
    if not m:
        sys.exit(f"graphify produced no JSON object (got {raw[:200]!r})")
    try:
        return json.loads(raw[m.start():])
    except json.JSONDecodeError as e:
        sys.exit(f"graphify emitted invalid JSON: {e}")


def git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], capture_output=True, text=True, check=False
    ).stdout.strip()


def main() -> None:
    try:
        proc = subprocess.run(
            [sys.executable, "-m", "graphify.extract", "."],
            capture_output=True, timeout=TIMEOUT_S,
        )
    except subprocess.TimeoutExpired:
        sys.exit(f"graphify timed out after {TIMEOUT_S}s")

    if proc.returncode != 0:
        tail = proc.stderr.decode("utf-8", "replace")[-800:]
        sys.exit(f"graphify exited {proc.returncode}: {tail}")

    graph = parse_graphify_stdout(proc.stdout.decode("utf-8", "replace"))

    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])
    failed = graph.get("failed_sources", [])

    try:
        gf_version = version("graphifyy")
    except PackageNotFoundError:
        gf_version = "unknown"

    manifest = {
        "sha": git("rev-parse", "HEAD") or "unknown",
        "branch": git("rev-parse", "--abbrev-ref", "HEAD") or "unknown",
        "built_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "graphify_version": gf_version,
        "node_count": len(nodes),
        "edge_count": len(edges),
        "failed_sources": failed,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "graph.json").write_text(json.dumps(graph, indent=2))
    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2))

    print(f"graph: {len(nodes)} nodes, {len(edges)} edges @ {manifest['sha'][:8]}")
    if failed:
        print(f"unparsed: {', '.join(failed)}")

    # Feed the GitHub Actions job summary when running in CI.
    summary = os.getenv("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as fh:
            fh.write(
                f"### Code graph rebuilt\n\n"
                f"| | |\n|---|---|\n"
                f"| Commit | `{manifest['sha'][:8]}` |\n"
                f"| Nodes | {len(nodes)} |\n"
                f"| Edges | {len(edges)} |\n"
                f"| graphify | {gf_version} |\n"
            )


if __name__ == "__main__":
    main()

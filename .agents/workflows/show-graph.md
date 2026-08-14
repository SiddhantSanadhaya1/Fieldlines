---
description: Open the repo's code graph in a local browser window and report whether it matches HEAD
---

Invoke the agent-skills:code-graph-status skill.

Render the deterministic code graph to a local HTML page and open it. Nothing is
uploaded — the page is written into the repo and opened with the local browser.

**Step 1 — If the repo has the viewer, run it:**

```bash
python3 scripts/show-graph.py
```

It pulls the graph CI published on the orphan `graph` branch, falls back to a local
build if that branch does not exist, writes `graph-viewer.html`, and opens it. Report
the four lines it prints — nodes/edges, commit and state, source, output path.

Useful flags: `--local` to build from the working tree first, `--no-open` to write the
file without launching a browser.

Use `python3`. If the repo's interpreter is exposed as `python` instead, fall back to
that - many machines have only one of the two on PATH.

**Step 2 — If `scripts/show-graph.py` does not exist**, report status only:

```bash
git fetch -q origin graph
git show origin/graph:manifest.json
git rev-parse HEAD
git status --porcelain
```

Then say the viewer is not set up in this repo and stop. Do not publish the graph
anywhere, and do not build a viewer unless asked.

**Report one of three states:**

| Condition | State |
|---|---|
| `manifest.sha` == HEAD, working tree clean | **current** |
| `manifest.sha` != HEAD | **stale** — name how many commits behind |
| `manifest.sha` == HEAD, working tree dirty | **stale locally** — name the dirty files |

Present it as a block:

```
Code graph — current
  commit    e75c8f98 (matches HEAD)
  nodes     635
  edges     730
  built     2026-08-14T12:13:16+00:00
  graphify  0.9.42
```

This command reports and opens. It does not rebuild the published graph — that happens
in CI on push to main.

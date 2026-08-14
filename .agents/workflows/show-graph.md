---
description: Show the published code graph and whether it matches the code you have checked out
---

Invoke the agent-skills:code-graph-status skill.

Report the state of this repo's deterministic code graph, published to the orphan
`graph` branch by CI on every push to main.

```bash
git fetch -q origin graph
git show origin/graph:manifest.json
git rev-parse HEAD
git status --porcelain
```

Report one of three states:

| Condition | State |
|---|---|
| `manifest.sha` == HEAD, working tree clean | **current** |
| `manifest.sha` != HEAD | **stale** — name how many commits behind |
| `manifest.sha` == HEAD, working tree dirty | **stale locally** — name the dirty files |

Present it as a block:

```
Code graph — current
  commit    e75c8f98 (matches HEAD)
  nodes     633
  edges     729
  built     2026-08-14T12:13:16+00:00
  graphify  0.9.42
```

If the `graph` branch does not exist, report that CI publishes it on push to main
(`.github/workflows/graph.yml`) and that a local build is `python scripts/build-graph.py`.
Then stop.

This command reports; it does not rebuild. Do not offer to rebuild unless asked.

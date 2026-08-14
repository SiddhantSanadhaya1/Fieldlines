---
description: Show the published code graph and whether it matches the code you have checked out
---

Report the state of this repo's deterministic code graph, published to the orphan
`graph` branch by CI on every push to main.

**Step 1 — Fetch the published graph:**

```bash
git fetch -q origin graph 2>/dev/null
git show origin/graph:manifest.json
```

If the fetch fails or the branch does not exist, report:

```
No published graph. CI publishes it on push to main
(.github/workflows/graph.yml). Build one locally with:
  python scripts/build-graph.py
```

Then stop.

**Step 2 — Compare against what is checked out:**

```bash
git rev-parse HEAD
git status --porcelain
```

**Step 3 — Report one of three states:**

| Condition | State |
|---|---|
| `manifest.sha` == HEAD, working tree clean | **current** |
| `manifest.sha` != HEAD | **stale** — behind by `git rev-list --count <manifest.sha>..HEAD` commits |
| `manifest.sha` == HEAD, working tree dirty | **stale locally** — N uncommitted files not in the graph |

Present it as a short block, not prose:

```
Code graph — current
  commit    e75c8f98 (matches HEAD)
  nodes     633
  edges     729
  built     2026-08-14T12:13:16+00:00
  graphify  0.9.42
```

For a stale graph, name what is missing — the commits or the specific dirty files.
Do not offer to rebuild unless asked; this command reports, it does not mutate.

**Notes:**
- graphify makes no network or LLM calls, so the graph is reproducible from a commit
  SHA. Same SHA, same graph, every time.
- `failed_sources` in the manifest lists files graphify could not parse (lockfiles,
  JSON config). Mention them only if a source file appears there — that would be a
  real gap in the graph.

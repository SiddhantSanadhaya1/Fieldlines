# Fieldlines

Field service management for technicians, dispatchers and supervisors — offline-first
job execution on device, with a supervisor review queue that prioritises completed jobs
by risk.

The backlog (100 tickets, 301 points, 6 epics) was generated from the Fieldlines BRD by
**Sync.AI Genesis** and lives in [`jira-tasks.md`](jira-tasks.md). Project key: `FIEL`.

## What's built

| Ticket | Feature | Location |
|---|---|---|
| FIEL-53 | Risk scoring engine — deterministic weighted score + itemised breakdown | `src/domain/risk/` |
| FIEL-60 | Supervisor review queue table — sortable columns, risk badges | `src/components/review-queue/` |
| FIEL-59 | Job detail view — steps, evidence, findings, timings | `src/components/job-detail/` |
| FIEL-33 | Rework return flow | design only — `docs/statusneo/specs/` |

### Risk scoring

```
score = (overrides x 3) + (out_of_range x 2) + (failed_checks x 2) + (is_new_procedure x 1)
```

Supervisors review `ORDER BY risk_score DESC`, so jobs with manual overrides and failed
safety checks surface first. The function is pure, returns frozen objects, and sanitises
negative or missing counts to `0` rather than throwing.

## Commands

```bash
npm install
npm test         # node --test, 25 tests
npm run build    # tsc
```

Open `index.html` for the review queue demo against fixture data.

## Code graph

Every push or merge to `main` rebuilds a deterministic code graph via
[graphify](https://pypi.org/project/graphifyy/) (tree-sitter, ~36 languages) and
publishes it to the orphan `graph` branch — see
[`.github/workflows/graph.yml`](.github/workflows/graph.yml).

graphify makes no network or LLM calls, so the graph is reproducible from a commit SHA.
`manifest.json` records the SHA it was built at, which is what lets a consumer check
whether the graph matches the code.

```bash
python scripts/build-graph.py        # local build

git fetch origin graph               # fetch the published graph
git show origin/graph:manifest.json  # sha, node/edge counts, graphify version
```

## Development workflow

Built with agent slash commands (`.agents/workflows/`) driven from
[`GEMINI.md`](GEMINI.md): `/jira` to pull tickets, `/brainstorm` to shape,
`/plan` to break down, `/dispatch` to implement, `/verify` and `/jira-sync` to close
the loop. Per-ticket artifacts land in `docs/ideas/` and `docs/statusneo/`.

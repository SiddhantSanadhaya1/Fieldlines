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
npm run build    # tsc --noEmit over src/ and api/, then vite build
npm run api      # the verdict API on :3001
npm run dev:all  # API and review queue together
```

CI runs `npm ci && npm test && npm run build` on every push and pull request
(`.github/workflows/ci.yml`), and deploys to Vercel from `main`. The deploy step
skips itself with a notice when `VERCEL_TOKEN`, `VERCEL_ORG_ID` and
`VERCEL_PROJECT_ID` are absent, rather than failing the run — a configuration gap
is not something a code change can fix.

Open `index.html` for the review queue demo against fixture data.

## API and telemetry

The supervisor's verdict is not applied in the browser alone. `POST /api/verdict`
writes a **closure audit** record: it re-derives the risk score server-side rather
than trusting the number the browser displayed, so a stale or tampered client
cannot close a high-risk job as low-risk.

```bash
npm run api        # the API on :3001
npm run dev        # the review queue on :5173
npm run dev:all    # both
```

### Exporting exceptions

The API is instrumented with OpenTelemetry and exports traces over OTLP. There is
no third-party telemetry vendor here — **Mission Control is itself an OTLP
receiver**, so traces go straight to it, and any OTel SDK or Collector that speaks
OTLP/HTTP would work the same way.

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://<mission-control>/v1/traces \
MISSION_CONTROL_INGEST_KEY=mcik_... \
  npm run api
```

Issue the key in Mission Control under **Project → Telemetry & Signals → New
key**. It is shown once and stored hashed. With the endpoint unset the app runs
normally and simply exports nothing — a missing variable must never take down the
review queue.

Two details in `api/_telemetry.ts` are load-bearing on Vercel and would be wrong
in a long-running server: spans use a **simple** processor rather than a batch
one, and the handler **awaits a flush** before responding. A serverless container
freezes the moment it returns, so a batched span — including the one carrying the
exception — is a span that never ships.

Instrumentation is server-side on purpose. The ingest key stays out of client
JavaScript, and a stack trace from a bundled browser build points at
`assets/index-a1b2c3.js`, which cannot be mapped back to a file in this
repository. A server trace names `api/verdict.ts:75`, which is what a fix needs.

## Code graph

Every push or merge to `main` rebuilds a deterministic code graph via
[graphify](https://pypi.org/project/graphifyy/) (tree-sitter, ~36 languages) and
publishes it to the orphan `graph` branch — see
[`.github/workflows/graph.yml`](.github/workflows/graph.yml).

graphify makes no network or LLM calls, so the graph is reproducible from a commit SHA.
`manifest.json` records the SHA it was built at, which is what lets a consumer check
whether the graph matches the code.

```bash
python3 scripts/build-graph.py        # local build

git fetch origin graph               # fetch the published graph
git show origin/graph:manifest.json  # sha, node/edge counts, graphify version
```

## Development workflow

Built with agent slash commands (`.agents/workflows/`) driven from
[`GEMINI.md`](GEMINI.md): `/jira` to pull tickets, `/brainstorm` to shape,
`/plan` to break down, `/dispatch` to implement, `/verify` and `/jira-sync` to close
the loop. Per-ticket artifacts land in `docs/ideas/` and `docs/statusneo/`.

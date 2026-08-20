# Deploying Fieldlines and wiring its telemetry

Everything here is blocked on credentials this machine does not have. The code,
the CI workflow and the Vercel config are all in place and verified; what remains
is entering secrets, which only someone with the accounts can do.

Do the steps in this order. Step 1 is a prerequisite for step 4 — telemetry
cannot reach Mission Control until Mission Control is redeployed.

---

## 1. Redeploy Mission Control (do this first)

The live site currently rejects both the telemetry endpoint and the GitHub
webhook. Verified on 2026-08-19:

```
POST https://agentic-sdlc.statusneo.com/mission-control/v1/traces/fieldlines
  -> 401   www-authenticate: Basic realm="Mission Control"
```

That 401 comes from nginx's browser password, not from Mission Control. A
telemetry exporter and GitHub both have no username and password and no way to
be given one, so every trace and every webhook delivery would be turned away at
the edge.

`agent-poc-sandbox/deploy/nginx.mission-control.conf` fixes it: `/v1/` and
`/api/webhooks/` bypass the browser password and rely on the authentication they
already carry — a per-project ingest key stored only as a hash, and an HMAC
signature over the raw webhook body. That change is committed but **not
deployed**.

```bash
cd agent-poc-sandbox
docker compose -f docker-compose.yml -f deploy/docker-compose.mission-control.yml up -d --build
```

Also set `MISSION_CONTROL_URL` on the API container, or the Telemetry & Signals
panel will show localhost addresses:

```
MISSION_CONTROL_URL=https://agentic-sdlc.statusneo.com/mission-control
```

Confirm afterwards — a 401 with a JSON body is correct (Mission Control asking
for a key); a 401 with `www-authenticate: Basic` means the redeploy did not take.

```bash
curl -i -X POST https://agentic-sdlc.statusneo.com/mission-control/v1/traces/fieldlines \
  -H 'content-type: application/json' -d '{}'
```

---

## 2. Vercel

Vercel's own Git integration deploys the app on every push to `main`. There is
nothing to configure in this repository for that, and no Vercel secrets are
needed here.

CI does **not** deploy, deliberately. Duplicating Vercel's trigger would mean
every push deploys twice for no benefit. What CI is for is being the thing that
can go red: a failed job is one of Mission Control's two intakes, and without a
build there is nothing for a build failure to come from.

If you would rather a red build could never reach production, set
**Project → Settings → Git → Ignored Build Step** to skip when CI has not passed.
That makes Vercel wait on CI instead of racing it.

## 3. Create an ingest key on the deployed Mission Control

Any key issued against a local database is useless in production.

**Mission Control → Projects → Fieldlines → Telemetry & Signals → New key**

Shown once, stored only as a hash. Copy it straight into step 4.

---

## 4. Set the telemetry variables in Vercel

Vercel → Fieldlines → Settings → Environment Variables → **Production**:

```
OTEL_SERVICE_NAME                   fieldlines-api
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT  https://agentic-sdlc.statusneo.com/mission-control/v1/traces/fieldlines
OTEL_EXPORTER_OTLP_HEADERS          Authorization=Bearer <the key from step 3>
```

No code change is needed. `api/_telemetry.ts` already reads these three standard
OpenTelemetry variable names, and exports nothing when they are absent.

The key travels as a header rather than in the URL because a credential in a URL
ends up in server logs, browser history and referrer headers.

Redeploy so the new variables are picked up.

---

## 5. Point the GitHub webhook at Mission Control

Repository → Settings → Webhooks → Add webhook:

```
Payload URL   https://agentic-sdlc.statusneo.com/mission-control/api/webhooks/github/fieldlines
Content type  application/json
Secret        generate it in Telemetry & Signals -> Secret -> Generate
Events        Workflow runs only
```

This is the second intake: a red build becomes an incident the same way a runtime
exception does.

---

## 6. Check it end to end

1. Open the deployed app, accept a job. It fails — that is the planted defect in
   `buildClosureAudit`, kept deliberately as the demo failure.
2. Mission Control → Projects → Fieldlines → Incidents. The failure should appear
   within a few seconds, classified `code_defect`.
3. If nothing arrives, the order of suspicion is: step 1 not deployed (a
   `www-authenticate: Basic` header proves it), then a wrong or revoked ingest
   key (Mission Control answers 401 with a JSON body), then the variables not
   applied to the Production environment.

---

## Local development is unaffected

Locally the application sends to an OpenTelemetry Collector, which fans the same
spans to Grafana Tempo for viewing and to Mission Control for healing. The
application holds no credential in that arrangement — the collector does.

```bash
docker compose -f docker-compose.telemetry.yml up -d
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 npm run api
```

Grafana: http://localhost:3300

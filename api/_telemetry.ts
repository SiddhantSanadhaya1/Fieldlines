/**
 * OpenTelemetry wiring for the Fieldlines API.
 *
 * The app speaks OTLP and knows exactly one endpoint. What sits at the other end
 * is not its concern, and deliberately so:
 *
 *   - In development, an OpenTelemetry Collector, which fans the same spans out
 *     to Jaeger for a human to look at and to Mission Control for healing.
 *     See docker-compose.telemetry.yml.
 *   - Or Mission Control directly, when a collector is more machinery than the
 *     situation warrants.
 *
 * Nothing below is specific to either. Every knob is a standard OpenTelemetry
 * environment variable, so the destination changes without a code change — which
 * is the whole argument for OTLP being the channel rather than a bespoke one.
 *
 * Mission Control, wherever it sits in that path, keeps only spans carrying an
 * exception event and turns the ones that look like code defects into fix
 * stories. Jaeger keeps everything.
 *
 * Two things about this file are load-bearing in a serverless deployment and
 * would be wrong in a long-running server:
 *
 * 1. **SimpleSpanProcessor, not BatchSpanProcessor.** A batch processor holds
 *    spans in memory and flushes on a timer. A serverless function is frozen the
 *    moment it returns a response, so the timer never fires and the span that
 *    matters — the one carrying the exception — is the one that never ships.
 *
 * 2. **`flush()` is awaited before the handler responds.** Even a simple
 *    processor exports asynchronously. Returning without awaiting it is the
 *    single most common reason "I instrumented it but nothing arrives".
 *
 * Instrumenting server-side rather than in the browser is also deliberate. The
 * ingest key stays out of client JavaScript, and — more importantly — a stack
 * trace from a bundled browser build points at `assets/index-a1b2c3.js`, which
 * cannot be mapped back to a file in the repository. Mission Control's first
 * step is turning the error into repo-relative paths, so a server trace is worth
 * far more to it than a browser one.
 */
import { NodeTracerProvider, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { metrics, type Counter, type Histogram } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { SpanStatusCode, trace, type Span } from '@opentelemetry/api';

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'fieldlines-api';

let provider: NodeTracerProvider | undefined;

/**
 * Where traces go, resolved the way the OpenTelemetry specification says.
 *
 * `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` is the full URL for traces specifically.
 * `OTEL_EXPORTER_OTLP_ENDPOINT` is a base URL shared by all signal types, and
 * the exporter appends `/v1/traces` to it. The signal-specific variable wins
 * when both are set. Using the standard names rather than invented ones means
 * any OpenTelemetry tooling configures this app without knowing anything about
 * it.
 */
function resolveEndpoint(): string | undefined {
  const signalSpecific = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim();
  if (signalSpecific) return signalSpecific;

  const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
  if (!base) return undefined;
  return `${base.replace(/\/+$/, '')}/v1/traces`;
}

/**
 * Headers for the exporter.
 *
 * `OTEL_EXPORTER_OTLP_HEADERS` is the standard mechanism, a comma-separated list
 * of `key=value` pairs. `MISSION_CONTROL_INGEST_KEY` is a convenience for the
 * common case of sending straight to Mission Control without a collector in
 * between; it simply becomes an Authorization header.
 *
 * When a collector is in the path, the app should carry no credential at all —
 * the collector holds it. That is one of the better reasons to run one.
 */
function resolveHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const pair of (process.env.OTEL_EXPORTER_OTLP_HEADERS ?? '').split(',')) {
    const index = pair.indexOf('=');
    if (index <= 0) continue;
    headers[pair.slice(0, index).trim()] = pair.slice(index + 1).trim();
  }

  const ingestKey = process.env.MISSION_CONTROL_INGEST_KEY?.trim();
  if (ingestKey && !headers.Authorization) headers.Authorization = `Bearer ${ingestKey}`;

  return headers;
}

/**
 * Build the provider once per warm container.
 *
 * Returns undefined when no endpoint is configured, so the app runs perfectly
 * well with telemetry switched off — a missing environment variable must not
 * take down the supervisor's review queue.
 */
function getProvider(): NodeTracerProvider | undefined {
  if (provider) return provider;

  const url = resolveEndpoint();
  if (!url) return undefined;

  provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'
    }),
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter({ url, headers: resolveHeaders() })
      )
    ]
  });
  provider.register();
  return provider;
}


// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

/**
 * Metrics, alongside traces.
 *
 * A trace answers "what happened in this one request". A metric answers "is the
 * service healthy right now" — which is the question a dashboard is for, and one
 * traces cannot answer cheaply because answering it would mean scanning every
 * trace in the window.
 *
 * Three instruments, deliberately few:
 *
 *   fieldlines.health          1 while the process is serving, 0 otherwise
 *   fieldlines.requests        count, split by route, method and status
 *   fieldlines.request.duration  latency histogram, same split
 *
 * Together those give rate, errors and duration — the three numbers an operator
 * actually looks at — plus a liveness signal that does not depend on any request
 * having happened.
 */
let meterProvider: MeterProvider | undefined;
let requestCounter: Counter | undefined;
let durationHistogram: Histogram | undefined;

function metricsEndpoint(): string | undefined {
  const signalSpecific = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT?.trim();
  if (signalSpecific) return signalSpecific;

  const base = process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim();
  if (!base) return undefined;
  return `${base.replace(/\/+$/, '')}/v1/metrics`;
}

function getMeterProvider(): MeterProvider | undefined {
  if (meterProvider) return meterProvider;

  const url = metricsEndpoint();
  if (!url) return undefined;

  meterProvider = new MeterProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'
    }),
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url, headers: resolveHeaders() }),
        // Ten seconds. Long enough not to be chatty, short enough that a
        // dashboard reacts while someone is still looking at it.
        exportIntervalMillis: 10_000
      })
    ]
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const meter = meterProvider.getMeter(SERVICE_NAME);

  // An observable gauge rather than a counter: liveness is a state to be read on
  // every collection, not an event to be counted. If the process is gone the
  // series simply stops, which is what "unhealthy" looks like on a graph.
  meter
    .createObservableGauge('fieldlines.health', {
      description: '1 while the API process is serving requests'
    })
    .addCallback((result) => result.observe(1, { service: SERVICE_NAME }));

  meter
    .createObservableGauge('fieldlines.uptime.seconds', {
      description: 'Seconds since the API process started',
      unit: 's'
    })
    .addCallback((result) => result.observe(process.uptime(), { service: SERVICE_NAME }));

  requestCounter = meter.createCounter('fieldlines.requests', {
    description: 'Requests handled, split by route, method and status'
  });

  durationHistogram = meter.createHistogram('fieldlines.request.duration', {
    description: 'Request duration',
    unit: 'ms'
  });

  return meterProvider;
}

/**
 * Whether telemetry has anywhere to send to.
 *
 * Reported by the health check as information, never as a verdict: an
 * unreachable collector does not make the review queue unhealthy.
 */
export function telemetryStatus(): { configured: boolean; endpoint: string | null } {
  const endpoint = resolveEndpoint() ?? null;
  return { configured: Boolean(endpoint), endpoint };
}

/** Record one handled request. Never throws — telemetry must not break serving. */
export function recordRequest(route: string, method: string, status: number, durationMs: number): void {
  try {
    getMeterProvider();
    const attributes = { route, method, status: String(status), outcome: status >= 500 ? 'error' : 'ok' };
    requestCounter?.add(1, attributes);
    durationHistogram?.record(durationMs, attributes);
  } catch {
    // Deliberately silent.
  }
}

/** Push everything queued. Must be awaited before a serverless handler returns. */
export async function flush(): Promise<void> {
  try {
    await getProvider()?.forceFlush();
    await meterProvider?.forceFlush();
  } catch {
    // A telemetry failure must never become an application failure.
  }
}

/**
 * Run `fn` inside a span, recording any thrown error on it before rethrowing.
 *
 * `recordException` plus an ERROR status is exactly the shape Mission Control
 * looks for: it reads `exception.type`, `exception.message` and
 * `exception.stacktrace` off the span event, and the stack is what locates the
 * file and line to fix.
 */
export async function withSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
  getProvider();
  const tracer = trace.getTracer(SERVICE_NAME);

  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw err;
    } finally {
      span.end();
    }
  });
}

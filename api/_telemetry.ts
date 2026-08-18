/**
 * OpenTelemetry wiring for the Fieldlines API.
 *
 * Traces go straight to Mission Control's own OTLP receiver — there is no
 * third-party telemetry vendor in this demo. Mission Control accepts OTLP over
 * HTTP at `/v1/traces` with a bearer ingest key, sifts spans carrying an
 * exception event, and turns the ones that look like code defects into fix
 * stories. Any OTel SDK or Collector that speaks OTLP/HTTP would work the same
 * way; nothing here is Mission-Control-specific except the URL and the header.
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
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { SpanStatusCode, trace, type Span } from '@opentelemetry/api';

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'fieldlines-api';

let provider: NodeTracerProvider | undefined;

/**
 * Build the provider once per warm container.
 *
 * Returns undefined when no endpoint is configured, so the app runs perfectly
 * well with telemetry switched off — a missing environment variable must not
 * take down the supervisor's review queue.
 */
function getProvider(): NodeTracerProvider | undefined {
  if (provider) return provider;

  const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!url) return undefined;

  const ingestKey = process.env.MISSION_CONTROL_INGEST_KEY;

  provider = new NodeTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'
    }),
    spanProcessors: [
      new SimpleSpanProcessor(
        new OTLPTraceExporter({
          url,
          headers: ingestKey ? { Authorization: `Bearer ${ingestKey}` } : {}
        })
      )
    ]
  });
  provider.register();
  return provider;
}

/** Push everything queued. Must be awaited before a serverless handler returns. */
export async function flush(): Promise<void> {
  try {
    await getProvider()?.forceFlush();
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

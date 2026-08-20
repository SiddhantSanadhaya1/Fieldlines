/**
 * Health check — GET /api/health.
 *
 * Two audiences, one response.
 *
 * A load balancer or uptime monitor reads the status code: 200 means take
 * traffic, 503 means do not. A human reads the body, which says *what* is
 * degraded rather than only that something is.
 *
 * The check is deliberately shallow. It reports on this process and the things
 * it owns — never on Mission Control or the collector. A dependency being down
 * must not make this service report itself unhealthy and get pulled out of
 * rotation, because the review queue still works perfectly well when telemetry
 * has nowhere to go. Telemetry is reported as `configured` or not, which is
 * information, not a verdict.
 */
import { JOBS_BY_ID } from '../src/app/fixtures.js';
import { flush, recordRequest, telemetryStatus, withSpan } from './_telemetry.js';

export interface HealthReport {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  uptimeSeconds: number;
  checks: {
    /** The job store answers and is not empty. */
    jobStore: { ok: boolean; jobs: number; detail?: string };
    /** Whether traces and metrics have somewhere to go. Never fails the check. */
    telemetry: { configured: boolean; endpoint: string | null };
  };
}

export function buildHealthReport(): HealthReport {
  let jobs = 0;
  let jobStoreOk = false;
  let detail: string | undefined;

  try {
    jobs = JOBS_BY_ID.size;
    jobStoreOk = jobs > 0;
    if (!jobStoreOk) detail = 'job store loaded but empty';
  } catch (error) {
    detail = error instanceof Error ? error.message : String(error);
  }

  const telemetry = telemetryStatus();

  return {
    status: jobStoreOk ? 'ok' : 'degraded',
    service: process.env.OTEL_SERVICE_NAME ?? 'fieldlines-api',
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev',
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      jobStore: { ok: jobStoreOk, jobs, ...(detail ? { detail } : {}) },
      telemetry
    }
  };
}

interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  const started = Date.now();
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('cache-control', 'no-store');

  try {
    const report = await withSpan('GET /api/health', async (span) => {
      const built = buildHealthReport();
      span.setAttribute('health.status', built.status);
      span.setAttribute('health.jobs', built.checks.jobStore.jobs);
      return built;
    });

    const status = report.status === 'ok' ? 200 : 503;
    recordRequest('/api/health', request.method ?? 'GET', status, Date.now() - started);
    response.status(status).json(report);
  } catch (error) {
    recordRequest('/api/health', request.method ?? 'GET', 500, Date.now() - started);
    response.status(500).json({
      status: 'degraded',
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    await flush();
  }
}

/**
 * Supervisor verdict endpoint — POST /api/verdict.
 *
 * A supervisor reviewing the queue accepts, rejects or returns a completed job.
 * The verdict is not just a status change: closing a job writes a closure audit
 * record, because a field-service job that has been signed off is evidence in a
 * dispute months later. The audit re-derives the risk score server-side rather
 * than trusting the number the browser displayed, so a tampered or stale client
 * cannot close a high-risk job as low-risk.
 *
 * The client sends only `{ jobId, verdict }`. Everything else is looked up here —
 * the server owns the job record.
 */
import { calculateRiskScore } from '../src/domain/risk/risk-scorer.js';
import { isMeasurementOutOfRange } from '../src/components/job-detail/helpers.js';
import { JOBS_BY_ID } from '../src/app/fixtures.js';
import type { DetailedJobData } from '../src/components/job-detail/types.js';
import { flush, recordRequest, withSpan } from './_telemetry.js';

export type Verdict = 'ACCEPT' | 'REJECT' | 'REWORK';

export interface VerdictRecord {
  verdict: Verdict;
  at: string;
  supervisor: string;
}

export interface ClosureAudit {
  jobId: string;
  verdict: Verdict;
  /** Score recomputed here, not taken from the client. */
  recomputedScore: number;
  /** The score the reviewer saw, for comparison. */
  displayedScore: number;
  scoreMatches: boolean;
  supersedes: VerdictRecord | null;
  closedAt: string;
}

/**
 * Verdicts already recorded, keyed by job id.
 *
 * In-memory for the demo; a real deployment would read this from the job store.
 * A job that has never been actioned simply has no entry.
 */
const verdictHistory: Record<string, VerdictRecord[]> = {};

/**
 * Re-derive the risk factors from the job record.
 *
 * Mirrors how the queue builds its scores: failed checks are findings flagged as
 * risk factors, out-of-range is measurements outside their tolerance band, and
 * overrides are procedure steps the technician overrode.
 */
function factorsFor(job: DetailedJobData) {
  return {
    overridesCount: job.steps.filter((step) => step.status === 'OVERRIDDEN').length,
    outOfRangeCount: job.measurements.filter((measurement) => isMeasurementOutOfRange(measurement)).length,
    failedChecksCount: job.findings.filter((finding) => finding.isRiskFactor).length,
    isNewProcedure: false
  };
}

/**
 * Build the closure audit record for a verdict.
 *
 * A supervisor may re-open and re-action a job, so the audit records which
 * earlier verdict this one supersedes — an accept that quietly overwrites a
 * previous reject is exactly the thing an auditor asks about.
 */
export function buildClosureAudit(job: DetailedJobData, verdict: Verdict, now: Date): ClosureAudit {
  const recomputed = calculateRiskScore(factorsFor(job));

  const history = verdictHistory[job.id];
  const supersedes = history?.at(-1) ?? null;

  return {
    jobId: job.id,
    verdict,
    recomputedScore: recomputed.score,
    displayedScore: job.riskScore,
    scoreMatches: recomputed.score === job.riskScore,
    supersedes,
    closedAt: now.toISOString()
  };
}

function recordVerdict(jobId: string, record: VerdictRecord): void {
  const history = verdictHistory[jobId] ?? [];
  history.push(record);
  verdictHistory[jobId] = history;
}

export interface VerdictRequest {
  jobId?: unknown;
  verdict?: unknown;
  supervisor?: unknown;
}

const VERDICTS: ReadonlySet<string> = new Set(['ACCEPT', 'REJECT', 'REWORK']);

/**
 * Framework-free core, so it can be mounted by the Vercel adapter below, by the
 * local dev server, and by tests, without any of them agreeing on a request type.
 */
export async function handleVerdict(
  body: VerdictRequest
): Promise<{ status: number; payload: Record<string, unknown> }> {
  const jobId = typeof body.jobId === 'string' ? body.jobId : '';
  const verdict = typeof body.verdict === 'string' ? body.verdict : '';
  const supervisor = typeof body.supervisor === 'string' ? body.supervisor : 'unknown supervisor';

  if (!jobId || !VERDICTS.has(verdict)) {
    return { status: 400, payload: { error: 'jobId and a verdict of ACCEPT, REJECT or REWORK are required' } };
  }

  const job = JOBS_BY_ID.get(jobId);
  if (!job) {
    return { status: 404, payload: { error: `No job ${jobId}` } };
  }

  const audit = buildClosureAudit(job, verdict as Verdict, new Date());
  recordVerdict(jobId, { verdict: verdict as Verdict, at: audit.closedAt, supervisor });

  return { status: 200, payload: { ok: true, audit } };
}

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  const started = Date.now();
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (request.method === 'OPTIONS') {
    response.status(204).json({});
    return;
  }
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'POST only' });
    return;
  }

  const body = (typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body ?? {}) as VerdictRequest;

  try {
    const result = await withSpan('POST /api/verdict', async (span) => {
      span.setAttribute('job.id', String(body.jobId ?? ''));
      span.setAttribute('job.verdict', String(body.verdict ?? ''));
      return handleVerdict(body);
    });
    recordRequest('/api/verdict', request.method ?? 'POST', result.status, Date.now() - started);
    response.status(result.status).json(result.payload);
  } catch (error) {
    // The exception is already recorded on the span by withSpan. Answer the
    // browser with a 500 rather than letting the platform return an opaque one,
    // so the reviewer sees that the verdict did not stick.
    recordRequest('/api/verdict', request.method ?? 'POST', 500, Date.now() - started);
    response.status(500).json({
      error: 'Could not record the verdict',
      detail: error instanceof Error ? error.message : String(error)
    });
  } finally {
    // Serverless containers freeze on return; an unflushed span is a lost span.
    await flush();
  }
}

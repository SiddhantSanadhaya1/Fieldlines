/**
 * Browser-side client for the supervisor verdict endpoint.
 *
 * The queue used to apply a verdict optimistically in memory. It now tells the
 * server, because closing a job writes a closure audit record and re-derives the
 * risk score server-side — neither of which can be trusted to the client.
 *
 * The UI still updates immediately; this reports back so a failure can be shown
 * rather than swallowed. A supervisor who thinks a job is closed when it is not
 * is worse than one who sees an error.
 */
export type Verdict = 'ACCEPT' | 'REJECT' | 'REWORK';

export interface VerdictOutcome {
  ok: boolean;
  /** Present when the server refused or failed. */
  error?: string;
}

/** Where the API lives. Same origin in production; overridable for local dev. */
const API_BASE = (import.meta.env?.VITE_API_BASE as string | undefined) ?? '';

export async function submitVerdict(
  jobId: string,
  verdict: Verdict,
  supervisor = 'Supervisor'
): Promise<VerdictOutcome> {
  try {
    const response = await fetch(`${API_BASE}/api/verdict`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobId, verdict, supervisor })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string; detail?: string };
      return { ok: false, error: payload.detail ?? payload.error ?? `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    // A network failure is not the same as a server refusal, but from the
    // supervisor's point of view both mean "the verdict did not stick".
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Browser entry point for the supervisor review queue.
 *
 * This file is glue only. All behaviour lives in the tested controllers:
 *   - ReviewQueueTableController  (FIEL-60)
 *   - JobDetailViewController     (FIEL-59)
 *   - calculateRiskScore          (FIEL-53)
 *
 * Nothing here reimplements sorting, risk levels, range checks or tab state —
 * it renders what those controllers produce and forwards DOM events back into
 * them.
 */

import { ReviewQueueTableController } from '../components/review-queue/ReviewQueueTable.js';
import { JobDetailViewController } from '../components/job-detail/JobDetailView.js';
import type { SortableColumn } from '../components/review-queue/types.js';
import type { DetailedJobData, JobDetailTab } from '../components/job-detail/types.js';
import { JOBS, JOBS_BY_ID, toQueueItems, scoreBreakdownFor } from './fixtures.js';
import { submitVerdict } from '../api/job-ingest/verdict-client.js';

type Verdict = 'ACCEPT' | 'REJECT' | 'REWORK';

const root = document.getElementById('app')!;
const toastHost = document.getElementById('toast-host')!;

/** Jobs still awaiting review. A verdict removes a job from this list. */
let openJobs: DetailedJobData[] = [...JOBS];

/** Which job is open in the detail view, or null when showing the queue. */
let openJobId: string | null = null;

/** Verdicts submitted and not yet answered, so the buttons can be disabled. */
const pendingVerdicts = new Set<string>();

/**
 * Jobs whose last verdict was refused by the server, with the reason.
 *
 * Held in state rather than announced once, because a toast that expires is not
 * a record of anything — a supervisor who looked away has no way to learn the
 * closure failed.
 */
const failedVerdicts = new Map<string, string>();

let queue = buildQueue();
let detail: JobDetailViewController | null = null;

function buildQueue(): ReviewQueueTableController {
  return new ReviewQueueTableController({
    jobs: toQueueItems(openJobs),
    defaultSortColumn: 'riskScore',
    defaultSortDirection: 'desc',
    onSelectJob: (jobId) => {
      openJobId = jobId;
      detail = new JobDetailViewController({
        job: JOBS_BY_ID.get(jobId)!,
        onClose: () => {
          openJobId = null;
          detail = null;
          render();
        },
        onActionVerdict: (id, verdict) => applyVerdict(id, verdict),
      });
      render();
    },
  });
}

const VERDICT_WORDING: Record<Verdict, string> = {
  ACCEPT: 'accepted and closed',
  REWORK: 'returned to the technician for rework',
  REJECT: 'rejected',
};

/**
 * Apply a supervisor's verdict, once the server has confirmed it.
 *
 * The job is not removed and nothing is announced until the closure audit has
 * actually been written. An earlier version updated the queue immediately and
 * showed "accepted and closed" straight away, then quietly put the job back if
 * the server refused — so a failed closure read as a successful one for as long
 * as it took the request to come back, and the correction was a toast that
 * expired in four seconds.
 *
 * For an action whose entire purpose is producing an audit record, claiming
 * success before that record exists is the one thing this screen must not do.
 */
function applyVerdict(jobId: string, verdict: Verdict): void {
  const job = JOBS_BY_ID.get(jobId);
  if (!job || pendingVerdicts.has(jobId)) return;

  pendingVerdicts.add(jobId);
  render();

  void submitVerdict(jobId, verdict).then((outcome) => {
    pendingVerdicts.delete(jobId);

    if (!outcome.ok) {
      // The job stays exactly where it is. The only thing that changes is that
      // the failure is now recorded against it and shown in the queue, so it
      // does not depend on catching a toast.
      failedVerdicts.set(jobId, outcome.error ?? 'server error');
      render();
      toast(`Job ${jobId} could not be closed — ${outcome.error ?? 'server error'}.`, 'REJECT');
      return;
    }

    failedVerdicts.delete(jobId);
    openJobs = openJobs.filter((j) => j.id !== jobId);
    openJobId = null;
    detail = null;
    queue = buildQueue();
    render();
    toast(`Job ${jobId} — ${job.jobType} ${VERDICT_WORDING[verdict]}.`, verdict);
  });
}

// ---------------------------------------------------------------------------
// Presentation helpers — formatting only, no business logic.
// ---------------------------------------------------------------------------

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * The controllers emit ISO timestamps, which the tests assert on. Rather than
 * change them, rewrite the rendered text in place for readability.
 */
function humaniseDates(scope: HTMLElement): void {
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (ISO_PATTERN.test(node.textContent?.trim() ?? '')) targets.push(node);
  }
  for (const node of targets) {
    const d = new Date(node.textContent!.trim());
    node.textContent = d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

/** Sidebar showing how the score was reached, using the scorer's own breakdown. */
function renderScorePanel(jobId: string): string {
  const result = scoreBreakdownFor(jobId);
  if (!result) return '';

  const rows: Array<[string, number, string]> = [
    ['Overrides', result.breakdown.overridesPoints, `${result.factors.overridesCount} × 3`],
    ['Out of range', result.breakdown.outOfRangePoints, `${result.factors.outOfRangeCount} × 2`],
    ['Failed checks', result.breakdown.failedChecksPoints, `${result.factors.failedChecksCount} × 2`],
    ['New procedure', result.breakdown.newProcedurePoints, result.factors.isNewProcedure ? '1 × 1' : '0 × 1'],
  ];

  const rowHTML = rows
    .map(
      ([label, points, workings]) => `
      <div class="score-row ${points > 0 ? 'contributes' : ''}">
        <span class="score-label">${label}</span>
        <span class="score-workings">${workings}</span>
        <span class="score-points">${points}</span>
      </div>`
    )
    .join('');

  return `
    <aside class="score-panel">
      <h3>Why this score</h3>
      <div class="score-rows">${rowHTML}</div>
      <div class="score-total">
        <span>Total</span>
        <span class="score-total-value">${result.score}</span>
      </div>
      <p class="score-note">Computed by <code>calculateRiskScore()</code> from this job's own steps, measurements and findings.</p>
    </aside>
  `;
}

function toast(message: string, verdict: Verdict): void {
  const el = document.createElement('div');
  el.className = `toast toast-${verdict.toLowerCase()}`;
  el.textContent = message;
  toastHost.appendChild(el);
  setTimeout(() => el.classList.add('leaving'), 3600);
  setTimeout(() => el.remove(), 4100);
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

/**
 * A banner naming a refused closure, shown on the job itself.
 *
 * Persistent on purpose. The failure is the thing a supervisor most needs to
 * know about, and a message that disappears after four seconds is not a way to
 * tell anyone anything.
 */
function renderVerdictFailure(jobId: string): string {
  const reason = failedVerdicts.get(jobId);
  if (!reason) return '';
  return `
    <div class="verdict-error" role="alert">
      <strong>This job could not be closed.</strong>
      <span>${reason}</span>
      <span class="verdict-error-note">The verdict was not recorded. The job remains in the review queue.</span>
    </div>`;
}

function render(): void {
  if (openJobId && detail) {
    root.innerHTML = `
      <div class="detail-layout">
        <div>
          ${renderVerdictFailure(openJobId)}
          ${detail.renderHTML()}
        </div>
        ${renderScorePanel(openJobId)}
      </div>`;
    // Submitting is in flight: stop a second click producing a second verdict.
    if (pendingVerdicts.has(openJobId)) {
      for (const button of root.querySelectorAll<HTMLButtonElement>('.btn-verdict')) {
        button.disabled = true;
        button.textContent = 'Recording…';
      }
    }
  } else {
    const total = openJobs.length;
    const highRisk = openJobs.filter((j) => j.riskScore >= 10).length;
    root.innerHTML = `
      <section class="queue-panel">
        <div class="queue-toolbar">
          <div class="queue-counts">
            <strong>${total}</strong> awaiting review
            ${highRisk > 0 ? `<span class="count-high">${highRisk} high risk</span>` : ''}
          </div>
          <div class="legend">
            <span class="badge badge-high">High ≥ 10</span>
            <span class="badge badge-medium">Medium 5–9</span>
            <span class="badge badge-low">Low &lt; 5</span>
          </div>
        </div>
        ${total > 0 ? queue.renderHTML() : `<p class="empty-state">Queue clear. Every completed job has been reviewed.</p>`}
      </section>`;
  }
  humaniseDates(root);
}

// ---------------------------------------------------------------------------
// Event delegation — forwards DOM events into the controllers.
// ---------------------------------------------------------------------------

root.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;

  const header = target.closest<HTMLElement>('th[data-sort-key]');
  if (header) {
    queue.handleHeaderClick(header.dataset.sortKey as SortableColumn);
    render();
    return;
  }

  const row = target.closest<HTMLElement>('tr[data-job-id]');
  if (row && !detail) {
    queue.handleRowClick(row.dataset.jobId!);
    return;
  }

  if (!detail) return;

  if (target.closest('.btn-close-view')) {
    detail.closeView();
    return;
  }

  const tab = target.closest<HTMLElement>('.tab-btn');
  if (tab) {
    detail.setActiveTab(tab.dataset.tab as JobDetailTab);
    render();
    return;
  }

  const thumb = target.closest<HTMLElement>('.evidence-thumbnail');
  if (thumb) {
    const job = JOBS_BY_ID.get(openJobId!)!;
    const image = job.evidence.find((e) => e.id === thumb.dataset.evidenceId);
    if (image) {
      detail.openLightbox(image);
      render();
    }
    return;
  }

  if (target.closest('.lightbox-close-btn') || target.classList.contains('lightbox-modal')) {
    detail.closeLightbox();
    render();
    return;
  }

  const verdict = target.closest<HTMLElement>('.btn-verdict');
  if (verdict) {
    detail.submitVerdict(verdict.dataset.verdict as Verdict);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !detail) return;
  if (detail.getActiveLightboxImage()) {
    detail.closeLightbox();
    render();
  } else {
    detail.closeView();
  }
});

render();

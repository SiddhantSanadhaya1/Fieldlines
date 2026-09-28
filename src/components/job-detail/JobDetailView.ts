import {
  DetailedJobData,
  EvidenceMedia,
  JobDetailTab,
  JobDetailViewProps,
  ProcedureStepItem,
} from './types.js';
import { formatConfidence, isMeasurementOutOfRange } from './helpers.js';
import { getRiskLevel } from '../review-queue/helpers.js';

export class JobDetailViewController {
  private job: DetailedJobData;
  private activeTab: JobDetailTab;
  private activeLightboxImage?: EvidenceMedia;
  private onClose?: () => void;
  private onActionVerdict?: (
    jobId: string,
    verdict: 'ACCEPT' | 'REJECT' | 'REWORK'
  ) => void;

  constructor(props: JobDetailViewProps) {
    this.job = props.job;
    this.activeTab = props.defaultTab || 'overview';
    this.onClose = props.onClose;
    this.onActionVerdict = props.onActionVerdict;
  }

  public getJob(): DetailedJobData {
    return this.job;
  }

  public getActiveTab(): JobDetailTab {
    return this.activeTab;
  }

  public setActiveTab(tab: JobDetailTab): void {
    this.activeTab = tab;
  }

  public openLightbox(image: EvidenceMedia): void {
    this.activeLightboxImage = image;
  }

  public closeLightbox(): void {
    this.activeLightboxImage = undefined;
  }

  public getActiveLightboxImage(): EvidenceMedia | undefined {
    return this.activeLightboxImage;
  }

  public submitVerdict(verdict: 'ACCEPT' | 'REJECT' | 'REWORK'): void {
    if (this.onActionVerdict) {
      this.onActionVerdict(this.job.id, verdict);
    }
  }

  public closeView(): void {
    if (this.onClose) {
      this.onClose();
    }
  }

  public renderHTML(): string {
    const riskLevel = getRiskLevel(this.job.riskScore);
    const levelWord = riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase();

    const tabs: Array<[JobDetailTab, string, number | null]> = [
      ['overview', 'Timeline', null],
      ['steps', 'Steps and evidence', this.job.steps.length],
      ['findings', 'Findings', this.job.findings.length],
      ['measurements', 'Measurements', this.job.measurements.length],
    ];

    const tabsHTML = `
      <div class="tab-bar" role="tablist" aria-label="Job record">
        ${tabs
          .map(
            ([key, label, count]) => `
          <button type="button" role="tab" data-tab="${key}" aria-selected="${this.activeTab === key}" class="tab-btn ${this.activeTab === key ? 'active' : ''}">${label}${count === null ? '' : ` <span class="tab-count">${count}</span>`}</button>`
          )
          .join('')}
      </div>
    `.trim();

    let tabContentHTML = '';

    if (this.activeTab === 'overview') {
      const timelineHTML = this.job.timeline
        .map(
          (t) => `
          <li class="timeline-item">
            <span class="timeline-time">${new Date(t.timestamp).toISOString()}</span>
            <span class="timeline-event">${t.event}</span>
            <span class="timeline-actor">${t.actor}</span>
          </li>
        `
        )
        .join('');

      tabContentHTML = `
        <div class="tab-content overview-content" role="tabpanel">
          <dl class="job-meta-grid">
            <div><dt>Technician</dt><dd>${this.job.technicianName}</dd></div>
            <div><dt>Job type</dt><dd>${this.job.jobType}</dd></div>
            <div><dt>Status</dt><dd>${this.job.status}</dd></div>
            <div><dt>Completed</dt><dd>${new Date(this.job.completedAt).toISOString()}</dd></div>
          </dl>
          <h3>What happened on the visit</h3>
          <ol class="timeline-list">${timelineHTML}</ol>
        </div>
      `;
    } else if (this.activeTab === 'steps') {
      const statusWord: Record<ProcedureStepItem['status'], string> = {
        COMPLETED: 'Done',
        OVERRIDDEN: 'Overridden',
        SKIPPED: 'Skipped',
      };
      const stepsHTML = this.job.steps
        .map((step, index) => {
          const stepEvidence = this.job.evidence.filter(
            (e) => e.stepId === step.id
          );
          const thumbnailsHTML = stepEvidence
            .map(
              (e) => `
              <button type="button" class="evidence-thumbnail" data-evidence-id="${e.id}" aria-label="Open photo: ${e.caption || 'Evidence'}">
                <img src="${e.url}" alt="${e.caption || 'Evidence'}" />
              </button>
            `
            )
            .join('');

          return `
            <li class="step-card step-status-${step.status.toLowerCase()}">
              <span class="step-index">${index + 1}</span>
              <div class="step-body">
                <h4>${step.title} <span class="step-status-tag">${statusWord[step.status]}</span></h4>
                ${step.notes ? `<p class="step-notes">${step.notes}</p>` : ''}
                <div class="step-evidence-gallery">${thumbnailsHTML}</div>
              </div>
            </li>
          `;
        })
        .join('');

      tabContentHTML = `<div class="tab-content steps-content" role="tabpanel"><ol class="step-list">${stepsHTML}</ol></div>`;
    } else if (this.activeTab === 'findings') {
      const findingsHTML = this.job.findings
        .map(
          (f) => `
          <div class="finding-card ${f.isRiskFactor ? 'risk-finding' : ''}">
            <span class="finding-label">${f.label}</span>
            ${f.isRiskFactor ? '<span class="finding-flag">Counts toward risk</span>' : ''}
            <span class="confidence-badge">${formatConfidence(f.confidence)} Confidence</span>
          </div>
        `
        )
        .join('');

      tabContentHTML = `<div class="tab-content findings-content" role="tabpanel">${findingsHTML}</div>`;
    } else if (this.activeTab === 'measurements') {
      const measurementsHTML = this.job.measurements
        .map((m) => {
          const outOfRange = isMeasurementOutOfRange(m);
          return `
            <div class="measurement-card ${outOfRange ? 'out-of-range' : 'normal'}">
              <span class="measurement-label">${m.label}</span>
              <span class="measurement-value">${m.value} ${m.unit}</span>
              <span class="measurement-range">Expected ${m.minRange} to ${m.maxRange} ${m.unit}</span>
              <span class="range-status-tag">${outOfRange ? 'OUT OF RANGE' : 'NORMAL'}</span>
            </div>
          `;
        })
        .join('');

      tabContentHTML = `<div class="tab-content measurements-content" role="tabpanel">${measurementsHTML}</div>`;
    }

    let lightboxModalHTML = '';
    if (this.activeLightboxImage) {
      lightboxModalHTML = `
        <div class="lightbox-modal" role="dialog" aria-modal="true" aria-label="Evidence photo">
          <div class="lightbox-content">
            <button type="button" class="lightbox-close-btn" aria-label="Close photo">&times;</button>
            <img src="${this.activeLightboxImage.url}" alt="${this.activeLightboxImage.caption || 'Evidence Preview'}" />
            <p class="lightbox-caption">${this.activeLightboxImage.caption || ''}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="job-detail-view" data-job-id="${this.job.id}">
        <header class="detail-header">
          <button type="button" class="btn-close-view">&larr; Review queue</button>
          <div class="detail-title">
            <h2><span class="detail-job-type">${this.job.jobType}</span> <span class="detail-job-id">Job #${this.job.id}</span></h2>
            <p class="detail-sub">${this.job.technicianName}</p>
          </div>
          <span class="badge badge-${riskLevel.toLowerCase()} badge-lg"><span class="risk-num">${this.job.riskScore}</span><span class="risk-word">${levelWord} risk</span></span>
        </header>

        ${tabsHTML}
        ${tabContentHTML}

        <footer class="verdict-bar">
          <p class="verdict-prompt">Your decision is recorded in the job's closure audit.</p>
          <div class="verdict-actions">
            <button type="button" data-verdict="REJECT" class="btn-verdict btn-reject">Reject</button>
            <button type="button" data-verdict="REWORK" class="btn-verdict btn-rework">Send back for rework</button>
            <button type="button" data-verdict="ACCEPT" class="btn-verdict btn-accept">Accept job</button>
          </div>
        </footer>

        ${lightboxModalHTML}
      </div>
    `.trim();
  }
}

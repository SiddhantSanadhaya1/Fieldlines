import {
  DetailedJobData,
  EvidenceMedia,
  JobDetailTab,
  JobDetailViewProps,
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

    const tabsHTML = `
      <div class="tab-bar">
        <button data-tab="overview" class="tab-btn ${this.activeTab === 'overview' ? 'active' : ''}">Overview & Timeline</button>
        <button data-tab="steps" class="tab-btn ${this.activeTab === 'steps' ? 'active' : ''}">Steps & Evidence (${this.job.steps.length})</button>
        <button data-tab="findings" class="tab-btn ${this.activeTab === 'findings' ? 'active' : ''}">Findings (${this.job.findings.length})</button>
        <button data-tab="measurements" class="tab-btn ${this.activeTab === 'measurements' ? 'active' : ''}">Measurements (${this.job.measurements.length})</button>
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
            <span class="timeline-actor">by ${t.actor}</span>
          </li>
        `
        )
        .join('');

      tabContentHTML = `
        <div class="tab-content overview-content">
          <div class="job-meta-grid">
            <div><strong>Technician:</strong> ${this.job.technicianName}</div>
            <div><strong>Job Type:</strong> ${this.job.jobType}</div>
            <div><strong>Status:</strong> ${this.job.status}</div>
            <div><strong>Completed At:</strong> ${new Date(this.job.completedAt).toISOString()}</div>
          </div>
          <h3>Execution Timeline</h3>
          <ul class="timeline-list">${timelineHTML}</ul>
        </div>
      `;
    } else if (this.activeTab === 'steps') {
      const stepsHTML = this.job.steps
        .map((step) => {
          const stepEvidence = this.job.evidence.filter(
            (e) => e.stepId === step.id
          );
          const thumbnailsHTML = stepEvidence
            .map(
              (e) => `
              <img src="${e.url}" alt="${e.caption || 'Evidence'}" data-evidence-id="${e.id}" class="evidence-thumbnail" />
            `
            )
            .join('');

          return `
            <div class="step-card step-status-${step.status.toLowerCase()}">
              <h4>${step.title} <span class="step-status-tag">${step.status}</span></h4>
              ${step.notes ? `<p class="step-notes">${step.notes}</p>` : ''}
              <div class="step-evidence-gallery">${thumbnailsHTML}</div>
            </div>
          `;
        })
        .join('');

      tabContentHTML = `<div class="tab-content steps-content">${stepsHTML}</div>`;
    } else if (this.activeTab === 'findings') {
      const findingsHTML = this.job.findings
        .map(
          (f) => `
          <div class="finding-card ${f.isRiskFactor ? 'risk-finding' : ''}">
            <span class="finding-label">${f.label}</span>
            <span class="confidence-badge">${formatConfidence(f.confidence)} Confidence</span>
          </div>
        `
        )
        .join('');

      tabContentHTML = `<div class="tab-content findings-content">${findingsHTML}</div>`;
    } else if (this.activeTab === 'measurements') {
      const measurementsHTML = this.job.measurements
        .map((m) => {
          const outOfRange = isMeasurementOutOfRange(m);
          return `
            <div class="measurement-card ${outOfRange ? 'out-of-range' : 'normal'}">
              <span class="measurement-label">${m.label}:</span>
              <span class="measurement-value">${m.value} ${m.unit}</span>
              <span class="measurement-range">[Expected: ${m.minRange} - ${m.maxRange} ${m.unit}]</span>
              <span class="range-status-tag">${outOfRange ? 'OUT OF RANGE' : 'NORMAL'}</span>
            </div>
          `;
        })
        .join('');

      tabContentHTML = `<div class="tab-content measurements-content">${measurementsHTML}</div>`;
    }

    let lightboxModalHTML = '';
    if (this.activeLightboxImage) {
      lightboxModalHTML = `
        <div class="lightbox-modal">
          <div class="lightbox-content">
            <button class="lightbox-close-btn">&times;</button>
            <img src="${this.activeLightboxImage.url}" alt="${this.activeLightboxImage.caption || 'Evidence Preview'}" />
            <p class="lightbox-caption">${this.activeLightboxImage.caption || ''}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="job-detail-view" data-job-id="${this.job.id}">
        <header class="detail-header">
          <button class="btn-close-view">&larr; Back</button>
          <h2>Job #${this.job.id} — ${this.job.jobType}</h2>
          <span class="badge badge-${riskLevel.toLowerCase()}">Risk Score: ${this.job.riskScore} (${riskLevel})</span>
        </header>

        ${tabsHTML}
        ${tabContentHTML}

        <footer class="verdict-bar">
          <button data-verdict="ACCEPT" class="btn-verdict btn-accept">Accept Job</button>
          <button data-verdict="REWORK" class="btn-verdict btn-rework">Request Rework</button>
          <button data-verdict="REJECT" class="btn-verdict btn-reject">Reject Job</button>
        </footer>

        ${lightboxModalHTML}
      </div>
    `.trim();
  }
}

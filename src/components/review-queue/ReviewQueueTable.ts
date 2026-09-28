import {
  ReviewQueueItem,
  ReviewQueueTableProps,
  RiskLevel,
  SortableColumn,
  SortDirection,
} from './types.js';
import { getRiskLevel, sortReviewQueueItems, filterByRiskLevel } from './helpers.js';

export class ReviewQueueTableController {
  private jobs: ReviewQueueItem[];
  private currentSortColumn: SortableColumn;
  private currentSortDirection: SortDirection;
  private currentFilter: RiskLevel | null;
  private onSelectJob?: (jobId: string) => void;

  constructor(props: ReviewQueueTableProps) {
    this.jobs = props.jobs;
    this.currentSortColumn = props.defaultSortColumn || 'riskScore';
    this.currentSortDirection = props.defaultSortDirection || 'desc';
    this.currentFilter = props.defaultFilter ?? null;
    this.onSelectJob = props.onSelectJob;
  }

  public getJobs(): ReviewQueueItem[] {
    return this.jobs;
  }

  public getSortedJobs(): ReviewQueueItem[] {
    const filtered = filterByRiskLevel(this.jobs, this.currentFilter);
    return sortReviewQueueItems(
      filtered,
      this.currentSortColumn,
      this.currentSortDirection
    );
  }

  public setFilter(level: RiskLevel | null): void {
    this.currentFilter = level;
  }

  public handleFilterClick(level: RiskLevel): void {
    if (this.currentFilter === level) {
      this.currentFilter = null;
    } else {
      this.currentFilter = level;
    }
  }

  public getFilter(): RiskLevel | null {
    return this.currentFilter;
  }

  public getRiskLevelCounts(): Record<RiskLevel, number> {
    return this.jobs.reduce(
      (counts, job) => {
        const level = getRiskLevel(job.riskScore);
        counts[level]++;
        return counts;
      },
      { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<RiskLevel, number>
    );
  }

  public handleHeaderClick(column: SortableColumn): void {
    if (this.currentSortColumn === column) {
      this.currentSortDirection =
        this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortDirection = 'asc';
    }
  }

  public handleRowClick(jobId: string): void {
    if (this.onSelectJob) {
      this.onSelectJob(jobId);
    }
  }

  public getSortState(): { column: SortableColumn; direction: SortDirection } {
    return {
      column: this.currentSortColumn,
      direction: this.currentSortDirection,
    };
  }

  private renderToolbar(): string {
    const counts = this.getRiskLevelCounts();
    const levels: Array<{ level: RiskLevel; label: string; threshold: string }> = [
      { level: 'HIGH', label: 'High', threshold: '>= 10' },
      { level: 'MEDIUM', label: 'Medium', threshold: '5-9' },
      { level: 'LOW', label: 'Low', threshold: '< 5' },
    ];

    const buttonsHTML = levels
      .map(({ level, label, threshold }) => {
        const isActive = this.currentFilter === level;
        const activeClass = isActive ? ' active' : '';
        const count = counts[level];
        return `<button type="button" class="risk-filter-btn badge-${level.toLowerCase()}${activeClass}" data-filter="${level}">${label} ${threshold} · ${count}</button>`;
      })
      .join('');

    return `<div class="queue-toolbar">${buttonsHTML}</div>`;
  }

  public renderHTML(): string {
    const sorted = this.getSortedJobs();
    const toolbar = this.renderToolbar();

    if (sorted.length === 0 && this.currentFilter !== null) {
      const levelWord = this.currentFilter.toLowerCase();
      return `
        ${toolbar}
        <div class="empty-queue-message">No ${levelWord} risk jobs awaiting review</div>
      `.trim();
    }

    const headers: { label: string; key: SortableColumn; numeric?: boolean }[] = [
      { label: 'Technician', key: 'technicianName' },
      { label: 'Job type', key: 'jobType' },
      { label: 'Completed', key: 'completedAt' },
      { label: 'Findings', key: 'findingsCount', numeric: true },
      { label: 'Overrides', key: 'overridesCount', numeric: true },
      { label: 'Risk', key: 'riskScore' },
    ];

    const headerHTML = headers
      .map(({ label, key, numeric }) => {
        const isSorted = this.currentSortColumn === key;
        const ariaSort = isSorted
          ? this.currentSortDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none';
        const indicator = isSorted
          ? `<span class="sort-indicator" aria-hidden="true">${this.currentSortDirection === 'asc' ? '↑' : '↓'}</span>`
          : '';
        return `<th data-sort-key="${key}" aria-sort="${ariaSort}" class="col-${key}${numeric ? ' num' : ''}"><button type="button" class="sort-btn">${label}${indicator}</button></th>`;
      })
      .join('');

    const rowsHTML = sorted
      .map((job) => {
        const riskLevel = getRiskLevel(job.riskScore);
        const formattedDate =
          job.completedAt instanceof Date
            ? job.completedAt.toISOString()
            : String(job.completedAt);
        const levelWord = riskLevel.charAt(0) + riskLevel.slice(1).toLowerCase();

        return `
        <tr data-job-id="${job.id}" class="queue-row risk-row-${riskLevel.toLowerCase()}" tabindex="0">
          <td class="col-technicianName">${job.technicianName}</td>
          <td class="col-jobType"><span class="job-type-name">${job.jobType}</span><span class="job-ref">${job.id}</span></td>
          <td class="col-completedAt">${formattedDate}</td>
          <td class="col-findingsCount num">${job.findingsCount}</td>
          <td class="col-overridesCount num">${job.overridesCount}</td>
          <td class="col-riskScore">
            <div class="risk-cell"><span class="badge badge-${riskLevel.toLowerCase()}"><span class="risk-num">${job.riskScore}</span><span class="risk-word">${levelWord}</span></span></div>
          </td>
        </tr>`;
      })
      .join('');

    return `
      ${toolbar}
      <table class="review-queue-table">
        <thead>
          <tr>${headerHTML}</tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    `.trim();
  }
}

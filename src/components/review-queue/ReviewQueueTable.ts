import {
  ReviewQueueItem,
  ReviewQueueTableProps,
  RiskLevel,
  SortableColumn,
  SortDirection,
} from './types.js';
import { getRiskLevel, sortReviewQueueItems } from './helpers.js';

export class ReviewQueueTableController {
  private jobs: ReviewQueueItem[];
  private currentSortColumn: SortableColumn;
  private currentSortDirection: SortDirection;
  private activeFilter: RiskLevel | null = null;
  private onSelectJob?: (jobId: string) => void;

  constructor(props: ReviewQueueTableProps) {
    this.jobs = props.jobs;
    this.currentSortColumn = props.defaultSortColumn || 'riskScore';
    this.currentSortDirection = props.defaultSortDirection || 'desc';
    this.onSelectJob = props.onSelectJob;
  }

  public getJobs(): ReviewQueueItem[] {
    return this.jobs;
  }

  public getSortedJobs(): ReviewQueueItem[] {
    const filtered = this.activeFilter
      ? this.jobs.filter((job) => getRiskLevel(job.riskScore) === this.activeFilter)
      : this.jobs;

    return sortReviewQueueItems(
      filtered,
      this.currentSortColumn,
      this.currentSortDirection
    );
  }

  public handleFilterClick(level: RiskLevel): void {
    if (this.activeFilter === level) {
      this.activeFilter = null;
    } else {
      this.activeFilter = level;
    }
  }

  public getActiveFilter(): RiskLevel | null {
    return this.activeFilter;
  }

  public getRiskLevelCounts(): Record<RiskLevel, number> {
    const counts: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const job of this.jobs) {
      const level = getRiskLevel(job.riskScore);
      counts[level]++;
    }
    return counts;
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

  public renderFilterButtons(): string {
    const counts = this.getRiskLevelCounts();
    const filters: Array<{ level: RiskLevel; label: string; threshold: string }> = [
      { level: 'HIGH', label: 'High', threshold: '≥ 10' },
      { level: 'MEDIUM', label: 'Medium', threshold: '5–9' },
      { level: 'LOW', label: 'Low', threshold: '< 5' },
    ];

    return filters
      .map(({ level, label, threshold }) => {
        const count = counts[level];
        const isActive = this.activeFilter === level;
        const activeClass = isActive ? ' active' : '';
        return `<button type="button" class="badge badge-${level.toLowerCase()}${activeClass}" data-filter-level="${level}">${label} ${threshold} · ${count}</button>`;
      })
      .join('');
  }

  public renderHTML(): string {
    const sorted = this.getSortedJobs();

    // Handle empty filter result
    if (sorted.length === 0 && this.activeFilter) {
      const levelName = this.activeFilter.charAt(0) + this.activeFilter.slice(1).toLowerCase();
      return `<p class="empty-state">No ${levelName.toLowerCase()} risk jobs awaiting review.</p>`;
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

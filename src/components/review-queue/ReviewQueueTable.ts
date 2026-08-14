import {
  ReviewQueueItem,
  ReviewQueueTableProps,
  SortableColumn,
  SortDirection,
} from './types.js';
import { getRiskLevel, sortReviewQueueItems } from './helpers.js';

export class ReviewQueueTableController {
  private jobs: ReviewQueueItem[];
  private currentSortColumn: SortableColumn;
  private currentSortDirection: SortDirection;
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
    return sortReviewQueueItems(
      this.jobs,
      this.currentSortColumn,
      this.currentSortDirection
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

  public renderHTML(): string {
    const sorted = this.getSortedJobs();
    const headers: { label: string; key: SortableColumn }[] = [
      { label: 'Technician', key: 'technicianName' },
      { label: 'Job Type', key: 'jobType' },
      { label: 'Completion Time', key: 'completedAt' },
      { label: 'Findings', key: 'findingsCount' },
      { label: 'Overrides', key: 'overridesCount' },
      { label: 'Risk Score', key: 'riskScore' },
    ];

    const headerHTML = headers
      .map(({ label, key }) => {
        const isSorted = this.currentSortColumn === key;
        const arrow = isSorted
          ? this.currentSortDirection === 'asc'
            ? ' ▲'
            : ' ▼'
          : '';
        return `<th data-sort-key="${key}">${label}${arrow}</th>`;
      })
      .join('');

    const rowsHTML = sorted
      .map((job) => {
        const riskLevel = getRiskLevel(job.riskScore);
        const formattedDate =
          job.completedAt instanceof Date
            ? job.completedAt.toISOString()
            : String(job.completedAt);

        return `
        <tr data-job-id="${job.id}" class="queue-row">
          <td>${job.technicianName}</td>
          <td>${job.jobType}</td>
          <td>${formattedDate}</td>
          <td>${job.findingsCount}</td>
          <td>${job.overridesCount}</td>
          <td>
            <span class="badge badge-${riskLevel.toLowerCase()}">
              ${job.riskScore} (${riskLevel})
            </span>
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

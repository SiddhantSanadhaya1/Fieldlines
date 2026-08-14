export type SortDirection = 'asc' | 'desc';

export type SortableColumn =
  | 'technicianName'
  | 'jobType'
  | 'completedAt'
  | 'findingsCount'
  | 'overridesCount'
  | 'riskScore';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReviewQueueItem {
  id: string;
  technicianName: string;
  jobType: string;
  completedAt: string | Date;
  findingsCount: number;
  overridesCount: number;
  riskScore: number;
}

export interface ReviewQueueTableProps {
  jobs: ReviewQueueItem[];
  onSelectJob?: (jobId: string) => void;
  defaultSortColumn?: SortableColumn;
  defaultSortDirection?: SortDirection;
}

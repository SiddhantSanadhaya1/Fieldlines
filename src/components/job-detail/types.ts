export type JobDetailTab = 'overview' | 'steps' | 'findings' | 'measurements';

export interface EvidenceMedia {
  id: string;
  stepId: string;
  url: string;
  caption?: string;
  timestamp: string | Date;
}

export interface FindingItem {
  id: string;
  label: string;
  confidence: number; // 0.0 to 1.0 (e.g. 0.95 = 95%)
  isRiskFactor: boolean;
}

export interface MeasurementItem {
  id: string;
  label: string;
  value: number;
  unit: string;
  minRange: number;
  maxRange: number;
}

export interface ProcedureStepItem {
  id: string;
  title: string;
  status: 'COMPLETED' | 'SKIPPED' | 'OVERRIDDEN';
  notes?: string;
}

export interface TimelineEvent {
  timestamp: string | Date;
  event: string;
  actor: string;
}

export interface DetailedJobData {
  id: string;
  technicianName: string;
  jobType: string;
  status: string;
  riskScore: number;
  completedAt: string | Date;
  steps: ProcedureStepItem[];
  evidence: EvidenceMedia[];
  findings: FindingItem[];
  measurements: MeasurementItem[];
  timeline: TimelineEvent[];
}

export interface JobDetailViewProps {
  job: DetailedJobData;
  onClose?: () => void;
  onActionVerdict?: (jobId: string, verdict: 'ACCEPT' | 'REJECT' | 'REWORK') => void;
  defaultTab?: JobDetailTab;
}

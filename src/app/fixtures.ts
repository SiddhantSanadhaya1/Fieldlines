/**
 * Seed data for the supervisor review queue demo.
 *
 * There is no backend yet (FIEL-31 / FIEL-58 are unbuilt), so the queue reads
 * from this module. Everything downstream of it is real: risk scores are
 * computed by the production scorer in src/domain/risk, and the queue rows are
 * derived from the same job records the detail view renders.
 *
 * Concretely, a job's factors are counted from its own content —
 *   overrides      = steps marked OVERRIDDEN
 *   out-of-range   = measurements failing isMeasurementOutOfRange()
 *   failed checks  = findings flagged isRiskFactor
 * — so a score shown in the table can always be traced back to rows in the
 * detail view. No score is hand-written.
 */

import { calculateRiskScore } from '../domain/risk/risk-scorer.js';
import { isMeasurementOutOfRange } from '../components/job-detail/helpers.js';
import type { ReviewQueueItem } from '../components/review-queue/types.js';
import type {
  DetailedJobData,
  EvidenceMedia,
  FindingItem,
  MeasurementItem,
  ProcedureStepItem,
  TimelineEvent,
} from '../components/job-detail/types.js';
import { evidenceTile } from './evidence.js';

interface JobSeed {
  id: string;
  technicianName: string;
  jobType: string;
  /** Minutes the visit took, used to lay out the timeline. */
  durationMins: number;
  completedAt: string;
  isNewProcedure: boolean;
  steps: ProcedureStepItem[];
  findings: FindingItem[];
  measurements: MeasurementItem[];
  evidence: Array<{ stepId: string; caption: string; tone?: string }>;
}

/**
 * Rebuilds the job state machine (FIEL-72) backwards from completion so the
 * timeline in the detail view reflects a plausible visit shape.
 */
function buildTimeline(seed: JobSeed): TimelineEvent[] {
  const end = new Date(seed.completedAt).getTime();
  const start = end - seed.durationMins * 60_000;
  const at = (fraction: number) => new Date(start + (end - start) * fraction).toISOString();
  const tech = seed.technicianName;

  const events: TimelineEvent[] = [
    { timestamp: at(0), event: 'Job accepted', actor: tech },
    { timestamp: at(0.12), event: 'Travelling to site', actor: tech },
    { timestamp: at(0.34), event: 'Arrived on site', actor: tech },
    { timestamp: at(0.4), event: 'Risk assessment completed', actor: tech },
    { timestamp: at(0.45), event: 'Work started', actor: tech },
  ];

  seed.steps.forEach((step, i) => {
    const fraction = 0.5 + (i / Math.max(seed.steps.length, 1)) * 0.4;
    if (step.status === 'OVERRIDDEN') {
      events.push({ timestamp: at(fraction), event: `Override recorded — ${step.title}`, actor: tech });
    } else if (step.status === 'SKIPPED') {
      events.push({ timestamp: at(fraction), event: `Step skipped — ${step.title}`, actor: tech });
    }
  });

  events.push(
    { timestamp: at(0.95), event: 'Customer sign-off captured', actor: tech },
    { timestamp: at(1), event: 'Job completed and queued for sync', actor: tech },
    { timestamp: at(1), event: 'Synced from device', actor: 'sync-service' }
  );

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

const SEEDS: JobSeed[] = [
  {
    id: 'FL-4821',
    technicianName: 'R. Okonkwo',
    jobType: 'FTTP Install',
    durationMins: 145,
    completedAt: '2026-08-13T16:42:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Confirm ONT location with customer', status: 'COMPLETED' },
      { id: 's2', title: 'Fibre continuity test', status: 'OVERRIDDEN', notes: 'OTDR unavailable — used loaner unit, calibration out of date.' },
      { id: 's3', title: 'Terminate and splice drop cable', status: 'COMPLETED' },
      { id: 's4', title: 'Optical power verification', status: 'OVERRIDDEN', notes: 'Reading outside band; customer accepted service pending recheck.' },
      { id: 's5', title: 'Customer handover and sign-off', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Connector not fully seated at ONT port', confidence: 0.91, isRiskFactor: true },
      { id: 'f2', label: 'Splice enclosure left unsealed', confidence: 0.78, isRiskFactor: true },
      { id: 'f3', label: 'Cable route matches survey', confidence: 0.96, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Optical receive power', value: -29.4, unit: 'dBm', minRange: -27, maxRange: -8 },
      { id: 'm2', label: 'Splice loss', value: 0.62, unit: 'dB', minRange: 0, maxRange: 0.3 },
      { id: 'm3', label: 'Mains supply at ONT', value: 238, unit: 'V', minRange: 216, maxRange: 253 },
    ],
    evidence: [
      { stepId: 's2', caption: 'OTDR trace — loaner unit', tone: 'amber' },
      { stepId: 's4', caption: 'Power meter reading at ONT', tone: 'rose' },
      { stepId: 's5', caption: 'Completed installation', tone: 'teal' },
    ],
  },
  {
    id: 'FL-4807',
    technicianName: 'M. Halvorsen',
    jobType: 'Line Fault Repair',
    durationMins: 96,
    completedAt: '2026-08-13T15:18:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Isolate fault section', status: 'COMPLETED' },
      { id: 's2', title: 'Insulation resistance test', status: 'OVERRIDDEN', notes: 'Meter reading unstable in wet conditions.' },
      { id: 's3', title: 'Replace damaged span', status: 'COMPLETED' },
      { id: 's4', title: 'Post-repair line test', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Corrosion visible on adjacent joint', confidence: 0.84, isRiskFactor: true },
      { id: 'f2', label: 'Repair span correctly tensioned', confidence: 0.93, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Insulation resistance', value: 1.2, unit: 'MΩ', minRange: 10, maxRange: 999 },
      { id: 'm2', label: 'Loop resistance', value: 412, unit: 'Ω', minRange: 0, maxRange: 800 },
    ],
    evidence: [
      { stepId: 's1', caption: 'Fault location', tone: 'slate' },
      { stepId: 's3', caption: 'Replacement span fitted', tone: 'teal' },
    ],
  },
  {
    id: 'FL-4795',
    technicianName: 'D. Ferreira',
    jobType: 'Cabinet Maintenance',
    durationMins: 78,
    completedAt: '2026-08-13T14:05:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Safety gate — traffic management', status: 'COMPLETED' },
      { id: 's2', title: 'Battery health check', status: 'OVERRIDDEN', notes: 'Load bank not available on van.' },
      { id: 's3', title: 'Clean and reseat tie cables', status: 'COMPLETED' },
      { id: 's4', title: 'Thermal survey', status: 'SKIPPED', notes: 'Camera fault — rebooked.' },
    ],
    findings: [
      { id: 'f1', label: 'Battery terminal corrosion', confidence: 0.88, isRiskFactor: true },
      { id: 'f2', label: 'Door seal perished', confidence: 0.72, isRiskFactor: true },
    ],
    measurements: [
      { id: 'm1', label: 'Battery float voltage', value: 51.1, unit: 'V', minRange: 53.5, maxRange: 55.2 },
      { id: 'm2', label: 'Cabinet internal temp', value: 47, unit: '°C', minRange: 0, maxRange: 40 },
    ],
    evidence: [
      { stepId: 's2', caption: 'Battery shelf', tone: 'amber' },
      { stepId: 's3', caption: 'Tie cable dressing', tone: 'indigo' },
    ],
  },
  {
    id: 'FL-4788',
    technicianName: 'S. Whitcombe',
    jobType: 'ONT Replacement',
    durationMins: 54,
    completedAt: '2026-08-13T13:22:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Swap ONT unit', status: 'COMPLETED' },
      { id: 's2', title: 'Record serials fitted and removed', status: 'COMPLETED' },
      { id: 's3', title: 'Service verification', status: 'OVERRIDDEN', notes: 'Customer declined full speed test — meeting in progress.' },
    ],
    findings: [
      { id: 'f1', label: 'Removed unit serial illegible in photo', confidence: 0.69, isRiskFactor: true },
    ],
    measurements: [
      { id: 'm1', label: 'Optical receive power', value: -18.2, unit: 'dBm', minRange: -27, maxRange: -8 },
    ],
    evidence: [{ stepId: 's2', caption: 'Serial label — removed unit', tone: 'rose' }],
  },
  {
    id: 'FL-4770',
    technicianName: 'A. Bianchi',
    jobType: 'Business Fibre Install',
    durationMins: 210,
    completedAt: '2026-08-13T12:47:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Confirm dual-entry resilience path', status: 'COMPLETED' },
      { id: 's2', title: 'Install and label patch panel', status: 'COMPLETED' },
      { id: 's3', title: 'Bidirectional loss test', status: 'OVERRIDDEN', notes: 'Second direction not tested — site access window closed.' },
      { id: 's4', title: 'SLA handover pack', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Patch panel labelling inconsistent with schedule', confidence: 0.81, isRiskFactor: true },
      { id: 'f2', label: 'Resilience path physically separated', confidence: 0.94, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'End-to-end loss (A→B)', value: 0.41, unit: 'dB', minRange: 0, maxRange: 1.5 },
      { id: 'm2', label: 'Return loss', value: 38, unit: 'dB', minRange: 45, maxRange: 70 },
    ],
    evidence: [
      { stepId: 's2', caption: 'Patch panel as installed', tone: 'indigo' },
      { stepId: 's3', caption: 'Loss test result A→B', tone: 'teal' },
    ],
  },
  {
    id: 'FL-4763',
    technicianName: 'K. Adeyemi',
    jobType: 'Drop Cable Replacement',
    durationMins: 88,
    completedAt: '2026-08-13T11:30:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Safety gate — working at height', status: 'COMPLETED' },
      { id: 's2', title: 'Remove damaged drop', status: 'COMPLETED' },
      { id: 's3', title: 'Install replacement drop', status: 'COMPLETED' },
      { id: 's4', title: 'Ground clearance check', status: 'OVERRIDDEN', notes: 'Clearance marginal over private driveway; customer agreed.' },
    ],
    findings: [
      { id: 'f1', label: 'Clearance below standard over vehicle access', confidence: 0.87, isRiskFactor: true },
    ],
    measurements: [
      { id: 'm1', label: 'Ground clearance', value: 4.1, unit: 'm', minRange: 5.5, maxRange: 12 },
      { id: 'm2', label: 'Optical receive power', value: -21.7, unit: 'dBm', minRange: -27, maxRange: -8 },
    ],
    evidence: [
      { stepId: 's3', caption: 'Replacement drop in place', tone: 'teal' },
      { stepId: 's4', caption: 'Clearance over driveway', tone: 'amber' },
    ],
  },
  {
    id: 'FL-4751',
    technicianName: 'M. Halvorsen',
    jobType: 'Splitter Reconfiguration',
    durationMins: 62,
    completedAt: '2026-08-13T10:14:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Confirm target splitter port', status: 'COMPLETED' },
      { id: 's2', title: 'Re-terminate subscriber leg', status: 'COMPLETED' },
      { id: 's3', title: 'Verify no service impact to neighbours', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Port mapping not yet updated in records', confidence: 0.83, isRiskFactor: true },
    ],
    measurements: [
      { id: 'm1', label: 'Splitter output level', value: -14.6, unit: 'dBm', minRange: -25, maxRange: -8 },
    ],
    evidence: [{ stepId: 's2', caption: 'Splitter tray after works', tone: 'indigo' }],
  },
  {
    id: 'FL-4744',
    technicianName: 'J. Castellanos',
    jobType: 'Pole Survey',
    durationMins: 42,
    completedAt: '2026-08-13T09:51:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Safety gate — lone working', status: 'COMPLETED' },
      { id: 's2', title: 'Structural condition assessment', status: 'COMPLETED' },
      { id: 's3', title: 'Photograph pole ID plate', status: 'SKIPPED', notes: 'Plate missing from pole.' },
    ],
    findings: [
      { id: 'f1', label: 'Pole ID plate absent', confidence: 0.95, isRiskFactor: true },
      { id: 'f2', label: 'Base rot indicators present', confidence: 0.66, isRiskFactor: true },
    ],
    measurements: [
      { id: 'm1', label: 'Lean from vertical', value: 7.5, unit: '°', minRange: 0, maxRange: 5 },
    ],
    evidence: [{ stepId: 's2', caption: 'Pole base condition', tone: 'amber' }],
  },
  {
    id: 'FL-4736',
    technicianName: 'R. Okonkwo',
    jobType: 'FTTP Install',
    durationMins: 132,
    completedAt: '2026-08-12T17:20:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Confirm ONT location with customer', status: 'COMPLETED' },
      { id: 's2', title: 'Fibre continuity test', status: 'COMPLETED' },
      { id: 's3', title: 'Terminate and splice drop cable', status: 'COMPLETED' },
      { id: 's4', title: 'Customer handover and sign-off', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Installation matches survey pack', confidence: 0.97, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Optical receive power', value: -17.1, unit: 'dBm', minRange: -27, maxRange: -8 },
      { id: 'm2', label: 'Splice loss', value: 0.11, unit: 'dB', minRange: 0, maxRange: 0.3 },
    ],
    evidence: [{ stepId: 's4', caption: 'Completed installation', tone: 'teal' }],
  },
  {
    id: 'FL-4729',
    technicianName: 'D. Ferreira',
    jobType: 'Line Fault Repair',
    durationMins: 71,
    completedAt: '2026-08-12T16:03:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Isolate fault section', status: 'COMPLETED' },
      { id: 's2', title: 'Replace damaged span', status: 'COMPLETED' },
      { id: 's3', title: 'Post-repair line test', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Fault cause: rodent damage', confidence: 0.89, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Loop resistance', value: 388, unit: 'Ω', minRange: 0, maxRange: 800 },
    ],
    evidence: [{ stepId: 's2', caption: 'Repaired section', tone: 'teal' }],
  },
  {
    id: 'FL-4718',
    technicianName: 'S. Whitcombe',
    jobType: 'Cabinet Maintenance',
    durationMins: 65,
    completedAt: '2026-08-12T14:44:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Safety gate — traffic management', status: 'COMPLETED' },
      { id: 's2', title: 'Battery health check', status: 'COMPLETED' },
      { id: 's3', title: 'Filter replacement', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Cabinet within service tolerance', confidence: 0.91, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Battery float voltage', value: 54.3, unit: 'V', minRange: 53.5, maxRange: 55.2 },
      { id: 'm2', label: 'Cabinet internal temp', value: 31, unit: '°C', minRange: 0, maxRange: 40 },
    ],
    evidence: [{ stepId: 's3', caption: 'New filter fitted', tone: 'indigo' }],
  },
  {
    id: 'FL-4702',
    technicianName: 'K. Adeyemi',
    jobType: 'Business Fibre Install',
    durationMins: 188,
    completedAt: '2026-08-12T13:12:00Z',
    isNewProcedure: true,
    steps: [
      { id: 's1', title: 'Install and label patch panel', status: 'COMPLETED' },
      { id: 's2', title: 'Bidirectional loss test', status: 'COMPLETED' },
      { id: 's3', title: 'SLA handover pack', status: 'OVERRIDDEN', notes: 'Site contact unavailable to countersign.' },
    ],
    findings: [
      { id: 'f1', label: 'Handover pack unsigned', confidence: 0.99, isRiskFactor: true },
      { id: 'f2', label: 'Loss budget within spec both directions', confidence: 0.95, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'End-to-end loss (A→B)', value: 0.52, unit: 'dB', minRange: 0, maxRange: 1.5 },
      { id: 'm2', label: 'End-to-end loss (B→A)', value: 0.58, unit: 'dB', minRange: 0, maxRange: 1.5 },
    ],
    evidence: [{ stepId: 's2', caption: 'Bidirectional test result', tone: 'teal' }],
  },
  {
    id: 'FL-4691',
    technicianName: 'A. Bianchi',
    jobType: 'ONT Replacement',
    durationMins: 47,
    completedAt: '2026-08-12T11:38:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Swap ONT unit', status: 'COMPLETED' },
      { id: 's2', title: 'Record serials fitted and removed', status: 'COMPLETED' },
      { id: 's3', title: 'Service verification', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Service restored and verified', confidence: 0.98, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Optical receive power', value: -16.4, unit: 'dBm', minRange: -27, maxRange: -8 },
    ],
    evidence: [{ stepId: 's2', caption: 'Serial label — fitted unit', tone: 'indigo' }],
  },
  {
    id: 'FL-4684',
    technicianName: 'J. Castellanos',
    jobType: 'Drop Cable Replacement',
    durationMins: 79,
    completedAt: '2026-08-12T10:09:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Safety gate — working at height', status: 'COMPLETED' },
      { id: 's2', title: 'Install replacement drop', status: 'COMPLETED' },
      { id: 's3', title: 'Ground clearance check', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Clearance marginally below standard', confidence: 0.79, isRiskFactor: true },
    ],
    measurements: [
      { id: 'm1', label: 'Ground clearance', value: 5.3, unit: 'm', minRange: 5.5, maxRange: 12 },
    ],
    evidence: [{ stepId: 's2', caption: 'Replacement drop in place', tone: 'teal' }],
  },
  {
    id: 'FL-4677',
    technicianName: 'M. Halvorsen',
    jobType: 'Pole Survey',
    durationMins: 38,
    completedAt: '2026-08-12T09:25:00Z',
    isNewProcedure: false,
    steps: [
      { id: 's1', title: 'Safety gate — lone working', status: 'COMPLETED' },
      { id: 's2', title: 'Structural condition assessment', status: 'COMPLETED' },
      { id: 's3', title: 'Photograph pole ID plate', status: 'COMPLETED' },
    ],
    findings: [
      { id: 'f1', label: 'Pole serviceable, no action required', confidence: 0.96, isRiskFactor: false },
    ],
    measurements: [
      { id: 'm1', label: 'Lean from vertical', value: 1.8, unit: '°', minRange: 0, maxRange: 5 },
    ],
    evidence: [{ stepId: 's3', caption: 'Pole ID plate', tone: 'slate' }],
  },
];

/** Counts risk factors from a job's own content — never hand-written. */
function deriveFactors(seed: JobSeed) {
  return {
    overridesCount: seed.steps.filter((s) => s.status === 'OVERRIDDEN').length,
    outOfRangeCount: seed.measurements.filter(isMeasurementOutOfRange).length,
    failedChecksCount: seed.findings.filter((f) => f.isRiskFactor).length,
    isNewProcedure: seed.isNewProcedure,
  };
}

function toDetailedJob(seed: JobSeed): DetailedJobData {
  const evidence: EvidenceMedia[] = seed.evidence.map((e, i) => ({
    id: `${seed.id}-e${i + 1}`,
    stepId: e.stepId,
    url: evidenceTile(e.caption, (e.tone as any) ?? 'slate'),
    caption: e.caption,
    timestamp: seed.completedAt,
  }));

  return {
    id: seed.id,
    technicianName: seed.technicianName,
    jobType: seed.jobType,
    status: 'Awaiting Review',
    riskScore: calculateRiskScore(deriveFactors(seed)).score,
    completedAt: seed.completedAt,
    steps: seed.steps,
    evidence,
    findings: seed.findings as FindingItem[],
    measurements: seed.measurements as MeasurementItem[],
    timeline: buildTimeline(seed),
  };
}

/** Every job in the demo, keyed by id so the detail view never dead-ends. */
export const JOBS: DetailedJobData[] = SEEDS.map(toDetailedJob);

export const JOBS_BY_ID = new Map(JOBS.map((j) => [j.id, j]));

/** Projects the full job records down to the columns the queue table needs. */
export function toQueueItems(jobs: DetailedJobData[]): ReviewQueueItem[] {
  return jobs.map((j) => ({
    id: j.id,
    technicianName: j.technicianName,
    jobType: j.jobType,
    completedAt: j.completedAt,
    findingsCount: j.findings.length,
    overridesCount: j.steps.filter((s) => s.status === 'OVERRIDDEN').length,
    riskScore: j.riskScore,
  }));
}

/** Exposed so the detail view can show why a score is what it is. */
export function scoreBreakdownFor(jobId: string) {
  const seed = SEEDS.find((s) => s.id === jobId);
  if (!seed) return undefined;
  return calculateRiskScore(deriveFactors(seed));
}

# Technical Design: Single Screen Job Detail View (FIEL-59)

**Date:** 2026-08-14  
**Status:** Proposed  
**Jira Ticket:** [FIEL-59](https://sidsanadhaya.atlassian.net/browse/FIEL-59)  

---

## 1. Overview & Objectives

The goal of **FIEL-59** is to construct a comprehensive, single-screen Job Detail View for field service supervisors to inspect all evidence, steps, findings, and measurements associated with a completed job.

### Key Requirements
- **Procedure Steps**: Display list of steps, status (completed, skipped, overridden), and step notes.
- **Evidence Lightbox**: Image thumbnails for step photos with full-screen lightbox preview overlay.
- **Findings & Confidence**: List of AI / supervisor findings paired with confidence percentages (e.g. 95% confidence badge).
- **Measurements & Ranges**: Measured numerical values compared against `[minRange, maxRange]` boundaries, highlighted if out-of-range.
- **Execution Timeline**: Chronological log of job milestones (Start, Steps, Submission).

---

## 2. Component Interface & Data Contracts

```typescript
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
  requiredQualification?: string;
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
}
```

---

## 3. Core Logic & Utility Functions

### Measurement Out-of-Range Evaluator
```typescript
export function isMeasurementOutOfRange(item: MeasurementItem): boolean {
  return item.value < item.minRange || item.value > item.maxRange;
}
```

### Confidence Percentage Formatter
```typescript
export function formatConfidence(confidence: number): string {
  const pct = Math.round(confidence * 100);
  return `${pct}%`;
}
```

### Findings Sorting
```typescript
export function sortFindings(findings: FindingItem[]): FindingItem[] {
  return [...findings].sort((a, b) => {
    // Risk factors first
    if (a.isRiskFactor !== b.isRiskFactor) {
      return a.isRiskFactor ? -1 : 1;
    }
    // Within each group, lowest confidence first
    return a.confidence - b.confidence;
  });
}
```

Sorts findings for display with risk factors (`isRiskFactor: true`) appearing first, then others. Within each group, findings are ordered by ascending confidence (lowest first) so supervisors see uncertain findings before routine confirmations. The function returns a new array without mutating the original, ensuring the job's data and risk score remain unchanged.

### Findings Summary Generator
```typescript
export function getFindingsSummary(findings: FindingItem[]): string {
  const total = findings.length;
  const riskCount = findings.filter((f) => f.isRiskFactor).length;
  const points = riskCount * DEFAULT_RISK_WEIGHTS.failedChecksWeight;

  const findingWord = total === 1 ? 'finding' : 'findings';
  const riskPhrase = riskCount === 0 ? 'none count toward risk' : `${riskCount} count toward risk, adding ${points} ${points === 1 ? 'point' : 'points'}`;

  return `${total} ${findingWord}, ${riskPhrase}`;
}
```

Generates a summary line describing total findings count, how many count toward risk, and points they add to the risk score. Points are computed from `failedChecksWeight` (2) in `DEFAULT_RISK_WEIGHTS` and never written in by hand.

Examples:
- *"2 findings, 2 count toward risk, adding 4 points"*
- *"1 finding, none count toward risk"*
- *"3 findings, 2 count toward risk, adding 4 points"*

### Low Confidence Threshold
A finding with `confidence < 0.75` (below 75%) displays the label **"Low confidence: check the photo"**. A finding at exactly 75% does not show the label. This threshold is evaluated at display time and does not affect risk scoring logic.

---

## 4. Component Layout Sketch

```
+---------------------------------------------------------------------------------------+
| [← Back to Queue]  JOB #FIEL-23 - HVAC Maintenance         [Risk Score: 15 (HIGH)]   |
+---------------------------------------------------------------------------------------+
| (Overview & Timeline) | (Steps & Evidence) | (Findings & Confidence) | (Measurements) |
+---------------------------------------------------------------------------------------+
| TAB: MEASUREMENTS & RANGES                                                           |
| • Pressure Check: 4.2 PSI  [Expected: 5.0 - 10.0 PSI]  --> [ OUT OF RANGE (Red) ]   |
| • Temp Reading: 72.0 °F   [Expected: 60.0 - 80.0 °F]  --> [ NORMAL (Green) ]       |
+---------------------------------------------------------------------------------------+
| TAB: FINDINGS                                                                        |
| 2 findings, 2 count toward risk, adding 4 points                                     |
|                                                                                      |
| • Door seal perished ----------------------------> [ 72% Confidence ]               |
|   [⚠ Low confidence: check the photo]                 [Counts toward risk]          |
| • Battery terminal corrosion --------------------> [ 88% Confidence ]               |
|                                                       [Counts toward risk]          |
+---------------------------------------------------------------------------------------+
| [ Lightbox Modal Overlay when thumbnail clicked ]                                     |
+---------------------------------------------------------------------------------------+
```

---

## 5. Verification Plan

- Unit tests for `isMeasurementOutOfRange`, `formatConfidence`, `sortFindings`, and `getFindingsSummary`.
- Controller tests for active tab selection, lightbox open/close toggle, and verdict action callbacks.
- HTML render tests verifying:
  - Tab sections with sorted findings (risk factors first, lowest confidence first within groups)
  - Findings summary line with correct counts and points calculation
  - Low confidence warning label for findings below 75%
  - Confidence badges and range highlights
  - Lightbox modal rendering

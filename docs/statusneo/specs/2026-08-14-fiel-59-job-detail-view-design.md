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

### Findings Display Sorter
```typescript
export function sortFindings(findings: FindingItem[]): FindingItem[] {
  return [...findings].sort((a, b) => {
    if (a.isRiskFactor !== b.isRiskFactor) {
      return a.isRiskFactor ? -1 : 1;
    }
    return a.confidence - b.confidence;
  });
}
```

Sorts findings for display with risk factors first, then others. Within each group, lowest confidence comes first. Returns a new array; the source is unchanged.

### Findings Summary Generator
```typescript
export function getFindingsSummary(findings: FindingItem[], failedChecksWeight: number): string {
  const total = findings.length;
  const riskCount = findings.filter((f) => f.isRiskFactor).length;
  const points = riskCount * failedChecksWeight;

  const findingWord = total === 1 ? 'finding' : 'findings';

  if (riskCount === 0) {
    return `${total} ${findingWord}, none count toward risk`;
  }

  const riskWord = riskCount === 1 ? 'counts' : 'count';
  const pointWord = points === 1 ? 'point' : 'points';
  return `${total} ${findingWord}, ${riskCount} ${riskWord} toward risk, adding ${points} ${pointWord}`;
}
```

Generates a summary line showing total count, how many count toward risk, and total points. Example: "2 findings, 2 count toward risk, adding 4 points".

### Low Confidence Threshold Check
```typescript
export function isLowConfidence(confidence: number): boolean {
  return confidence < 0.75;
}
```

Returns true for confidence below 75% (< 0.75), false for 75% or above. Findings below this threshold display "Low confidence: check the photo".

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
| • Door seal perished -------------------------> [ 72% Confidence ] [Counts toward    |
|   risk] Low confidence: check the photo                                              |
| • Rust detected on valve stem ---------------> [ 95% Confidence ] [Counts toward    |
|   risk]                                                                              |
+---------------------------------------------------------------------------------------+
| [ Lightbox Modal Overlay when thumbnail clicked ]                                     |
+---------------------------------------------------------------------------------------+
```

Findings are displayed with:
- Summary line showing total findings, risk count, and points
- Risk factors listed first, then non-risk findings
- Within each group, lowest confidence first
- Low confidence warning (<75%) shown when applicable

---

## 5. Verification Plan

- Unit tests for `isMeasurementOutOfRange` and `formatConfidence`.
- Unit tests for `sortFindings` verifying risk factors appear before non-risk, and within groups items are sorted by confidence ascending.
- Unit tests for `getFindingsSummary` verifying correct counts, pluralization, and formatting.
- Unit tests for `isLowConfidence` verifying the 75% threshold boundary.
- Controller tests for active tab selection, lightbox open/close toggle, and verdict action callbacks.
- HTML render tests verifying tab sections, lightbox modal, confidence badges, range highlights, findings sorting, summary line display, and low confidence warnings.

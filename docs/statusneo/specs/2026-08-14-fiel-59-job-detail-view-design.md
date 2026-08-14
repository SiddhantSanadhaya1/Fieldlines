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
| • Rust detected on valve stem ----------------------------> [ 95% Confidence ]      |
+---------------------------------------------------------------------------------------+
| [ Lightbox Modal Overlay when thumbnail clicked ]                                     |
+---------------------------------------------------------------------------------------+
```

---

## 5. Verification Plan

- Unit tests for `isMeasurementOutOfRange` and `formatConfidence`.
- Controller tests for active tab selection, lightbox open/close toggle, and verdict action callbacks.
- HTML render tests verifying tab sections, lightbox modal, confidence badges, and range highlights.

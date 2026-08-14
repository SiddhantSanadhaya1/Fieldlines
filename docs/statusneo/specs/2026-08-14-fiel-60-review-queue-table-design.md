# Technical Design: Review Queue Table Component (FIEL-60)

**Date:** 2026-08-14  
**Status:** Proposed  
**Jira Ticket:** [FIEL-60](https://sidsanadhaya.atlassian.net/browse/FIEL-60)  

---

## 1. Overview & Objectives

The goal of **FIEL-60** is to build a sortable React review queue table component that presents completed jobs for supervisor audit.

### Key Features
- Display 6 primary columns: `Technician`, `Job Type`, `Completion Time`, `Findings`, `Overrides`, `Risk Score`.
- Interactive column sorting (toggle ASC / DESC on column header click).
- Visual Risk Indicator Badge:
  - **High Risk** ($\ge 10$): Red pill badge with alert styling.
  - **Medium Risk** ($5 - 9$): Amber pill badge.
  - **Low Risk** ($< 5$): Green / Slate pill badge.
- Row Click Handler: Emits `onSelectJob(jobId)` for detail view navigation.

---

## 2. Component Interface & Data Contracts

```typescript
export type SortDirection = 'asc' | 'desc';

export type SortableColumn =
  | 'technicianName'
  | 'jobType'
  | 'completedAt'
  | 'findingsCount'
  | 'overridesCount'
  | 'riskScore';

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
```

---

## 3. Risk Level Classification Utility

```typescript
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}
```

---

## 4. Sorting Engine Implementation Logic

```typescript
export function sortReviewQueueItems(
  items: ReviewQueueItem[],
  column: SortableColumn,
  direction: SortDirection
): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    let valA = a[column];
    let valB = b[column];

    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();

    if (typeof valA === 'string' && typeof valB === 'string') {
      const cmp = valA.localeCompare(valB);
      return direction === 'asc' ? cmp : -cmp;
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}
```

---

## 5. Component Layout Sketch

```
+-----------------------------------------------------------------------------------------------+
| TECHNICIAN  ▲ | JOB TYPE  ▲ | COMPLETED AT ▲ | FINDINGS ▲ | OVERRIDES ▲ | RISK SCORE  ▼       |
+---------------+-------------+----------------+------------+-------------+---------------------+
| John Doe      | Install     | 10:45 AM       | 2          | 3           | [ 15 HIGH ] (Red)   |
| Sarah Smith   | Repair      | 09:30 AM       | 1          | 1           | [ 7 MEDIUM ] (Amber)|
| Alex Rivera   | Audit       | 11:15 AM       | 0          | 0           | [ 1 LOW ] (Green)   |
+-----------------------------------------------------------------------------------------------+
```

---

## 6. Verification Plan

- Unit test `sortReviewQueueItems` utility for string, numeric, and date fields.
- Component test verifying sorting toggle on header clicks and row click execution.
- Visual badge rendering tests for High, Medium, and Low risk score ranges.

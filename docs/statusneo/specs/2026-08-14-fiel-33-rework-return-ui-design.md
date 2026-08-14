# Technical Design: Rework Return UI Modal Component (FIEL-33)

**Date:** 2026-08-14  
**Status:** Proposed  
**Jira Ticket:** [FIEL-33](https://sidsanadhaya.atlassian.net/browse/FIEL-33)  

---

## 1. Overview & Objectives

The goal of **FIEL-33** is to build the web console **Rework Return Modal UI**, enabling supervisors to specify step IDs, rework reasons, and attach evidence photos when returning a completed job to a technician's queue.

### Key Requirements
- **Step Selector**: Select one or more step IDs from the job's procedure steps.
- **Reason Input**: Text area for supervisor comments (required, minimum 5 characters).
- **Evidence Attachments**: Toggle select photo evidence items attached to the job.
- **Form Validation**: Prevent submission if no step is selected or reason is blank.
- **State Trigger**: On confirmation, emit `ReworkPayload` containing `{ jobId, selectedStepIds, reason, attachedEvidenceIds, timestamp }`.

---

## 2. Data Contracts & Component Props

```typescript
import { DetailedJobData, EvidenceMedia, ProcedureStepItem } from '../job-detail/types.js';

export interface ReworkPayload {
  jobId: string;
  selectedStepIds: string[];
  reason: string;
  attachedEvidenceIds: string[];
  timestamp: string | Date;
}

export interface ReworkModalProps {
  job: DetailedJobData;
  isOpen: boolean;
  onConfirm: (payload: ReworkPayload) => void;
  onClose: () => void;
}
```

---

## 3. Form Validation Utility

```typescript
export interface ReworkValidationResult {
  isValid: boolean;
  errors: {
    steps?: string;
    reason?: string;
  };
}

export function validateReworkForm(
  selectedStepIds: string[],
  reason: string
): ReworkValidationResult {
  const errors: { steps?: string; reason?: string } = {};

  if (!selectedStepIds || selectedStepIds.length === 0) {
    errors.steps = 'At least one procedure step must be selected for rework.';
  }

  if (!reason || reason.trim().length < 5) {
    errors.reason = 'Please provide a rework reason of at least 5 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
```

---

## 4. Modal Layout Sketch

```
+-----------------------------------------------------------------------------+
| REQUEST REWORK — JOB #JOB-101                                       [ X ]   |
+-----------------------------------------------------------------------------+
| 1. Select Step(s) for Rework:                                               |
|    [x] S-2: Mount Transformer Unit (OVERRIDDEN)                             |
|    [ ] S-1: Site Inspection & Safety Checklist (COMPLETED)                  |
|                                                                             |
| 2. Rework Reason & Instructions (Required):                                 |
|    +---------------------------------------------------------------------+  |
|    | Mount bracket was attached upside down. Please re-orient and photo. |  |
|    +---------------------------------------------------------------------+  |
|                                                                             |
| 3. Attach Evidence Photos (Optional):                                       |
|    [✓ Photo E-1]  [ Photo E-2 ]                                            |
|                                                                             |
|                                             [ Cancel ]  [ Confirm Rework ]  |
+-----------------------------------------------------------------------------+
```

---

## 5. Verification Plan

- Unit test `validateReworkForm` for empty steps, short reason, and valid inputs.
- Controller test for modal open/close state, step toggle selection, evidence toggle selection, and payload generation.
- Component test verifying HTML modal rendering, error message display, and confirm/cancel button execution.

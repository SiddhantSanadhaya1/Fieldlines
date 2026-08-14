# Idea Refine: FIEL-33 Rework Return UI Modal Component

## Problem Statement
**How Might We** construct an intuitive Rework Return Modal in the web console featuring a step selector dropdown/checkbox list, detailed reason textarea, photo evidence selector, and state trigger so supervisors can return jobs to field technicians with clear rework instructions?

---

## 3–5 Sharpening Questions & Context

1. **Who is this for?**
   Field service supervisors rejecting a job submission or requesting corrective rework.
2. **What does success look like?**
   - Modal component `<ReworkReturnModal />` opened when supervisor clicks "Request Rework" in the Job Detail View (FIEL-59).
   - Form fields:
     - **Target Step Selector**: Select specific procedure step(s) requiring rework.
     - **Rework Reason**: Required text area input (min 10 characters).
     - **Evidence Attachments**: Multi-select thumbnails from job's photo evidence.
   - Form validation: Cannot submit without selecting a step and providing a non-empty reason.
   - Submission callback `onConfirmRework(reworkPayload)` returning `{ jobId, stepIds, reason, evidenceIds }`.
3. **What's been built so far?**
   - FIEL-53: Risk Scoring Engine
   - FIEL-60: Review Queue Table Component
   - FIEL-59: Single Screen Job Detail View (contains `onActionVerdict` trigger)
4. **Why now?**
   Required to complete the supervisor rework loop.

---

## Strategic Directions

### Direction 1: Accessible Modal Form Component (Recommended MVP)
- Modal backdrop overlay with focus trap and keyboard `ESC` dismissal.
- Step multi-select list or dropdown populated from job's procedure steps.
- Clean validation rules (reason required, step required).
- Reusable React component: `<ReworkReturnModal job={selectedJob} isOpen={isOpen} onConfirm={...} onClose={...} />`.

---

## One-Pager Recommendation & MVP Scope

- **Recommended Direction:** Direction 1 (Accessible Modal Form Component).
- **MVP Scope:**
  - Data contracts: `ReworkPayload`, `ReworkReturnModalProps`.
  - State management: `selectedStepIds`, `reasonText`, `selectedEvidenceIds`, `validationErrors`.
  - Confirmation handler triggering `onConfirmRework(payload)`.

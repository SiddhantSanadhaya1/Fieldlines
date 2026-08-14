# Idea Refine: FIEL-60 Supervisor Review Queue Table Component

## Problem Statement
**How Might We** construct an intuitive, web-based supervisor review queue data table featuring sortable columns, color-coded risk score indicators, and row-click selection so that supervisors can audit completed jobs in real-time?

---

## 3–5 Sharpening Questions & Context

1. **Who is this for?**
   Field service supervisors and quality assurance managers monitoring completed jobs submitted by field technicians.
2. **What does success look like?**
   - Clean, modern React table rendering columns: `Technician`, `Job Type`, `Completion Time`, `Findings`, `Overrides`, `Risk Score`.
   - Dynamic column sorting (ascending / descending toggle on click).
   - Visual risk score badges (e.g. Red for High Risk score >= 10, Amber for Medium Risk 5–9, Slate/Green for Low Risk < 5).
   - Row click handler passing the selected `jobId` to open job detail drawer or modal.
3. **What's been built so far?**
   The risk scoring engine (`calculateRiskScore`) from FIEL-53 provides `risk_score` and `risk_breakdown`.
4. **Why now?**
   To enable supervisors to sort and triage completed jobs based on findings and risk.

---

## 5–8 Variations & Lenses

1. **Client-Side Sortable Table (Lens: Direct Spec)**
   React component managing local sorting state (`sortColumn`, `sortDirection`) across columns.
2. **Visual Risk Badge Matrix (Lens: Aesthetics & Visual Hierarchy)**
   Color-code risk scores using HSL pill badges with glowing indicators for high-risk jobs.
3. **Expandable Row Details (Lens: User Experience)**
   Allow expanding rows inline to inspect the `risk_breakdown` before navigating into full job details.
4. **Filterable Search Bar (Lens: Supervisor Productivity)**
   Provide quick filter input for searching by technician name or job type.

---

## Strategic Directions

### Direction 1: Modern Interactive React Table Component (Recommended MVP)
- Build `<ReviewQueueTable />` in React.
- Include column sorting for all 6 columns (`technician`, `jobType`, `completionTime`, `findingsCount`, `overridesCount`, `riskScore`).
- Include risk score indicator badge (`High`, `Medium`, `Low`).
- Accessible keyboard navigation and row click callback `onSelectJob(jobId)`.

---

## One-Pager Recommendation & MVP Scope

- **Recommended Direction:** Direction 1 (Modern Interactive React Table Component).
- **MVP Scope:**
  - Component props: `jobs: ReviewQueueItem[]`, `onSelectJob: (id: string) => void`.
  - Column sort state handling (click header to toggle ASC/DESC).
  - Risk indicator badge utility mapping score thresholds to visual style badges.
  - Unit/component test suite.

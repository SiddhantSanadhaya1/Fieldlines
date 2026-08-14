# Idea Refine: FIEL-59 Single Screen Job Detail View

## Problem Statement
**How Might We** design and construct a unified, single-screen Job Detail View displaying procedure steps, photo evidence thumbnails with lightbox overlay, model findings with confidence percentages, numeric measurements with range indicators, and a completion timeline so supervisors can audit jobs efficiently?

---

## 3–5 Sharpening Questions & Context

1. **Who is this for?**
   Supervisors reviewing specific field jobs selected from the Review Queue Table (FIEL-60).
2. **What does success look like?**
   - Single-screen layout with tabbed or accordion navigation:
     - **Overview & Timeline**: Execution start/end timestamps, technician info, risk score breakdown.
     - **Procedure Steps & Evidence**: Completed steps with photo thumbnails and lightbox image view.
     - **Findings & Confidence**: AI / on-site findings with confidence percentages (e.g. 94% confidence).
     - **Measurements & Ranges**: Numeric readings displaying target ranges and out-of-range highlights (e.g. 4.2 PSI [Expected: 5.0–10.0 PSI] - Highlighting Out of Range).
3. **What's been built so far?**
   - FIEL-53: Risk Scoring Engine
   - FIEL-60: Review Queue Table Component with row click handler `onSelectJob`
4. **Why now?**
   Required to inspect evidence before submitting supervisor verdicts or returning jobs for rework.

---

## 5–8 Variations & Lenses

1. **Tabbed View with Floating Verdict Bar (Lens: Direct Spec)**
   Top tabs for `Overview`, `Steps & Evidence`, `Findings`, `Measurements` with a fixed bottom bar for Accept / Reject / Request Rework.
2. **Accordion Split View (Lens: Density & Speed)**
   All sections stacked vertically in collapsible accordions, enabling fast single-page scrolling.
3. **Interactive Lightbox Modal (Lens: Media Audit)**
   Clicking any photo thumbnail launches an inline full-screen image viewer with metadata overlay (timestamp, GPS, step tag).

---

## Strategic Directions

### Direction 1: Tabbed + Accordion Hybrid Detail View (Recommended MVP)
- Clean tabbed header with quick stats summary cards (Risk Score, Total Steps, Overrides, Findings).
- Sections for Procedure Steps, Photo Evidence Gallery with Lightbox, Findings with Confidence badges, and Measurements with range status pills.
- Reusable React component: `<JobDetailView job={selectedJob} onClose={...} />`.

---

## One-Pager Recommendation & MVP Scope

- **Recommended Direction:** Direction 1 (Tabbed + Accordion Hybrid Detail View with Lightbox).
- **MVP Scope:**
  - `JobDetailItem` interface with steps, evidence, findings, measurements, timeline.
  - Tab navigation state (`activeTab`).
  - Lightbox modal state (`activeLightboxImage`).
  - Measurement range validator (`isOutOfRange`).

# Idea Refine: FIEL-53 Risk Scoring Algorithm for Job Prioritization

## Problem Statement
**How Might We** algorithmically calculate and assign risk scores to completed field jobs so that supervisors can review high-risk jobs (those with manual overrides, out-of-range measurements, failed safety checks, or newly introduced procedures) first in their audit queue?

---

## 3–5 Sharpening Questions & Context

1. **Who is this for?**
   Field service supervisors and quality auditors who need to review completed technician jobs.
2. **What does success look like?**
   - Instant or deterministic risk calculation upon job completion/sync.
   - Deterministic formula: `Score = (overrides * 3) + (out-of-range * 2) + (failed checks * 2) + (new procedure * 1)`.
   - Persisted score field on the job entity enabling fast indexed `Sort DESC` queries.
   - Detailed score breakdown audit trail (e.g. breakdown of how the score was calculated).
3. **What's been tried / specified?**
   The spec defines fixed weights for four primary risk factors:
   - Overrides (weight: 3)
   - Out-of-range readings (weight: 2)
   - Failed checks (weight: 2)
   - New procedure (weight: 1)
4. **Why now?**
   Required as a prerequisite for Epic 1: Supervisor Review Queue & Rework Loop.

---

## 5–8 Variations & Lenses

1. **Standard Linear Weighting (Lens: Direct Spec)**
   Calculate `Score = (overrides * 3) + (out-of-range * 2) + (failed checks * 2) + (new procedure * 1)`.
2. **Safety Critical Bypass (Lens: Risk Escalation)**
   If certain critical safety steps fail or are overridden, bump score to `MAX_INT` or flag as `CRITICAL_RISK` regardless of other counts.
3. **Configurable Weight Engine (Lens: Extensibility)**
   Store weights in environment variables or database configuration so supervisors can adjust coefficient values per job type.
4. **Decay / Age Weighting (Lens: Queue Health)**
   Factor in job completion age to prevent un-reviewed low/medium risk jobs from aging infinitely at the bottom of the queue.
5. **Technician Historical Multiplier (Lens: Context Sensitivity)**
   Multiply risk score by a factor if the assigned technician is new or has a history of high rework rates.

---

## Strategic Directions

### Direction 1: Deterministic Weighted Linear Engine (Recommended MVP)
- Strictly implement the formula: `Score = (overrides * 3) + (out-of-range * 2) + (failed checks * 2) + (new procedure * 1)`.
- Persist `risk_score` (integer) and `risk_breakdown` (JSON object) on the Job entity.
- Simple, ultra-fast, completely predictable, zero external dependencies.

### Direction 2: Configurable & Extensible Rules Engine
- Abstract factor evaluators (e.g. `OverrideFactorEvaluator`, `OutOfRangeFactorEvaluator`).
- Store factor weights in a configuration matrix.
- Prepares for future dynamic rule additions without changing core entity logic.

---

## Key Hidden Assumptions

1. **Payload Availability:** The job payload at completion contains clear data structures for:
   - Count of overridden steps/inputs (`overrides`)
   - Count of out-of-range sensor/manual readings (`out_of_range`)
   - Count of failed verification/safety checks (`failed_checks`)
   - Flag indicating whether the procedure version is new for the technician (`is_new_procedure` -> 1 or 0)
2. **Persistence & Indexing:** Database schema for `Job` allows adding `risk_score` (indexed integer column for `ORDER BY risk_score DESC`).
3. **Sync Trigger:** Risk calculation is executed server-side upon job submission/sync before entering the supervisor queue.

---

## One-Pager Recommendation & MVP Scope

- **Recommended Direction:** Direction 1 (Deterministic Weighted Linear Engine with JSON Audit Breakdown) with room for Direction 2 weight configuration.
- **MVP Scope:**
  - Pure function `calculateRiskScore(jobData)` returning `{ score: number, breakdown: RiskBreakdown }`.
  - Database schema column `risk_score` (indexed) and `risk_breakdown` on `jobs` table.
  - Job submission pipeline hook to compute and persist score.
- **Not Doing in MVP:**
  - Machine learning / dynamic weight auto-tuning.
  - Supervisor manual score override.

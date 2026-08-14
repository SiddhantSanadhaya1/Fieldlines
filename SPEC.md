# Specification: FIEL-53 Risk Scoring Algorithm for Job Prioritization

**Status:** Draft / Ready for Approval  
**Created:** 2026-08-14  
**Target Ticket:** [FIEL-53](https://sidsanadhaya.atlassian.net/browse/FIEL-53)  

---

## 1. Objective & Target Users

### Objective
Provide a fast, deterministic risk scoring engine that evaluates completed field technician jobs and assigns a numeric risk score to enable descending risk prioritization (`ORDER BY risk_score DESC`) in the Supervisor Review Queue.

### Target Users
- **Field Service Supervisors & Auditors**: Who require prioritized audit queues to inspect high-risk jobs (e.g. jobs with manual overrides or failed safety checks) first.
- **Backend API Systems**: Which execute job completion/sync pipelines and require deterministic risk evaluation.

---

## 2. Core Features & Acceptance Criteria

### Core Feature 1: Risk Scoring Function (`calculateRiskScore`)
- Evaluates four primary risk factors using the standard coefficient weights:
  $$\text{Score} = (\text{overrides} \times 3) + (\text{out\_of\_range} \times 2) + (\text{failed\_checks} \times 2) + (\text{is\_new\_procedure} \times 1)$$
- Accepts an optional `RiskFactorWeights` parameter to allow overriding standard coefficients if needed.

### Acceptance Criteria
- [ ] **AC-1 (Zero Risk Base):** When all counts are 0 and `isNewProcedure` is false, `score` MUST equal `0`.
- [ ] **AC-2 (Standard Weight Calculation):** 
  - Given: `overridesCount = 2`, `outOfRangeCount = 1`, `failedChecksCount = 3`, `isNewProcedure = true`
  - Score MUST equal: $(2 \times 3) + (1 \times 2) + (3 \times 2) + (1 \times 1) = 6 + 2 + 6 + 1 = 15$.
- [ ] **AC-3 (Detailed Breakdown):** The function MUST return an itemized `breakdown` object containing the points contributed by each factor (`overridesPoints`, `outOfRangePoints`, `failedChecksPoints`, `newProcedurePoints`).
- [ ] **AC-4 (Input Sanitization):** Negative values or missing count fields MUST be sanitized to `0` without throwing runtime errors.
- [ ] **AC-5 (Sorting Verification):** Sorting an array of job records by `risk_score` descending MUST place high-risk jobs at index 0.

---

## 3. Recommended Commands

```bash
# Run unit tests
npm test

# Run build / compilation check
npm run build

# Run linter
npm run lint
```

---

## 4. Project Structure & Code Style Guidelines

```
src/
├── domain/
│   ├── risk/
│   │   ├── risk-scorer.ts       # Core calculateRiskScore pure function
│   │   ├── types.ts             # RiskFactors, RiskFactorWeights, RiskCalculationResult
│   │   └── constants.ts         # DEFAULT_RISK_WEIGHTS
└── __tests__/
    └── risk-scorer.test.ts      # Comprehensive unit tests
```

### Code Style Requirements
- **Language**: TypeScript (ESM) with `strict: true`.
- **Functions**: Pure functions without external side-effects or network calls.
- **Immutability**: All returned score and breakdown objects must be frozen/immutable.

---

## 5. Testing Strategy

- **Unit Testing Framework**: Jest / Vitest / Node test runner.
- **Coverage Goal**: 100% branch and function coverage for `risk-scorer.ts`.
- **Test Matrix**:
  1. Base case: zero inputs
  2. Single factor cases (only overrides, only out-of-range, only failed checks, only new procedure)
  3. Combined multi-factor cases
  4. Edge cases: negative numbers, NaN, undefined, null
  5. Custom weights configuration override

---

## 6. Boundaries & Operating Rules

### Always Do
- Sanitize numeric counts using `Math.max(0, Math.floor(count || 0))`.
- Return both `score` (integer) and `breakdown` (structured object).
- Export fully typed interfaces for input parameters and outputs.

### Ask First Before
- Modifying default weight coefficients (Overrides: 3, Out-of-Range: 2, Failed Checks: 2, New Procedure: 1).
- Adding network or database I/O directly into the core calculation module.

### Never Do
- Never throw unhandled exceptions on invalid numeric inputs (e.g. `null` or `undefined`).
- Never perform floating-point operations that introduce non-deterministic rounding errors.

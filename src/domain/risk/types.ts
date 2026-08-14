/**
 * Risk factors evaluated during job completion scoring.
 */
export interface RiskFactors {
  /** Count of manual overrides performed during job execution (Weight: 3) */
  overridesCount?: number;
  /** Count of measurement values reading out-of-range (Weight: 2) */
  outOfRangeCount?: number;
  /** Count of failed verification or safety checks (Weight: 2) */
  failedChecksCount?: number;
  /** Flag indicating whether the job utilizes a new procedure version (Weight: 1) */
  isNewProcedure?: boolean;
}

/**
 * Weights assigned to each risk factor in the scoring algorithm.
 */
export interface RiskFactorWeights {
  overridesWeight: number;
  outOfRangeWeight: number;
  failedChecksWeight: number;
  newProcedureWeight: number;
}

/**
 * Itemized points breakdown contributed by each factor.
 */
export interface RiskScoreBreakdown {
  overridesPoints: number;
  outOfRangePoints: number;
  failedChecksPoints: number;
  newProcedurePoints: number;
}

/**
 * Result returned by the risk scoring engine.
 */
export interface RiskCalculationResult {
  /** Total calculated risk score */
  score: number;
  /** Itemized score breakdown */
  breakdown: RiskScoreBreakdown;
  /** Sanitized factors used in the calculation */
  factors: Required<RiskFactors>;
}

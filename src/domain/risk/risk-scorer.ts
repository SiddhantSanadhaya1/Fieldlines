import {
  RiskFactors,
  RiskFactorWeights,
  RiskCalculationResult,
  RiskScoreBreakdown,
} from './types.js';
import { DEFAULT_RISK_WEIGHTS } from './constants.js';

/**
 * Calculates the risk score for a completed job using standard or custom weight coefficients.
 * 
 * Formula:
 * Score = (overrides * 3) + (out-of-range * 2) + (failed checks * 2) + (new procedure * 1)
 *
 * @param factors Factors evaluated from the completed job payload
 * @param weights Weights assigned to each risk factor (defaults to DEFAULT_RISK_WEIGHTS)
 * @returns RiskCalculationResult containing score, breakdown points, and sanitized factors
 */
export function calculateRiskScore(
  factors: RiskFactors = {},
  weights: RiskFactorWeights = DEFAULT_RISK_WEIGHTS
): RiskCalculationResult {
  // Sanitize numeric inputs (convert negative numbers, NaN, null, or undefined to 0)
  const overridesCount = Math.max(0, Math.floor(factors.overridesCount || 0));
  const outOfRangeCount = Math.max(0, Math.floor(factors.outOfRangeCount || 0));
  const failedChecksCount = Math.max(0, Math.floor(factors.failedChecksCount || 0));
  const isNewProcedure = Boolean(factors.isNewProcedure);

  // Compute point contribution for each factor
  const overridesPoints = overridesCount * weights.overridesWeight;
  const outOfRangePoints = outOfRangeCount * weights.outOfRangeWeight;
  const failedChecksPoints = failedChecksCount * weights.failedChecksWeight;
  const newProcedurePoints = (isNewProcedure ? 1 : 0) * weights.newProcedureWeight;

  const score =
    overridesPoints +
    outOfRangePoints +
    failedChecksPoints +
    newProcedurePoints;

  const breakdown: RiskScoreBreakdown = Object.freeze({
    overridesPoints,
    outOfRangePoints,
    failedChecksPoints,
    newProcedurePoints,
  });

  const sanitizedFactors: Required<RiskFactors> = Object.freeze({
    overridesCount,
    outOfRangeCount,
    failedChecksCount,
    isNewProcedure,
  });

  return Object.freeze({
    score,
    breakdown,
    factors: sanitizedFactors,
  });
}

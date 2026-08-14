import { RiskFactorWeights } from './types.js';

/**
 * Standard weight coefficients specified in FIEL-53:
 * Score = (overrides * 3) + (out-of-range * 2) + (failed checks * 2) + (new procedure * 1)
 */
export const DEFAULT_RISK_WEIGHTS: Readonly<RiskFactorWeights> = Object.freeze({
  overridesWeight: 3,
  outOfRangeWeight: 2,
  failedChecksWeight: 2,
  newProcedureWeight: 1,
});

import { FindingItem, MeasurementItem } from './types.js';
import { DEFAULT_RISK_WEIGHTS } from '../../domain/risk/constants.js';

/**
 * Checks if a numeric measurement value falls outside minRange or maxRange boundaries.
 */
export function isMeasurementOutOfRange(item: MeasurementItem): boolean {
  return item.value < item.minRange || item.value > item.maxRange;
}

/**
 * Formats a 0.0 - 1.0 confidence number into a human-readable percentage string (e.g. 0.95 -> '95%').
 */
export function formatConfidence(confidence: number): string {
  const pct = Math.round(confidence * 100);
  return `${pct}%`;
}

/**
 * Sorts findings for display: risk factors first, then others. Within each group, lowest confidence first.
 * Returns a new array without mutating the original.
 */
export function sortFindings(findings: FindingItem[]): FindingItem[] {
  return [...findings].sort((a, b) => {
    // Risk factors first
    if (a.isRiskFactor !== b.isRiskFactor) {
      return a.isRiskFactor ? -1 : 1;
    }
    // Within each group, lowest confidence first
    return a.confidence - b.confidence;
  });
}

/**
 * Generates a summary line describing total findings, how many count toward risk, and points added.
 * Examples:
 *   "2 findings, 2 count toward risk, adding 4 points"
 *   "1 finding, none count toward risk"
 */
export function getFindingsSummary(findings: FindingItem[]): string {
  const total = findings.length;
  const riskCount = findings.filter((f) => f.isRiskFactor).length;
  const points = riskCount * DEFAULT_RISK_WEIGHTS.failedChecksWeight;

  const findingWord = total === 1 ? 'finding' : 'findings';
  const riskPhrase = riskCount === 0 ? 'none count toward risk' : `${riskCount} count toward risk, adding ${points} ${points === 1 ? 'point' : 'points'}`;

  return `${total} ${findingWord}, ${riskPhrase}`;
}

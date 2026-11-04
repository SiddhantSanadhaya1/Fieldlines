import { FindingItem, MeasurementItem } from './types.js';

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
 * Sorts findings for display: risk factors first, then others.
 * Within each group, lowest confidence comes first.
 * Returns a new array; the source is unchanged.
 */
export function sortFindings(findings: FindingItem[]): FindingItem[] {
  return [...findings].sort((a, b) => {
    if (a.isRiskFactor !== b.isRiskFactor) {
      return a.isRiskFactor ? -1 : 1;
    }
    return a.confidence - b.confidence;
  });
}

/**
 * Generates a summary line for the findings list showing total count,
 * how many count toward risk, and total points they contribute.
 */
export function getFindingsSummary(findings: FindingItem[], failedChecksWeight: number): string {
  const total = findings.length;
  const riskCount = findings.filter((f) => f.isRiskFactor).length;
  const points = riskCount * failedChecksWeight;

  const findingWord = total === 1 ? 'finding' : 'findings';

  if (riskCount === 0) {
    return `${total} ${findingWord}, none count toward risk`;
  }

  const riskWord = riskCount === 1 ? 'counts' : 'count';
  const pointWord = points === 1 ? 'point' : 'points';
  return `${total} ${findingWord}, ${riskCount} ${riskWord} toward risk, adding ${points} ${pointWord}`;
}

/**
 * Checks if a confidence score is below the 75% threshold.
 * Returns true for < 0.75, false for >= 0.75.
 */
export function isLowConfidence(confidence: number): boolean {
  return confidence < 0.75;
}

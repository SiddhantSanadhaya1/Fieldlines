import {
  ReviewQueueItem,
  RiskLevel,
  SortableColumn,
  SortDirection,
} from './types.js';

/**
 * Maps risk score to visual RiskLevel classification:
 * - HIGH: score >= 10
 * - MEDIUM: score >= 5 && score < 10
 * - LOW: score < 5
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}

/**
 * Sorts array of ReviewQueueItems by target column and direction without mutating original array.
 */
export function sortReviewQueueItems(
  items: ReviewQueueItem[],
  column: SortableColumn,
  direction: SortDirection
): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    let valA: any = a[column];
    let valB: any = b[column];

    if (valA instanceof Date) valA = valA.getTime();
    if (valB instanceof Date) valB = valB.getTime();

    if (typeof valA === 'string' && typeof valB === 'string') {
      const cmp = valA.localeCompare(valB);
      return direction === 'asc' ? cmp : -cmp;
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

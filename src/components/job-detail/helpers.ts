import { MeasurementItem } from './types.js';

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

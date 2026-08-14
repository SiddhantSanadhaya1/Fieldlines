import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateRiskScore } from '../domain/risk/risk-scorer.js';
import { DEFAULT_RISK_WEIGHTS } from '../domain/risk/constants.js';
import { RiskFactors } from '../domain/risk/types.js';

describe('FIEL-53 Risk Scoring Engine (calculateRiskScore)', () => {
  it('AC-1: returns 0 score and zero breakdown for base case (all zeroes, isNewProcedure=false)', () => {
    const factors: RiskFactors = {
      overridesCount: 0,
      outOfRangeCount: 0,
      failedChecksCount: 0,
      isNewProcedure: false,
    };

    const result = calculateRiskScore(factors);

    assert.equal(result.score, 0);
    assert.deepEqual(result.breakdown, {
      overridesPoints: 0,
      outOfRangePoints: 0,
      failedChecksPoints: 0,
      newProcedurePoints: 0,
    });
    assert.equal(result.factors.overridesCount, 0);
    assert.equal(result.factors.isNewProcedure, false);
  });

  it('AC-2: correctly calculates standard weighted score: (overrides*3)+(out-of-range*2)+(failed*2)+(newProc*1)', () => {
    const factors: RiskFactors = {
      overridesCount: 2,    // 2 * 3 = 6
      outOfRangeCount: 1,   // 1 * 2 = 2
      failedChecksCount: 3, // 3 * 2 = 6
      isNewProcedure: true, // 1 * 1 = 1
    };

    const result = calculateRiskScore(factors);

    // Expected score = 6 + 2 + 6 + 1 = 15
    assert.equal(result.score, 15);
  });

  it('AC-3: returns detailed itemized breakdown points for each factor', () => {
    const factors: RiskFactors = {
      overridesCount: 4,     // 4 * 3 = 12
      outOfRangeCount: 3,    // 3 * 2 = 6
      failedChecksCount: 2,  // 2 * 2 = 4
      isNewProcedure: true,  // 1 * 1 = 1
    };

    const result = calculateRiskScore(factors);

    assert.equal(result.score, 23);
    assert.deepEqual(result.breakdown, {
      overridesPoints: 12,
      outOfRangePoints: 6,
      failedChecksPoints: 4,
      newProcedurePoints: 1,
    });
  });

  it('AC-4: sanitizes negative, missing, or undefined counts gracefully to 0', () => {
    const factors: RiskFactors = {
      overridesCount: -5,
      outOfRangeCount: undefined,
      failedChecksCount: -1,
      isNewProcedure: undefined,
    };

    const result = calculateRiskScore(factors);

    assert.equal(result.score, 0);
    assert.equal(result.factors.overridesCount, 0);
    assert.equal(result.factors.outOfRangeCount, 0);
    assert.equal(result.factors.failedChecksCount, 0);
    assert.equal(result.factors.isNewProcedure, false);
  });

  it('allows overriding default weight coefficients with custom weights', () => {
    const factors: RiskFactors = {
      overridesCount: 1,
      outOfRangeCount: 1,
      failedChecksCount: 1,
      isNewProcedure: true,
    };

    const customWeights = {
      overridesWeight: 10,
      outOfRangeWeight: 5,
      failedChecksWeight: 5,
      newProcedureWeight: 2,
    };

    const result = calculateRiskScore(factors, customWeights);

    // 10 + 5 + 5 + 2 = 22
    assert.equal(result.score, 22);
    assert.equal(result.breakdown.overridesPoints, 10);
  });

  it('AC-5: enables sorting job items in descending risk order', () => {
    const jobs = [
      { id: 'JOB-1', factors: { overridesCount: 0, isNewProcedure: false } },
      { id: 'JOB-2', factors: { overridesCount: 5, isNewProcedure: true } }, // 16 pts
      { id: 'JOB-3', factors: { outOfRangeCount: 2 } },                       // 4 pts
    ];

    const scoredJobs = jobs.map((job) => ({
      ...job,
      riskScore: calculateRiskScore(job.factors).score,
    }));

    scoredJobs.sort((a, b) => b.riskScore - a.riskScore);

    assert.equal(scoredJobs[0].id, 'JOB-2');
    assert.equal(scoredJobs[1].id, 'JOB-3');
    assert.equal(scoredJobs[2].id, 'JOB-1');
  });
});

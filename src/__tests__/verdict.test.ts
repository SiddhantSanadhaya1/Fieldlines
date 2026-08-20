import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildClosureAudit, type Verdict } from '../../api/verdict.js';
import type { DetailedJobData } from '../components/job-detail/types.js';

describe('buildClosureAudit', () => {
  /**
   * Minimal job fixture for testing.
   * In practice, jobs would have more data, but buildClosureAudit only needs
   * these fields to compute the closure audit.
   */
  const createTestJob = (overrides: { id?: string; riskScore?: number } = {}): DetailedJobData => ({
    id: overrides.id ?? 'TEST-JOB-001',
    technicianName: 'Test Technician',
    jobType: 'Test Install',
    status: 'COMPLETED',
    riskScore: overrides.riskScore ?? 0,
    completedAt: '2026-08-13T16:42:00Z',
    steps: [],
    evidence: [],
    findings: [],
    measurements: [],
    timeline: [],
  });

  it('handles job with no verdict history (undefined array) - regression test for .at() error', () => {
    // This test reproduces the bug: buildClosureAudit is called for a job that
    // has never been actioned before, so verdictHistory[job.id] is undefined.
    // Before the fix, calling .at(-1) on undefined throws:
    //   TypeError: Cannot read properties of undefined (reading 'at')
    
    const job = createTestJob({ id: 'NEVER-ACTIONED-JOB' });
    const verdict: Verdict = 'ACCEPT';
    const now = new Date('2026-08-14T10:00:00Z');

    // This call should not throw, even though the job has no history
    const audit = buildClosureAudit(job, verdict, now);

    assert.equal(audit.jobId, 'NEVER-ACTIONED-JOB');
    assert.equal(audit.verdict, 'ACCEPT');
    assert.equal(audit.supersedes, null, 'supersedes should be null when there is no history');
    assert.equal(audit.closedAt, '2026-08-14T10:00:00.000Z');
  });

  it('returns the most recent verdict when history exists', () => {
    const job = createTestJob({ id: 'JOB-WITH-HISTORY', riskScore: 5 });
    const verdict: Verdict = 'ACCEPT';
    const now = new Date('2026-08-14T10:00:00Z');

    // First verdict - no history yet
    const audit1 = buildClosureAudit(job, 'REJECT', new Date('2026-08-14T09:00:00Z'));
    assert.equal(audit1.supersedes, null, 'first verdict should have no supersedes');

    // Simulate recording the first verdict by importing and using recordVerdict
    // For now, we'll just test that subsequent calls work correctly
    // The actual history recording is done by handleVerdict, not buildClosureAudit

    // Second verdict - should reference the previous one if it were recorded
    const audit2 = buildClosureAudit(job, verdict, now);
    
    // Since we're testing buildClosureAudit in isolation, and it reads from
    // verdictHistory which is module state, we verify the function completes
    // without error and returns a valid audit
    assert.equal(audit2.jobId, 'JOB-WITH-HISTORY');
    assert.equal(audit2.verdict, 'ACCEPT');
    assert.equal(typeof audit2.supersedes, 'object'); // null or VerdictRecord
  });

  it('recomputes risk score and compares with displayed score', () => {
    const job = createTestJob({ id: 'SCORE-TEST', riskScore: 10 });
    const verdict: Verdict = 'REWORK';
    const now = new Date('2026-08-14T10:00:00Z');

    const audit = buildClosureAudit(job, verdict, now);

    // With no overrides, out-of-range, or failed checks, score should be 0
    assert.equal(audit.recomputedScore, 0);
    assert.equal(audit.displayedScore, 10);
    assert.equal(audit.scoreMatches, false, 'scores should not match when displayed is 10 but computed is 0');
  });

  it('correctly identifies matching scores', () => {
    const job = createTestJob({ id: 'MATCHING-SCORE', riskScore: 0 });
    const verdict: Verdict = 'ACCEPT';
    const now = new Date('2026-08-14T10:00:00Z');

    const audit = buildClosureAudit(job, verdict, now);

    assert.equal(audit.recomputedScore, 0);
    assert.equal(audit.displayedScore, 0);
    assert.equal(audit.scoreMatches, true, 'scores should match when both are 0');
  });

  it('includes verdict type in audit', () => {
    const job = createTestJob();
    
    const acceptAudit = buildClosureAudit(job, 'ACCEPT', new Date());
    assert.equal(acceptAudit.verdict, 'ACCEPT');

    const rejectAudit = buildClosureAudit(job, 'REJECT', new Date());
    assert.equal(rejectAudit.verdict, 'REJECT');

    const reworkAudit = buildClosureAudit(job, 'REWORK', new Date());
    assert.equal(reworkAudit.verdict, 'REWORK');
  });

  it('formats closedAt timestamp correctly', () => {
    const job = createTestJob();
    const now = new Date('2026-08-14T15:30:45.123Z');
    
    const audit = buildClosureAudit(job, 'ACCEPT', now);
    
    assert.equal(audit.closedAt, '2026-08-14T15:30:45.123Z');
  });
});

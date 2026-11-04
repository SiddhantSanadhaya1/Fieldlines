import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DetailedJobData, FindingItem, MeasurementItem } from '../components/job-detail/types.js';
import {
  formatConfidence,
  getFindingsSummary,
  isLowConfidence,
  isMeasurementOutOfRange,
  sortFindings,
} from '../components/job-detail/helpers.js';
import { JobDetailViewController } from '../components/job-detail/JobDetailView.js';

describe('FIEL-59 Single Screen Job Detail View', () => {
  const sampleJob: DetailedJobData = {
    id: 'JOB-101',
    technicianName: 'Dave Technician',
    jobType: 'Transformer Installation',
    status: 'COMPLETED',
    riskScore: 14, // HIGH
    completedAt: '2026-08-14T14:20:00.000Z',
    steps: [
      { id: 'S-1', title: 'Site Inspection & Safety Checklist', status: 'COMPLETED' },
      { id: 'S-2', title: 'Mount Transformer Unit', status: 'OVERRIDDEN', notes: 'Manual override due to bracket mismatch' },
    ],
    evidence: [
      {
        id: 'E-1',
        stepId: 'S-1',
        url: 'https://example.com/photos/safety.jpg',
        caption: 'Safety barrier deployed',
        timestamp: '2026-08-14T14:05:00.000Z',
      },
    ],
    findings: [
      { id: 'F-1', label: 'Bracket clearance discrepancy', confidence: 0.94, isRiskFactor: true },
      { id: 'F-2', label: 'Ground wire properly attached', confidence: 0.99, isRiskFactor: false },
    ],
    measurements: [
      { id: 'M-1', label: 'Input Voltage', value: 240.5, unit: 'V', minRange: 220, maxRange: 250 },
      { id: 'M-2', label: 'Oil Pressure', value: 4.2, unit: 'PSI', minRange: 5.0, maxRange: 10.0 }, // OUT OF RANGE
    ],
    timeline: [
      { timestamp: '2026-08-14T13:00:00.000Z', event: 'Job Started', actor: 'Dave Technician' },
      { timestamp: '2026-08-14T14:20:00.000Z', event: 'Job Submitted', actor: 'Dave Technician' },
    ],
  };

  describe('helpers', () => {
    it('isMeasurementOutOfRange identifies values outside [minRange, maxRange]', () => {
      const normal: MeasurementItem = { id: '1', label: 'Temp', value: 72, unit: 'F', minRange: 60, maxRange: 80 };
      const low: MeasurementItem = { id: '2', label: 'Press', value: 4.2, unit: 'PSI', minRange: 5.0, maxRange: 10.0 };
      const high: MeasurementItem = { id: '3', label: 'Volt', value: 260, unit: 'V', minRange: 220, maxRange: 250 };

      assert.equal(isMeasurementOutOfRange(normal), false);
      assert.equal(isMeasurementOutOfRange(low), true);
      assert.equal(isMeasurementOutOfRange(high), true);
    });

    it('formatConfidence formats decimal number to percentage string', () => {
      assert.equal(formatConfidence(0.94), '94%');
      assert.equal(formatConfidence(0.999), '100%');
      assert.equal(formatConfidence(0.5), '50%');
    });

    it('sortFindings places risk factors before non-risk factors', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Non-risk finding', confidence: 0.90, isRiskFactor: false },
        { id: 'f2', label: 'Risk finding', confidence: 0.85, isRiskFactor: true },
      ];

      const sorted = sortFindings(findings);
      assert.equal(sorted[0].isRiskFactor, true);
      assert.equal(sorted[1].isRiskFactor, false);
    });

    it('sortFindings orders by confidence ascending within each group', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Risk high conf', confidence: 0.95, isRiskFactor: true },
        { id: 'f2', label: 'Risk low conf', confidence: 0.70, isRiskFactor: true },
        { id: 'f3', label: 'Non-risk high conf', confidence: 0.98, isRiskFactor: false },
        { id: 'f4', label: 'Non-risk low conf', confidence: 0.88, isRiskFactor: false },
      ];

      const sorted = sortFindings(findings);
      assert.equal(sorted[0].label, 'Risk low conf');
      assert.equal(sorted[1].label, 'Risk high conf');
      assert.equal(sorted[2].label, 'Non-risk low conf');
      assert.equal(sorted[3].label, 'Non-risk high conf');
    });

    it('sortFindings does not mutate the original array', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Second', confidence: 0.90, isRiskFactor: false },
        { id: 'f2', label: 'First', confidence: 0.85, isRiskFactor: true },
      ];

      const original = [...findings];
      sortFindings(findings);
      assert.deepEqual(findings, original);
    });

    it('getFindingsSummary formats summary with points for risk findings', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Risk 1', confidence: 0.90, isRiskFactor: true },
        { id: 'f2', label: 'Risk 2', confidence: 0.85, isRiskFactor: true },
        { id: 'f3', label: 'Non-risk', confidence: 0.95, isRiskFactor: false },
      ];

      const summary = getFindingsSummary(findings, 2);
      assert.equal(summary, '3 findings, 2 count toward risk, adding 4 points');
    });

    it('getFindingsSummary handles no risk findings', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Non-risk', confidence: 0.95, isRiskFactor: false },
      ];

      const summary = getFindingsSummary(findings, 2);
      assert.equal(summary, '1 finding, none count toward risk');
    });

    it('getFindingsSummary handles singular vs plural correctly', () => {
      const oneFinding: FindingItem[] = [
        { id: 'f1', label: 'Risk', confidence: 0.90, isRiskFactor: true },
      ];
      assert.equal(getFindingsSummary(oneFinding, 2), '1 finding, 1 counts toward risk, adding 2 points');

      const twoFindings: FindingItem[] = [
        { id: 'f1', label: 'Risk 1', confidence: 0.90, isRiskFactor: true },
        { id: 'f2', label: 'Risk 2', confidence: 0.85, isRiskFactor: true },
      ];
      assert.equal(getFindingsSummary(twoFindings, 2), '2 findings, 2 count toward risk, adding 4 points');
    });

    it('isLowConfidence returns true for < 75%', () => {
      assert.equal(isLowConfidence(0.74), true);
      assert.equal(isLowConfidence(0.72), true);
      assert.equal(isLowConfidence(0.50), true);
    });

    it('isLowConfidence returns false for >= 75%', () => {
      assert.equal(isLowConfidence(0.75), false);
      assert.equal(isLowConfidence(0.76), false);
      assert.equal(isLowConfidence(0.99), false);
    });
  });

  describe('JobDetailViewController', () => {
    it('initializes with overview tab by default', () => {
      const controller = new JobDetailViewController({ job: sampleJob });
      assert.equal(controller.getActiveTab(), 'overview');
      assert.equal(controller.getActiveLightboxImage(), undefined);
    });

    it('allows switching active tabs', () => {
      const controller = new JobDetailViewController({ job: sampleJob });

      controller.setActiveTab('steps');
      assert.equal(controller.getActiveTab(), 'steps');

      controller.setActiveTab('measurements');
      assert.equal(controller.getActiveTab(), 'measurements');
    });

    it('toggles lightbox image preview modal state', () => {
      const controller = new JobDetailViewController({ job: sampleJob });
      const img = sampleJob.evidence[0];

      controller.openLightbox(img);
      assert.deepEqual(controller.getActiveLightboxImage(), img);

      controller.closeLightbox();
      assert.equal(controller.getActiveLightboxImage(), undefined);
    });

    it('triggers onActionVerdict callback with selected verdict', () => {
      let emittedVerdict = '';
      let emittedJobId = '';

      const controller = new JobDetailViewController({
        job: sampleJob,
        onActionVerdict: (id, verdict) => {
          emittedJobId = id;
          emittedVerdict = verdict;
        },
      });

      controller.submitVerdict('REWORK');
      assert.equal(emittedJobId, 'JOB-101');
      assert.equal(emittedVerdict, 'REWORK');
    });

    it('triggers onClose callback when closeView is invoked', () => {
      let closed = false;
      const controller = new JobDetailViewController({
        job: sampleJob,
        onClose: () => {
          closed = true;
        },
      });

      controller.closeView();
      assert.equal(closed, true);
    });

    it('renders HTML string containing risk badges, tabs, timeline, steps, and measurements', () => {
      const controller = new JobDetailViewController({ job: sampleJob });

      // Overview Tab Render
      let html = controller.renderHTML();
      assert.ok(html.includes('Job #JOB-101'));
      assert.ok(html.includes('badge-high'));
      assert.ok(html.includes('Job Started'));

      // Steps Tab Render
      controller.setActiveTab('steps');
      html = controller.renderHTML();
      assert.ok(html.includes('Site Inspection & Safety Checklist'));
      assert.ok(html.includes('step-evidence-gallery'));

      // Findings Tab Render
      controller.setActiveTab('findings');
      html = controller.renderHTML();
      assert.ok(html.includes('Bracket clearance discrepancy'));
      assert.ok(html.includes('94% Confidence'));

      // Measurements Tab Render
      controller.setActiveTab('measurements');
      html = controller.renderHTML();
      assert.ok(html.includes('Oil Pressure'));
      assert.ok(html.includes('OUT OF RANGE'));

      // Lightbox Modal Render
      controller.openLightbox(sampleJob.evidence[0]);
      html = controller.renderHTML();
      assert.ok(html.includes('lightbox-modal'));
    });

    it('renders findings in sorted order: risk factors first, then by confidence ascending', () => {
      const jobWithFindings: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'Non-risk high confidence', confidence: 0.98, isRiskFactor: false },
          { id: 'f2', label: 'Risk low confidence', confidence: 0.72, isRiskFactor: true },
          { id: 'f3', label: 'Risk high confidence', confidence: 0.91, isRiskFactor: true },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithFindings });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      const riskLowIdx = html.indexOf('Risk low confidence');
      const riskHighIdx = html.indexOf('Risk high confidence');
      const nonRiskIdx = html.indexOf('Non-risk high confidence');

      assert.ok(riskLowIdx < riskHighIdx, 'Risk low confidence should come before risk high confidence');
      assert.ok(riskHighIdx < nonRiskIdx, 'Risk findings should come before non-risk findings');
    });

    it('renders findings summary line with counts and points', () => {
      const jobWithFindings: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'Risk 1', confidence: 0.88, isRiskFactor: true },
          { id: 'f2', label: 'Risk 2', confidence: 0.72, isRiskFactor: true },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithFindings });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(html.includes('2 findings, 2 count toward risk, adding 4 points'));
    });

    it('renders findings summary for non-risk findings', () => {
      const jobWithNonRiskFindings: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'All clear', confidence: 0.97, isRiskFactor: false },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithNonRiskFindings });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(html.includes('1 finding, none count toward risk'));
    });

    it('renders low confidence warning for findings below 75%', () => {
      const jobWithLowConfidence: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'Low conf finding', confidence: 0.72, isRiskFactor: true },
          { id: 'f2', label: 'High conf finding', confidence: 0.88, isRiskFactor: true },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithLowConfidence });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      const lowConfIdx = html.indexOf('Low conf finding');
      const warningIdx = html.indexOf('Low confidence: check the photo');
      
      assert.ok(warningIdx > lowConfIdx, 'Low confidence warning should appear after the low confidence finding label');
      assert.ok(html.match(/Low confidence: check the photo/g)?.length === 1, 'Warning should appear only once for the low confidence finding');
    });

    it('does not render low confidence warning for findings at or above 75%', () => {
      const jobWithHighConfidence: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'Exactly 75%', confidence: 0.75, isRiskFactor: true },
          { id: 'f2', label: 'Above 75%', confidence: 0.88, isRiskFactor: true },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithHighConfidence });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(!html.includes('Low confidence: check the photo'));
    });
  });
});

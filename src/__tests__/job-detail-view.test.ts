import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DetailedJobData, MeasurementItem } from '../components/job-detail/types.js';
import { formatConfidence, isMeasurementOutOfRange } from '../components/job-detail/helpers.js';
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
  });
});

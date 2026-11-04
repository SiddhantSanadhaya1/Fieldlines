import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DetailedJobData, FindingItem, MeasurementItem } from '../components/job-detail/types.js';
import { formatConfidence, isMeasurementOutOfRange, sortFindings, getFindingsSummary } from '../components/job-detail/helpers.js';
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

    it('sortFindings sorts risk factors first, lowest confidence first within each group', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'High conf risk', confidence: 0.91, isRiskFactor: true },
        { id: 'f2', label: 'Low conf risk', confidence: 0.78, isRiskFactor: true },
        { id: 'f3', label: 'High conf non-risk', confidence: 0.96, isRiskFactor: false },
      ];

      const sorted = sortFindings(findings);

      assert.equal(sorted[0].id, 'f2'); // Low conf risk (0.78)
      assert.equal(sorted[1].id, 'f1'); // High conf risk (0.91)
      assert.equal(sorted[2].id, 'f3'); // High conf non-risk (0.96)
    });

    it('sortFindings does not mutate the original array', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'A', confidence: 0.91, isRiskFactor: true },
        { id: 'f2', label: 'B', confidence: 0.78, isRiskFactor: true },
      ];

      const originalOrder = findings.map((f) => f.id);
      sortFindings(findings);

      assert.deepEqual(findings.map((f) => f.id), originalOrder);
    });

    it('sortFindings handles empty array', () => {
      const sorted = sortFindings([]);
      assert.deepEqual(sorted, []);
    });

    it('sortFindings handles single finding', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Only', confidence: 0.85, isRiskFactor: true },
      ];
      const sorted = sortFindings(findings);
      assert.equal(sorted.length, 1);
      assert.equal(sorted[0].id, 'f1');
    });

    it('getFindingsSummary generates correct summary for findings with risk factors', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Risk 1', confidence: 0.88, isRiskFactor: true },
        { id: 'f2', label: 'Risk 2', confidence: 0.72, isRiskFactor: true },
      ];

      const summary = getFindingsSummary(findings);
      assert.equal(summary, '2 findings, 2 count toward risk, adding 4 points');
    });

    it('getFindingsSummary generates correct summary for findings without risk factors', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Normal', confidence: 0.97, isRiskFactor: false },
      ];

      const summary = getFindingsSummary(findings);
      assert.equal(summary, '1 finding, none count toward risk');
    });

    it('getFindingsSummary handles mixed risk and non-risk findings', () => {
      const findings: FindingItem[] = [
        { id: 'f1', label: 'Risk', confidence: 0.85, isRiskFactor: true },
        { id: 'f2', label: 'Non-risk', confidence: 0.95, isRiskFactor: false },
        { id: 'f3', label: 'Risk 2', confidence: 0.80, isRiskFactor: true },
      ];

      const summary = getFindingsSummary(findings);
      assert.equal(summary, '3 findings, 2 count toward risk, adding 4 points');
    });

    it('getFindingsSummary handles empty array', () => {
      const summary = getFindingsSummary([]);
      assert.equal(summary, '0 findings, none count toward risk');
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

    it('findings tab includes summary line with correct counts and points', () => {
      const controller = new JobDetailViewController({ job: sampleJob });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(html.includes('2 findings, 1 count toward risk, adding 2 points'));
    });

    it('findings tab sorts risk factors first, lowest confidence first', () => {
      const jobWithMultipleFindings: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'High conf risk', confidence: 0.91, isRiskFactor: true },
          { id: 'f2', label: 'Low conf risk', confidence: 0.78, isRiskFactor: true },
          { id: 'f3', label: 'High conf non-risk', confidence: 0.96, isRiskFactor: false },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithMultipleFindings });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      const lowConfRiskIndex = html.indexOf('Low conf risk');
      const highConfRiskIndex = html.indexOf('High conf risk');
      const highConfNonRiskIndex = html.indexOf('High conf non-risk');

      assert.ok(lowConfRiskIndex < highConfRiskIndex, 'Low confidence risk should appear before high confidence risk');
      assert.ok(highConfRiskIndex < highConfNonRiskIndex, 'Risk factors should appear before non-risk factors');
    });

    it('findings tab shows low confidence warning for findings below 75%', () => {
      const jobWithLowConfidence: DetailedJobData = {
        ...sampleJob,
        findings: [
          { id: 'f1', label: 'Low confidence finding', confidence: 0.72, isRiskFactor: true },
          { id: 'f2', label: 'High confidence finding', confidence: 0.88, isRiskFactor: true },
          { id: 'f3', label: 'Exactly 75%', confidence: 0.75, isRiskFactor: true },
        ],
      };

      const controller = new JobDetailViewController({ job: jobWithLowConfidence });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(html.includes('Low confidence: check the photo'));

      const lowConfWarningCount = (html.match(/Low confidence: check the photo/g) || []).length;
      assert.equal(lowConfWarningCount, 1, 'Only findings below 75% should show the warning');
    });
  });

  describe('Acceptance Criteria Examples', () => {
    it('Job FL-4821 displays findings in correct order per AC', () => {
      const fl4821: DetailedJobData = {
        ...sampleJob,
        id: 'FL-4821',
        findings: [
          { id: 'f1', label: 'Connector not fully seated at ONT port', confidence: 0.91, isRiskFactor: true },
          { id: 'f2', label: 'Splice enclosure left unsealed', confidence: 0.78, isRiskFactor: true },
          { id: 'f3', label: 'Cable route matches survey', confidence: 0.96, isRiskFactor: false },
        ],
      };

      const controller = new JobDetailViewController({ job: fl4821 });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      const spliceIndex = html.indexOf('Splice enclosure left unsealed');
      const connectorIndex = html.indexOf('Connector not fully seated at ONT port');
      const cableIndex = html.indexOf('Cable route matches survey');

      assert.ok(spliceIndex < connectorIndex, 'Splice enclosure (78%) should appear before Connector (91%)');
      assert.ok(connectorIndex < cableIndex, 'Risk factors should appear before non-risk factors');
    });

    it('Job FL-4795 displays correct summary and low confidence label per AC', () => {
      const fl4795: DetailedJobData = {
        ...sampleJob,
        id: 'FL-4795',
        findings: [
          { id: 'f1', label: 'Battery terminal corrosion', confidence: 0.88, isRiskFactor: true },
          { id: 'f2', label: 'Door seal perished', confidence: 0.72, isRiskFactor: true },
        ],
      };

      const controller = new JobDetailViewController({ job: fl4795 });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(html.includes('2 findings, 2 count toward risk, adding 4 points'));
      assert.ok(html.includes('Low confidence: check the photo'));
      
      const doorSealSection = html.substring(html.indexOf('Door seal perished'));
      const batterySection = html.substring(html.indexOf('Battery terminal corrosion'));
      
      assert.ok(doorSealSection.includes('Low confidence: check the photo'), 'Door seal (72%) should show low confidence label');
      assert.ok(!batterySection.includes('Low confidence: check the photo'), 'Battery terminal (88%) should not show low confidence label');
    });

    it('Job FL-4736 displays correct summary with no risk factors per AC', () => {
      const fl4736: DetailedJobData = {
        ...sampleJob,
        id: 'FL-4736',
        findings: [
          { id: 'f1', label: 'Installation matches survey pack', confidence: 0.97, isRiskFactor: false },
        ],
      };

      const controller = new JobDetailViewController({ job: fl4736 });
      controller.setActiveTab('findings');
      const html = controller.renderHTML();

      assert.ok(html.includes('1 finding, none count toward risk'));
    });
  });
});

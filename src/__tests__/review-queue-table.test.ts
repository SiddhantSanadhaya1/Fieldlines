import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ReviewQueueItem } from '../components/review-queue/types.js';
import { getRiskLevel, sortReviewQueueItems } from '../components/review-queue/helpers.js';
import { ReviewQueueTableController } from '../components/review-queue/ReviewQueueTable.js';

describe('FIEL-60 Review Queue Table Component', () => {
  const sampleJobs: ReviewQueueItem[] = [
    {
      id: 'JOB-1',
      technicianName: 'Bob Builder',
      jobType: 'HVAC Maintenance',
      completedAt: '2026-08-14T10:00:00.000Z',
      findingsCount: 3,
      overridesCount: 1,
      riskScore: 7, // MEDIUM
    },
    {
      id: 'JOB-2',
      technicianName: 'Alice Springs',
      jobType: 'Electrical Repair',
      completedAt: '2026-08-14T11:30:00.000Z',
      findingsCount: 5,
      overridesCount: 4,
      riskScore: 18, // HIGH
    },
    {
      id: 'JOB-3',
      technicianName: 'Charlie Brown',
      jobType: 'Plumbing Inspection',
      completedAt: '2026-08-14T09:15:00.000Z',
      findingsCount: 0,
      overridesCount: 0,
      riskScore: 2, // LOW
    },
  ];

  describe('getRiskLevel helper', () => {
    it('classifies risk score >= 10 as HIGH', () => {
      assert.equal(getRiskLevel(10), 'HIGH');
      assert.equal(getRiskLevel(25), 'HIGH');
    });

    it('classifies risk score 5-9 as MEDIUM', () => {
      assert.equal(getRiskLevel(5), 'MEDIUM');
      assert.equal(getRiskLevel(9), 'MEDIUM');
    });

    it('classifies risk score < 5 as LOW', () => {
      assert.equal(getRiskLevel(4), 'LOW');
      assert.equal(getRiskLevel(0), 'LOW');
    });
  });

  describe('sortReviewQueueItems helper', () => {
    it('sorts numerically by riskScore in descending order', () => {
      const sorted = sortReviewQueueItems(sampleJobs, 'riskScore', 'desc');
      assert.equal(sorted[0].id, 'JOB-2'); // 18
      assert.equal(sorted[1].id, 'JOB-1'); // 7
      assert.equal(sorted[2].id, 'JOB-3'); // 2
    });

    it('sorts alphabetically by technicianName in ascending order', () => {
      const sorted = sortReviewQueueItems(sampleJobs, 'technicianName', 'asc');
      assert.equal(sorted[0].technicianName, 'Alice Springs');
      assert.equal(sorted[1].technicianName, 'Bob Builder');
      assert.equal(sorted[2].technicianName, 'Charlie Brown');
    });

    it('sorts by completedAt ISO dates', () => {
      const sorted = sortReviewQueueItems(sampleJobs, 'completedAt', 'desc');
      assert.equal(sorted[0].id, 'JOB-2'); // 11:30 AM
      assert.equal(sorted[1].id, 'JOB-1'); // 10:00 AM
      assert.equal(sorted[2].id, 'JOB-3'); // 09:15 AM
    });
  });

  describe('ReviewQueueTableController', () => {
    it('initializes with default sort riskScore DESC', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      const state = table.getSortState();
      assert.equal(state.column, 'riskScore');
      assert.equal(state.direction, 'desc');

      const sorted = table.getSortedJobs();
      assert.equal(sorted[0].id, 'JOB-2');
    });

    it('toggles sort direction when clicking the active sort column header', () => {
      const table = new ReviewQueueTableController({
        jobs: sampleJobs,
        defaultSortColumn: 'findingsCount',
        defaultSortDirection: 'asc',
      });

      table.handleHeaderClick('findingsCount');
      assert.equal(table.getSortState().direction, 'desc');
    });

    it('resets sort direction to ASC when clicking a new sort column header', () => {
      const table = new ReviewQueueTableController({
        jobs: sampleJobs,
        defaultSortColumn: 'riskScore',
        defaultSortDirection: 'desc',
      });

      table.handleHeaderClick('technicianName');
      const state = table.getSortState();
      assert.equal(state.column, 'technicianName');
      assert.equal(state.direction, 'asc');
    });

    it('triggers onSelectJob callback when handleRowClick is invoked', () => {
      let selectedId = '';
      const table = new ReviewQueueTableController({
        jobs: sampleJobs,
        onSelectJob: (id) => {
          selectedId = id;
        },
      });

      table.handleRowClick('JOB-2');
      assert.equal(selectedId, 'JOB-2');
    });

    it('renders HTML table string containing columns, risk badges, and rows', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      const html = table.renderHTML();

      assert.ok(html.includes('<table class="review-queue-table">'));
      assert.ok(html.includes('Technician'));
      assert.ok(html.includes('badge-high'));
      assert.ok(html.includes('badge-medium'));
      assert.ok(html.includes('badge-low'));
      assert.ok(html.includes('Alice Springs'));
    });
  });

  describe('Risk level filtering', () => {
    it('filters to HIGH risk jobs (score >= 10)', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      table.handleFilterClick('HIGH');

      const filtered = table.getSortedJobs();
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'JOB-2');
      assert.ok(filtered[0].riskScore >= 10);
    });

    it('filters to MEDIUM risk jobs (score 5-9)', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      table.handleFilterClick('MEDIUM');

      const filtered = table.getSortedJobs();
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'JOB-1');
      assert.ok(filtered[0].riskScore >= 5 && filtered[0].riskScore < 10);
    });

    it('filters to LOW risk jobs (score < 5)', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      table.handleFilterClick('LOW');

      const filtered = table.getSortedJobs();
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, 'JOB-3');
      assert.ok(filtered[0].riskScore < 5);
    });

    it('clears filter when clicking active filter button again', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      table.handleFilterClick('HIGH');
      assert.equal(table.getSortedJobs().length, 1);

      table.handleFilterClick('HIGH');
      assert.equal(table.getSortedJobs().length, 3);
      assert.equal(table.getActiveFilter(), null);
    });

    it('preserves sort order when filter is active', () => {
      const table = new ReviewQueueTableController({
        jobs: sampleJobs,
        defaultSortColumn: 'technicianName',
        defaultSortDirection: 'asc',
      });

      // Add more jobs to have multiple jobs in same risk level
      const moreJobs: ReviewQueueItem[] = [
        ...sampleJobs,
        {
          id: 'JOB-4',
          technicianName: 'Zara Williams',
          jobType: 'Network Install',
          completedAt: '2026-08-14T12:00:00.000Z',
          findingsCount: 2,
          overridesCount: 3,
          riskScore: 15, // HIGH
        },
        {
          id: 'JOB-5',
          technicianName: 'Derek Smith',
          jobType: 'Cable Repair',
          completedAt: '2026-08-14T13:00:00.000Z',
          findingsCount: 4,
          overridesCount: 2,
          riskScore: 12, // HIGH
        },
      ];

      const tableWithMore = new ReviewQueueTableController({
        jobs: moreJobs,
        defaultSortColumn: 'technicianName',
        defaultSortDirection: 'asc',
      });

      tableWithMore.handleFilterClick('HIGH');
      const filtered = tableWithMore.getSortedJobs();

      assert.equal(filtered.length, 3);
      assert.equal(filtered[0].technicianName, 'Alice Springs');
      assert.equal(filtered[1].technicianName, 'Derek Smith');
      assert.equal(filtered[2].technicianName, 'Zara Williams');
    });

    it('counts jobs at each risk level correctly', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      const counts = table.getRiskLevelCounts();

      assert.equal(counts.HIGH, 1);
      assert.equal(counts.MEDIUM, 1);
      assert.equal(counts.LOW, 1);
    });

    it('returns empty state message for empty filter result', () => {
      const onlyLowRiskJobs: ReviewQueueItem[] = [
        {
          id: 'JOB-L1',
          technicianName: 'Low Risk Person',
          jobType: 'Simple Task',
          completedAt: '2026-08-14T10:00:00.000Z',
          findingsCount: 0,
          overridesCount: 0,
          riskScore: 1, // LOW
        },
      ];

      const table = new ReviewQueueTableController({ jobs: onlyLowRiskJobs });
      table.handleFilterClick('HIGH');

      const html = table.renderHTML();
      assert.ok(html.includes('No high risk jobs awaiting review'));
      assert.ok(!html.includes('<table'));
    });

    it('renderFilterButtons includes counts for each level', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      const html = table.renderFilterButtons();

      assert.ok(html.includes('High ≥ 10 · 1'));
      assert.ok(html.includes('Medium 5–9 · 1'));
      assert.ok(html.includes('Low < 5 · 1'));
      assert.ok(html.includes('data-filter-level="HIGH"'));
      assert.ok(html.includes('data-filter-level="MEDIUM"'));
      assert.ok(html.includes('data-filter-level="LOW"'));
    });

    it('renderFilterButtons shows active state for current filter', () => {
      const table = new ReviewQueueTableController({ jobs: sampleJobs });
      table.handleFilterClick('HIGH');

      const html = table.renderFilterButtons();
      assert.ok(html.includes('badge-high active'));
      assert.ok(!html.includes('badge-medium active'));
      assert.ok(!html.includes('badge-low active'));
    });
  });
});

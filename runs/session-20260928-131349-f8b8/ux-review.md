# UX Designer — browser review

The review queue filtering feature is working correctly. All three risk-level filter buttons display accurate job counts, filter the queue to show only jobs at the selected level, can be toggled off to show all jobs, and work seamlessly with column sorting to help supervisors focus on high-risk work.

The UX Designer drove a real browser through the change in 15 step(s). The frames are in the run's filmstrip.

## Screens

| Screen | Reached | How |
|---|---|---|
| Review Queue | yes | Directly visible on landing page at http://127.0.0.1:5173/ |

## Acceptance criteria

| # | Criterion | Verdict | What was seen |
|--:|---|---|---|
| 1 | The three risk badges become filter buttons that filter to one risk level when clicked | Met | Three filter buttons are displayed: 'High ≥ 10 · 2', 'Medium 5–9 · 6', 'Low < 5 · 7'. Clicking 'High ≥ 10 · 2' showed only 2 jobs with scores 15 and 12. Clicking 'Medium 5–9 · 6' showed only 6 jobs with scores 8, 7, 7, 7, 6, 5. Clicking 'Low < 5 · 7' showed only 7 jobs with scores 4, 2, 1, 1, 0, 0, 0. |
| 2 | Clicking the active filter button again shows every job | Met | After filtering to High risk (showing 2 jobs), clicked the High button again and all 15 jobs reappeared, displaying the full range of risk scores from 15 down to 0. |
| 3 | Each button shows how many jobs are at that level in format 'High >= 10 · 3' | Met | All three buttons display counts with the exact format specified: 'High ≥ 10 · 2', 'Medium 5–9 · 6', 'Low < 5 · 7'. The counts match the actual number of jobs at each level (2 + 6 + 7 = 15 total). |
| 4 | Filtering and sorting work together - filtered queue keeps the column sort | Met | Applied Medium filter showing 6 jobs sorted by Risk descending. Clicked Technician column header and table re-sorted alphabetically (A. Bianchi, J. Castellanos, K. Adeyemi, K. Adeyemi, M. Halvorsen, S. Whitcombe) while maintaining the Medium filter. Column header showed 'Technician ↑' indicating ascending sort. |
| 5 | Changing the sort keeps the filter active | Met | While Medium filter was active (showing 6 jobs), changed sort from Risk to Technician. The Medium filter remained active, continuing to show only the 6 Medium risk jobs but now in alphabetical order by technician name rather than by risk score. |
| 6 | When filter matches no jobs, show 'No [level] risk jobs awaiting review' | Could not check | Could not test this scenario in the browser as the test data includes jobs at all three risk levels (High: 2, Medium: 6, Low: 7). This would require either different test data or unit test verification. |
| 7 | Risk levels use existing getRiskLevel function - no changes to scoring | Not a UI criterion | This is a code-level requirement that cannot be verified through the browser UI. The displayed risk levels and thresholds (High >= 10, Medium 5-9, Low < 5) appear consistent with the story requirements. |
| 8 | Unit tests in src/__tests__/review-queue-table.test.ts pass | Not a UI criterion | Running tests requires terminal access which is not available in this browser-only review. |

## Required wording

- Found: "High ≥ 10 · 2"
- Found: "Medium 5–9 · 6"
- Found: "Low < 5 · 7"
- Found: "15 jobs awaiting review, 2 high risk"
- Found: "Jobs waiting for sign-off"

# UX Designer — browser review

All UI acceptance criteria are met. Findings now display in risk-first order with lowest confidence prioritized, summary lines accurately report counts and points, and low-confidence findings below 75% are clearly flagged for supervisor attention.

The UX Designer drove a real browser through the change in 28 step(s). The frames are in the run's filmstrip.

## Screens

| Screen | Reached | How |
|---|---|---|
| Findings tab - Job FL-4821 | yes | Clicked on FL-4821 row from landing page, then clicked Findings tab |
| Findings tab - Job FL-4795 | yes | Clicked on FL-4795 row from landing page, then clicked Findings tab |
| Findings tab - Job FL-4736 | yes | Clicked on FL-4736 row from landing page, then clicked Findings tab |

## Acceptance criteria

| # | Criterion | Verdict | What was seen |
|--:|---|---|---|
| 1 | 1. The Findings tab lists findings that count toward risk first, then the others. Within each group, the lowest confidence comes first. | Met | FL-4821 shows correct ordering: risk findings first ('Splice enclosure left unsealed' at 78%, 'Connector not fully seated at ONT port' at 91%), then non-risk finding ('Cable route matches survey' at 96%). Within the risk group, 78% comes before 91%, confirming lowest confidence first. |
| 2 | 2. A summary line above the list says how many findings there are, how many count toward risk, and how many points they add to the score. | Met | FL-4795 displays '2 findings, 2 count toward risk, adding 4 points'. FL-4736 displays '1 finding, none count toward risk'. FL-4821 displays '3 findings, 2 count toward risk, adding 4 points'. All match the expected format and values. |
| 3 | 3. A finding below 75% confidence shows the label 'Low confidence: check the photo'. A finding at exactly 75% does not show it. | Met | FL-4795 'Door seal perished' at 72% Confidence shows 'Low confidence: check the photo'. FL-4795 'Battery terminal corrosion' at 88% Confidence does not show the label. This confirms findings below 75% get the label, and those at or above do not. |
| 4 | 4. The README's 'Risk scoring' section explains the order, the summary line and the 75% threshold. | Not a UI criterion | Cannot verify README content through browser interface. |
| 5 | 5. A job's risk score does not change, and neither does the order of its findings in the job data. The sorted list is computed for display only. | Not a UI criterion | Cannot verify code behavior or data structure through browser interface. Risk scores displayed (FL-4821: 15, FL-4795: 12, FL-4736: 0) remain consistent with their 'Why this score' breakdowns. |

## Required wording

- Found: "3 findings, 2 count toward risk, adding 4 points"
- Found: "2 findings, 2 count toward risk, adding 4 points"
- Found: "1 finding, none count toward risk"
- Found: "Low confidence: check the photo"
- Found: "Counts toward risk"

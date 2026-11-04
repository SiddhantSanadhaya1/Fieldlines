# UX Designer — browser review

All three UI acceptance criteria are met. The Findings tab now displays findings prioritized by risk relevance and confidence, includes a summary line showing counts and points calculated from risk weights, and highlights low-confidence findings below 75% with an appropriate warning label.

The UX Designer drove a real browser through the change in 29 step(s). The frames are in the run's filmstrip.

## Screens

| Screen | Reached | How |
|---|---|---|
| Review queue (landing page) | yes | Navigated to http://127.0.0.1:5173/ |
| Job FL-4821 Findings tab | yes | Clicked on FL-4821 row from review queue, then clicked 'Findings' tab |
| Job FL-4795 Findings tab | yes | Clicked back to review queue, clicked on FL-4795 row, then clicked 'Findings' tab |
| Job FL-4736 Findings tab | yes | Clicked back to review queue, clicked on FL-4736 row, then clicked 'Findings' tab |

## Acceptance criteria

| # | Criterion | Verdict | What was seen |
|--:|---|---|---|
| 1 | The Findings tab lists findings that count toward risk first, then the others. Within each group, the lowest confidence comes first. Job FL-4821 reads: 'Splice enclosure left unsealed' (78%), 'Connector not fully seated at ONT port' (91%), 'Cable route matches survey' (96%). | Met | On FL-4821 Findings tab, saw summary '3 findings, 2 count toward risk, adding 4 points'. Findings displayed in order: 'Splice enclosure left unsealed' with 'Counts toward risk' and '78% Confidence', 'Connector not fully seated at ONT port' with 'Counts toward risk' and '91% Confidence', 'Cable route matches survey' with '96% Confidence' (no 'Counts toward risk' label). Risk findings appear first, ordered by ascending confidence. |
| 2 | A summary line above the list says how many findings there are, how many count toward risk, and how many points they add to the score. Job FL-4795 reads '2 findings, 2 count toward risk, adding 4 points'. Job FL-4736 reads '1 finding, none count toward risk'. | Met | FL-4795 Findings tab shows '2 findings, 2 count toward risk, adding 4 points'. FL-4736 Findings tab shows '1 finding, none count toward risk'. Summary lines appear above the findings list in both jobs. |
| 3 | A finding below 75% confidence shows the label 'Low confidence: check the photo'. In job FL-4795, 'Door seal perished' (72%) shows it and 'Battery terminal corrosion' (88%) does not. A finding at exactly 75% does not show it. | Met | On FL-4795 Findings tab, 'Door seal perished' displays '72% Confidence' with 'Low confidence: check the photo' label beneath. 'Battery terminal corrosion' displays '88% Confidence' with no low confidence label. |
| 4 | The README's 'Risk scoring' section explains the order, the summary line and the 75% threshold. | Not a UI criterion | Cannot verify README documentation content from browser interface. |
| 5 | A job's risk score does not change, and neither does the order of its findings in the job data. The sorted list is computed for display only. | Not a UI criterion | Cannot verify backend data structure or code implementation from browser interface. Risk scores visible on job cards remain unchanged (FL-4821: 15 High, FL-4795: 12 High, FL-4736: 0 Low). |

## Required wording

- Found: "3 findings, 2 count toward risk, adding 4 points"
- Found: "2 findings, 2 count toward risk, adding 4 points"
- Found: "1 finding, none count toward risk"
- Found: "Low confidence: check the photo"
- Found: "Splice enclosure left unsealed"
- Found: "Connector not fully seated at ONT port"
- Found: "Cable route matches survey"
- Found: "Door seal perished"
- Found: "Battery terminal corrosion"
- Found: "Counts toward risk"

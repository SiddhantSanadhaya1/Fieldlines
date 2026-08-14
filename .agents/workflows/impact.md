---
description: Translate a ticket into the files that must change to deliver it, plus what it breaks and what is new
---

Invoke the agent-skills:requirement-impact-mapping skill.

**Step 1 — Check the graph is current:**

```bash
git show origin/graph:manifest.json
git rev-parse HEAD
```

If the graph was built at a different commit, say so before quoting anything. A
change-set computed against an older commit is confidently wrong.

**Step 2 — Map the requirement:**

```bash
python3 scripts/map-requirement.py <TICKET-KEY>
```

Add `--hops 3` to widen the impact reach, `--json` for machine-readable output.

If `scripts/map-requirement.py` does not exist in this repo, say the mapper is not set
up here and stop. Do not substitute a grep.

**Step 3 — Report three things, in this order:**

| Section | Content |
|---|---|
| **Change here** | Directly named files in rank order, each with the requirement terms that matched |
| **This may break** | Files reached along impact edges — the test surface |
| **New surface** | Requirement terms with no counterpart in the code — what has to be written from nothing |

Lead with the count, not the list: "7 files named directly, 2 reached by impact,
24 of 45 terms unmatched."

**Then say what it means for the work:**

- Mostly direct matches → an edit. Read those files in rank order and start.
- Mostly new surface → a build. Feed those terms into `/plan` as tasks with no existing
  code to extend.
- Nothing matched at all → greenfield for this requirement. Say so plainly; it is an
  answer, not a failure.

Never present the ranking as certainty. It is lexical matching over a deterministic
graph, and every row prints the term that produced it so a wrong row can be spotted.

---
description: "Sync real code progress back to Jira — reads jira-tasks.md and git history to post factual, per-ticket progress comments via Jira MCP."
---

Invoke agent-skills:jira-comment.

**Step 1 — Check prerequisites:**
Verify that:
- `jira-tasks.md` exists in the project root
- Jira MCP is connected
- Git is initialized

If any are missing, warn the user and stop.

**Step 2 — Parse progress from jira-tasks.md:**
Read `jira-tasks.md` and for each ticket determine:
- How many acceptance criteria are checked `[x]` vs unchecked `[ ]`
- Overall status: Done / In Progress / Not Started / Blocked

**Step 3 — Cross-reference git history:**
Run `git log --oneline -20` and `git diff --name-only HEAD~5..HEAD` to gather:
- Commit messages referencing ticket keys
- Files changed that map to each ticket's functional scope
- Test files added or modified

**Step 4 — Compose and post comments:**
For each ticket with evidenced progress, post a structured comment to Jira via MCP containing:
- What was implemented (specific files/functions)
- Test status
- Acceptance criteria progress (e.g. 2/3 met)
- Remaining work and blockers
- Related commit hashes

**Never post generic, boilerplate, or speculative comments. Only post what is evidenced in git or task checkboxes.**

**Step 5 — Show summary:**
```
Jira comments synced — [N] tickets updated:

  ✓ PROJ-123 → In Progress (feature X implemented, tests passing)
  ✗ PROJ-124 → Skipped (no activity found)
```

**Step 6 — Offer status transitions:**
For any ticket where all criteria are `[x]`, ask if the user wants to transition it to `In Review` in Jira.

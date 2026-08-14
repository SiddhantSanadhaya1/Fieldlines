---
description: "Generate an .md design document for the implementation just completed — reads recent commits, diffs, and spec files to produce an ADR-style summary in docs/."
---

Invoke agent-skills:documentation-and-adrs.

**Purpose:** After an implementation run (typically following `/dispatch-parallel`, `/build`, or `/execute`), produce a durable markdown document that captures *what was built*, *why*, *how it fits the codebase*, and *what future engineers should know*. This closes the gap between shipped code and the context that explains it.

**Step 1 — Check prerequisites:**
Verify that:
- Git is initialized and there is recent commit activity (last 1–20 commits)
- The working directory is inside a project with a `docs/` folder (create one if missing)
- Optional: `jira-tasks.md` exists — if so, use it to tie the doc to acceptance criteria

If git has no recent activity, warn the user and stop. Nothing to document.

**Step 2 — Determine scope:**
Ask the user (or infer from context) what to document:
- **Last task** — diff since the previous task boundary (default)
- **Last N commits** — e.g. `--commits 5`
- **Since branch point** — `git diff $(git merge-base HEAD main)..HEAD`
- **Specific ticket** — if a Jira key is passed, scope to commits matching that key

**Step 3 — Gather evidence:**
Run in parallel:
- `git log --oneline -20` — commit history
- `git diff <scope>` — actual code changes
- `git diff --name-only <scope>` — files touched
- Read any `jira-tasks.md` entries the commits reference
- Read any spec files in `docs/specs/` the implementation was built from

**Step 4 — Apply the documentation-and-adrs skill:**
Use the skill's guidance to decide the doc type:
- **ADR** (`docs/decisions/ADR-NNN-<slug>.md`) — if an architectural decision was made (new dependency, data model change, API contract, auth strategy)
- **Feature doc** (`docs/features/<slug>.md`) — if a user-facing feature shipped
- **Implementation note** (`docs/notes/<slug>.md`) — for refactors, internal changes, or technical improvements

Follow the ADR template from the skill when writing an ADR. Otherwise use this structure:

```markdown
# <Title>

**Date:** <YYYY-MM-DD>
**Commits:** <hash1>, <hash2>, ...
**Related tickets:** <JIRA-KEY or N/A>

## What
One paragraph: what was built or changed.

## Why
The motivation — the constraint, requirement, or ticket that drove this.
Pull from commit messages, jira-tasks.md, and any referenced spec.

## How
Key design choices and how the change fits the existing codebase.
Name the files/modules touched and the responsibilities added.

## Alternatives considered
If the brainstorm / plan phase surfaced tradeoffs, capture them here.
If none were surfaced, omit this section.

## Gotchas & invariants
Non-obvious things a future engineer or agent needs to know:
hidden contracts, ordering requirements, concurrency assumptions, Hyrum's-law risks.

## Verification
How this was tested — tests added, manual checks, CI gates passed.
```

**Critical:** Document the *why*, not the *what*. The diff already shows what. Your job is to capture context that would otherwise be lost — reasoning, tradeoffs, constraints, invisible contracts. Do not restate code.

**Step 5 — Write the file:**
- Pick the correct directory based on doc type
- Use sequential numbering for ADRs (check existing `docs/decisions/` and increment)
- Write the file

**Step 6 — Show summary:**
```
Documentation generated:

  ✓ docs/decisions/ADR-004-use-redis-for-rate-limiting.md
  ✓ Linked to: PROJ-123, commits a1b2c3d..e4f5g6h

Next: review the doc, edit for accuracy, commit alongside the implementation.
```

**Step 7 — Offer to commit:**
Ask if the user wants to stage and commit the new doc with a `docs:` prefixed conventional commit message.

**Never fabricate motivation or alternatives that aren't evidenced in commits, tickets, or spec files. If context is missing, leave the section empty and flag it for the user to fill in.**

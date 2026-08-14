# StatusNeo Agent Skills — Skill Discovery
> Always-loaded. Use the flowchart below to select the right skill for every task.

# Using Agent Skills

## Overview

Agent Skills is a collection of engineering workflow skills organized by development phase. Each skill encodes a specific process that senior engineers follow. This meta-skill helps you discover and apply the right skill for your current task.

## Skill Discovery

When a task arrives, identify the phase and apply the corresponding skill:

```
Task arrives
    │
    ├── Tasks from Jira backlog? ─────────────→ jira-task-ingestion
    │
    ├── Raw idea, fuzzy requirements? ────────→ idea-refine → brainstorming
    ├── Need a formal spec/PRD? ──────────────→ feature-driven-development
    │
    ├── Have a spec, need a plan? ────────────→ planning-and-task-breakdown
    │   └── Need bite-sized tasks with code? ─→ writing-plans
    │
    ├── Implementing code?
    │   ├── Execute plan with subagents? ─────→ agent-task-dispatch
    │   ├── Independent tasks in parallel? ───→ dispatching-parallel-agents
    │   ├── Execute plan inline? ─────────────→ executing-plans
    │   ├── General implementation? ──────────→ incremental-implementation
    │   ├── UI work? ─────────────────────────→ frontend-ui-engineering
    │   ├── API/interface design? ────────────→ api-and-interface-design
    │   └── Context dropping/degrading? ──────→ context-engineering
    │
    ├── Testing?
    │   ├── New feature / TDD cycle? ─────────→ test-driven-development
    │   └── Browser/runtime behavior? ────────→ browser-testing-with-devtools
    │
    ├── Something broke?
    │   ├── First attempt, need triage? ──────→ debugging-and-error-recovery
    │   ├── Persistent / multi-component? ────→ systematic-debugging
    │   └── About to declare it fixed? ───────→ verification-before-completion
    │
    ├── Reviewing code?
    │   ├── General quality review? ──────────→ code-review-and-quality
    │   ├── Dispatching a reviewer agent? ────→ requesting-code-review
    │   ├── Received review feedback? ────────→ receiving-code-review
    │   ├── Code too complex? ────────────────→ code-simplification
    │   ├── Security concerns? ───────────────→ security-and-hardening
    │   └── Performance concerns? ────────────→ performance-optimization
    │
    ├── Git / branch work?
    │   ├── Committing, branching, PRs? ──────→ git-workflow-and-versioning
    │   ├── Need isolated workspace? ─────────→ using-git-worktrees
    │   └── All tasks done, wrap up branch? ──→ finishing-a-development-branch
    │
    ├── Infrastructure / pipeline?
    │   ├── CI/CD changes? ───────────────────→ ci-cd-and-automation
    │   ├── Removing/migrating old code? ─────→ deprecation-and-migration
    │   └── Deploying to production? ─────────→ shipping-and-launch
    │
    └── Documentation?
        └── ADRs, API docs, inline docs? ─────→ documentation-and-adrs
```

## Core Operating Behaviors

These behaviors apply at all times, across all skills. They are non-negotiable.

### 1. Surface Assumptions

Before implementing anything non-trivial, explicitly state your assumptions:

```
ASSUMPTIONS I'M MAKING:
1. [assumption about requirements]
2. [assumption about architecture]
3. [assumption about scope]
→ Correct me now or I'll proceed with these.
```

Don't silently fill in ambiguous requirements. The most common failure mode is making wrong assumptions and running with them unchecked. Surface uncertainty early — it's cheaper than rework.

### 2. Manage Confusion Actively

When you encounter inconsistencies, conflicting requirements, or unclear specifications:

1. **STOP.** Do not proceed with a guess.
2. Name the specific confusion.
3. Present the tradeoff or ask the clarifying question.
4. Wait for resolution before continuing.

**Bad:** Silently picking one interpretation and hoping it's right.
**Good:** "I see X in the spec but Y in the existing code. Which takes precedence?"

### 3. Push Back When Warranted

You are not a yes-machine. When an approach has clear problems:

- Point out the issue directly
- Explain the concrete downside (quantify when possible — "this adds ~200ms latency" not "this might be slower")
- Propose an alternative
- Accept the human's decision if they override with full information

Sycophancy is a failure mode. "Of course!" followed by implementing a bad idea helps no one. Honest technical disagreement is more valuable than false agreement.

### 4. Enforce Simplicity

Your natural tendency is to overcomplicate. Actively resist it.

Before finishing any implementation, ask:
- Can this be done in fewer lines?
- Are these abstractions earning their complexity?
- Would a staff engineer look at this and say "why didn't you just..."?

If you build 1000 lines and 100 would suffice, you have failed. Prefer the boring, obvious solution. Cleverness is expensive.

### 5. Maintain Scope Discipline

Touch only what you're asked to touch.

Do NOT:
- Remove comments you don't understand
- "Clean up" code orthogonal to the task
- Refactor adjacent systems as a side effect
- Delete code that seems unused without explicit approval
- Add features not in the spec because they "seem useful"

Your job is surgical precision, not unsolicited renovation.

### 6. Verify, Don't Assume

Every skill includes a verification step. A task is not complete until verification passes. "Seems right" is never sufficient — there must be evidence (passing tests, build output, runtime data).

## Failure Modes to Avoid

These are the subtle errors that look like productivity but create problems:

1. Making wrong assumptions without checking
2. Not managing your own confusion — plowing ahead when lost
3. Not surfacing inconsistencies you notice
4. Not presenting tradeoffs on non-obvious decisions
5. Being sycophantic ("Of course!") to approaches with clear problems
6. Overcomplicating code and APIs
7. Modifying code or comments orthogonal to the task
8. Removing things you don't fully understand
9. Building without a spec because "it's obvious"
10. Skipping verification because "it looks right"

## Skill Rules

1. **Check for an applicable skill before starting work.** Skills encode processes that prevent common mistakes.

2. **Skills are workflows, not suggestions.** Follow the steps in order. Don't skip verification steps.

3. **Multiple skills can apply.** A feature implementation might involve `idea-refine` → `feature-driven-development` → `planning-and-task-breakdown` → `incremental-implementation` → `test-driven-development` → `code-review-and-quality` → `shipping-and-launch` in sequence.

4. **When in doubt, start with a spec.** If the task is non-trivial and there's no spec, begin with `feature-driven-development`.

## Lifecycle Sequence

For a complete feature, the typical skill sequence is:

```
1. idea-refine                  → Refine vague ideas, stress-test assumptions
2. brainstorming                → Design exploration, propose approaches
3. feature-driven-development   → Formal spec with acceptance criteria
4. planning-and-task-breakdown  → Dependency graph, vertical slicing
5. writing-plans                → Bite-sized tasks with exact code, no placeholders
6. using-git-worktrees          → Isolated workspace on a new branch
7. context-engineering          → Load the right context before building
8. agent-task-dispatch          → Fresh subagent per task with two-stage review
   OR executing-plans           → Inline execution with human checkpoints
   OR dispatching-parallel-agents → Concurrent execution for independent tasks
9. incremental-implementation   → Build each slice
10. test-driven-development     → Prove each slice works (RED → GREEN → REFACTOR)
11. requesting-code-review      → Dispatch reviewer subagent between tasks
12. verification-before-completion → Evidence checklist before declaring done
13. code-review-and-quality     → Full review before merge
14. security-and-hardening      → Security pass
15. performance-optimization    → Performance pass
16. git-workflow-and-versioning → Clean commit history
17. finishing-a-development-branch → Merge, PR, or discard decision
18. documentation-and-adrs      → Document the why
19. shipping-and-launch         → Pre-launch checklist, monitoring, rollback
```

Not every task needs every skill. A bug fix: `debugging-and-error-recovery` → `systematic-debugging` → `test-driven-development` → `verification-before-completion`.

## Quick Reference

| Phase | Skill | One-Line Summary |
|-------|-------|-----------------|
| Ingest | jira-task-ingestion | Fetch assigned Jira tickets → jira-tasks.md → /dispatch |
| Explore | idea-refine | Diverge/converge, stress-test assumptions, produce one-pager |
| Explore | brainstorming | Design exploration, propose approaches, write design doc |
| Define | feature-driven-development | Formal spec with acceptance criteria before code |
| Plan | planning-and-task-breakdown | Dependency graph, vertical slicing, task sizing |
| Plan | writing-plans | Bite-sized tasks with exact file paths and real code |
| Build | agent-task-dispatch | Fresh subagent per task, two-stage review |
| Build | executing-plans | Inline plan execution with human checkpoints |
| Build | dispatching-parallel-agents | Concurrent agents for independent tasks |
| Build | incremental-implementation | Thin vertical slices, test each before expanding |
| Build | context-engineering | Right context at the right time |
| Build | frontend-ui-engineering | Production-quality UI with accessibility |
| Build | api-and-interface-design | Stable interfaces with clear contracts |
| Verify | test-driven-development | RED → GREEN → REFACTOR, Beyonce Rule |
| Verify | browser-testing-with-devtools | Chrome DevTools MCP for runtime verification |
| Verify | debugging-and-error-recovery | Five-step triage: reproduce → localize → fix → guard |
| Verify | systematic-debugging | Four-phase root cause, escalate after 3 failures |
| Verify | verification-before-completion | Evidence checklist before declaring done |
| Review | requesting-code-review | Dispatch reviewer subagent with git range and requirements |
| Review | receiving-code-review | Triage feedback by severity, push back with reasoning |
| Review | code-review-and-quality | Five-axis review with quality gates |
| Review | code-simplification | Reduce complexity without changing behavior |
| Review | security-and-hardening | OWASP prevention, input validation, least privilege |
| Review | performance-optimization | Measure first, optimize only what matters |
| Ship | using-git-worktrees | Isolated workspace per feature branch |
| Ship | finishing-a-development-branch | Verify → merge, PR, keep, or discard |
| Ship | git-workflow-and-versioning | Atomic commits, clean history |
| Ship | ci-cd-and-automation | Automated quality gates on every change |
| Ship | deprecation-and-migration | Code-as-liability, safe migration patterns |
| Ship | documentation-and-adrs | Document the why, not just the what |
| Ship | shipping-and-launch | Pre-launch checklist, monitoring, rollback plan |
| Meta | skill-authoring | Create new skills following the skill anatomy format |


---



---

# StatusNeo Agent Skills — Available Commands
> These workflows are available in any IDE. Trigger by typing the command name (e.g. `/build`, `/debug`).
> On Claude Code these are native slash commands. On other IDEs, type the command and the agent will follow the workflow.

## /brainstorm
_Explore and refine a rough idea, then design it — before writing any spec or code_

Invoke agent-skills:idea-refine then agent-skills:brainstorming in sequence.

**Phase 1 — Idea Refine** (diverge/converge, use when the idea is fuzzy):

1. Restate the idea as a "How Might We" problem statement
2. Ask 3–5 sharpening questions: who is this for, what does success look like, what's been tried, why now
3. Generate 5–8 variations using inversion, constraint removal, simplification, 10x lenses
4. Cluster into 2–3 distinct directions and stress-test each: user value, feasibility, differentiation
5. Surface hidden assumptions — what you're betting is true but haven't validated
6. Produce a one-pager: Problem Statement, Recommended Direction, Key Assumptions, MVP Scope, Not Doing list
7. Save to `docs/ideas/[idea-name].md` (confirm with user first)

**Phase 2 — Design** (once direction is chosen):

1. Explore project context — existing files, patterns, constraints
2. Ask clarifying questions one at a time to understand purpose, constraints, success criteria
3. Propose 2–3 design approaches with trade-offs and a recommendation
4. Present the design in sections — get approval after each section
5. Write design doc to `docs/statusneo/specs/YYYY-MM-DD-topic-design.md`

When design is approved, proceed with `/feature` to write the formal spec, then `/plan`.

**Skip Phase 1** if the idea is already clear and you're exploring the design approach — jump straight to Phase 2.

## /build
_Implement the next task incrementally — build, test, verify, commit_

Invoke the agent-skills:incremental-implementation skill alongside agent-skills:test-driven-development.

Pick the next pending task from the plan. For each task:

1. Read the task's acceptance criteria
2. Load relevant context (existing code, patterns, types)
3. Write a failing test for the expected behavior (RED)
4. Implement the minimum code to pass the test (GREEN)
5. Run the full test suite to check for regressions
6. Run the build to verify compilation
7. Request code review via agent-skills:requesting-code-review before moving on
8. Commit with a descriptive message
9. Mark the task complete and move to the next one

If any step fails, follow the agent-skills:systematic-debugging skill.
After all tasks are complete, use `/finish` to wrap up the branch.

## /code-simplify
_Simplify code for clarity and maintainability — reduce complexity without changing behavior_

Invoke the agent-skills:code-simplification skill.

Simplify recently changed code (or the specified scope) while preserving exact behavior:

1. Read CLAUDE.md and study project conventions
2. Identify the target code — recent changes unless a broader scope is specified
3. Understand the code's purpose, callers, edge cases, and test coverage before touching it
4. Scan for simplification opportunities:
   - Deep nesting → guard clauses or extracted helpers
   - Long functions → split by responsibility
   - Nested ternaries → if/else or switch
   - Generic names → descriptive names
   - Duplicated logic → shared functions
   - Dead code → remove after confirming
5. Apply each simplification incrementally — run tests after each change
6. Verify all tests pass, the build succeeds, and the diff is clean

If tests fail after a simplification, revert that change and reconsider. Use `code-review-and-quality` to review the result.

## /debug
_Systematically find the root cause of a bug before attempting any fix_

Invoke the agent-skills:systematic-debugging skill and agent-skills:debugging-and-error-recovery skill.

No fixes without root cause investigation first. Work through four phases:

1. **Root Cause Investigation** — read error messages carefully, reproduce consistently, check recent changes, gather evidence at each component boundary
2. **Pattern Analysis** — find working examples of similar code, compare against references, identify what's different
3. **Hypothesis & Testing** — form one specific hypothesis, make the smallest possible change to test it, verify before continuing
4. **Implementation** — write a failing test first, fix the root cause (not the symptom), verify all tests pass

If 3+ fix attempts fail, stop and question the architecture — don't attempt fix #4 without discussion.

After confirming the fix works, use agent-skills:verification-before-completion to verify end-to-end before declaring done.

## /dispatch-parallel
_Spin up multiple parallel agents for independent tasks simultaneously — faster than sequential dispatch_

Invoke agent-skills:dispatching-parallel-agents.

Use when tasks in the plan are independent and can run concurrently without stepping on each other.

**Step 0 — Plan gate (blocking):**

```bash
ls docs/statusneo/plans/*.md 2>/dev/null
```

If no plan file exists, **STOP**. Do not improvise a breakdown, do not infer tasks from
`SPEC.md`, a brainstorm doc, or a Jira ticket, and do not dispatch a single subagent.
Report exactly this and end the turn:

> No implementation plan in `docs/statusneo/plans/`. This command executes a plan, it
> does not create one. Run `/plan` first — or `/feature` then `/plan` if there is no
> spec yet.

**Why this is blocking:** the two-stage review checks each task against *that task's*
acceptance criteria. With no plan there are no per-task criteria, so the review
degrades to a general code read and the quality gate is gone.

**Step 1 — Assess parallelizability:**
Read the plan and identify which tasks are independent:
- Safe to parallelize: independent feature slices, tests for separate modules, documentation tasks
- Must be sequential: database migrations, shared state changes, tasks with dependency chains
- Needs coordination: tasks sharing an API contract (define the contract first, then parallelize)

**Step 2 — Ask how many agents to spin up:**
Present the independent tasks to the user and ask:
> "I found [N] independent tasks. How many agents do you want to run in parallel? (max recommended: [N], default: [N])"

**Step 3 — Dispatch agents:**
For each parallel agent, provide:
- The specific task description and acceptance criteria
- Relevant context (files to read, patterns to follow, interfaces to implement against)
- The shared contract or interface if tasks depend on a common boundary

**Step 4 — Collect and integrate results:**
As agents complete:
1. Review each result for correctness before integrating
2. Resolve any conflicts between parallel changes (file conflicts, interface mismatches)
3. Run the full test suite after merging all results
4. Fix integration issues before proceeding

**Step 5 — Verify:**
Invoke agent-skills:verification-before-completion — all tasks must pass as a unified whole, not just individually.

## /dispatch
_Execute a plan by dispatching a fresh subagent per task with two-stage review_

Invoke the agent-skills:agent-task-dispatch skill.

**Step 0 — Plan gate (blocking):**

```bash
ls docs/statusneo/plans/*.md 2>/dev/null
```

If no plan file exists, **STOP**. Do not improvise a breakdown, do not infer tasks from
`SPEC.md`, a brainstorm doc, or a Jira ticket, and do not dispatch a single subagent.
Report exactly this and end the turn:

> No implementation plan in `docs/statusneo/plans/`. This command executes a plan, it
> does not create one. Run `/plan` first — or `/feature` then `/plan` if there is no
> spec yet.

**Why this is blocking:** the two-stage review checks each task against *that task's*
acceptance criteria. With no plan there are no per-task criteria, so the review
degrades to a general code read and the quality gate is gone.

Then execute the plan task by task using fresh subagents:

1. Read the plan from docs/statusneo/plans/
2. For each task, dispatch a fresh subagent with the task description and relevant context
3. After each task completes, run two-stage review:
   - Stage 1: Does it satisfy the spec/requirements?
   - Stage 2: Is the code quality acceptable?
4. Fix any Critical or Important issues before proceeding to the next task
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/execute` when tasks are independent and quality gates between tasks matter.

## /document
_Generate an .md design document for the implementation just completed — reads recent commits, diffs, and spec files to produce an ADR-style summary in docs/._

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

## /execute
_Execute a plan inline in the current session with human checkpoints between batches_

Invoke the agent-skills:executing-plans skill.

**Step 0 — Plan gate (blocking):**

```bash
ls docs/statusneo/plans/*.md 2>/dev/null
```

If no plan file exists, **STOP**. Do not improvise a breakdown, do not infer tasks from
`SPEC.md`, a brainstorm doc, or a Jira ticket, and do not dispatch a single subagent.
Report exactly this and end the turn:

> No implementation plan in `docs/statusneo/plans/`. This command executes a plan, it
> does not create one. Run `/plan` first — or `/feature` then `/plan` if there is no
> spec yet.

**Why this is blocking:** the two-stage review checks each task against *that task's*
acceptance criteria. With no plan there are no per-task criteria, so the review
degrades to a general code read and the quality gate is gone.

Then execute the plan in this session in batches:

1. Read the plan from docs/statusneo/plans/
2. Execute tasks in batches of 2-3, following each task's exact steps
3. After each batch, pause and present results for human review
4. Apply feedback before continuing to the next batch
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/dispatch` when you prefer to stay in one session and review progress manually at each checkpoint.

## /feature
_Start feature-driven development — clarify requirements and write a structured spec before writing code_

Invoke the agent-skills:feature-driven-development skill.

Begin by understanding what the user wants to build. Ask clarifying questions about:
1. The objective and target users
2. Core features and acceptance criteria
3. Tech stack preferences and constraints
4. Known boundaries (what to always do, ask first about, and never do)

Then generate a structured spec covering all six core areas: objective, commands, project structure, code style, testing strategy, and boundaries.

Save the spec as SPEC.md in the project root and confirm with the user before proceeding.

## /finish
_Wrap up a development branch — verify, then merge, open a PR, or discard_

Invoke the agent-skills:finishing-a-development-branch skill.

When all tasks in a plan are complete:

1. Run the full test suite — all tests must pass
2. Run the build — must be clean
3. Review the full diff against the original plan — nothing missing, nothing extra
4. Present options to the human:
   - **Merge** — merge into main directly
   - **PR** — open a pull request for team review
   - **Keep** — leave branch open for more work
   - **Discard** — abandon changes (confirms before doing this)
5. Execute the chosen option and clean up the worktree if applicable

## /jira-sync
_Sync real code progress back to Jira — reads jira-tasks.md and git history to post factual, per-ticket progress comments via Jira MCP._

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

## /jira
_Fetch Jira tickets assigned to you via Jira MCP and save to jira-tasks.md — ready for /plan or /dispatch_

Invoke agent-skills:jira-task-ingestion.

**Step 1 — Check MCP availability:**
Verify the Jira MCP server is connected. If not available, show setup instructions:

```
Jira MCP not found. Add to .mcp.json then restart Claude Code:

{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "mcp-atlassian", "--oauth"]
    }
  }
}

First run opens a browser window for Atlassian OAuth — no API token needed.
Or run: agentic-engineering init --claude  (writes this automatically)
```

**Step 2 — Determine scope:**
Ask (or infer from context):
- Filter by sprint? (`sprint in openSprints()`)
- Filter by project? (`project = PROJ`)
- Include In Review tickets?
- Default: all assigned, not Done, ordered by priority

**Step 3 — Fetch and write:**
Run the JQL query via Jira MCP. For each ticket fetch key, summary, description, acceptance criteria, priority, story points, status, labels, and URL.

Write `jira-tasks.md` in the project root. Format:
```
# Jira Tasks
_Fetched: [date]. [N] tickets._

## [KEY-123] Ticket title
**Priority:** High | **Points:** 5 | **Status:** In Progress
**URL:** [url]

### What to build
[description]

### Acceptance Criteria
- [ ] ...
```

**Step 4 — Show summary and prompt for next action:**
```
jira-tasks.md written — N tickets:
  In Progress: KEY-123, KEY-125
  To Do (High): KEY-124
  To Do (Medium): KEY-127, KEY-130

Next:
  /plan         → break into atomic subtasks
  /dispatch     → one subagent per ticket
  /dispatch-parallel → run independent tickets concurrently
```

## /plan
_Break work into small verifiable tasks with acceptance criteria and dependency ordering_

Invoke the agent-skills:planning-and-task-breakdown skill and agent-skills:writing-plans skill.

Read the existing spec (SPEC.md or equivalent) and the relevant codebase sections. Then:

1. Enter plan mode — read only, no code changes
2. Identify the dependency graph between components
3. Slice work vertically (one complete path per task, not horizontal layers)
4. Write tasks with exact file paths, real code in every step, and no placeholders
5. Add checkpoints between phases
6. Present the plan for human review and confirm execution approach:
   - **Subagent-driven** (recommended) — fresh agent per task, two-stage review → use `/dispatch`
   - **Inline** — execute tasks in this session with checkpoints → use `/execute`

Save the plan to docs/statusneo/plans/YYYY-MM-DD-feature-name.md.

## /review
_Conduct a five-axis code review — correctness, readability, architecture, security, performance_

Invoke agent-skills:code-review-and-quality, agent-skills:security-and-hardening, and agent-skills:performance-optimization. Then dispatch agent-skills:requesting-code-review for a subagent review pass.

Review current changes (staged or recent commits) across all five axes:

1. **Correctness** — Does it match the spec? Edge cases handled? Tests adequate? Race conditions?
2. **Readability** — Clear names? Straightforward logic? Well-organized?
3. **Architecture** — Follows existing patterns? Clean boundaries? Right abstraction level?
4. **Security** — Invoke agent-skills:security-and-hardening:
   - Input validated and sanitized at boundaries?
   - Secrets out of code, logs, and version control?
   - Auth/authz checked where needed?
   - Queries parameterized, output encoded?
   - New dependencies audited for known vulnerabilities?
5. **Performance** — Invoke agent-skills:performance-optimization:
   - N+1 query patterns?
   - Unbounded loops or unconstrained data fetching?
   - Missing pagination on list endpoints?
   - Unnecessary re-renders in UI components?
   - Bundle size impact?

After completing axes 1–5, dispatch a agent-skills:requesting-code-review subagent with:
- What was implemented
- The git range (BASE_SHA..HEAD_SHA)
- Requirements or plan it must satisfy

Categorize all findings as Critical, Important, or Suggestion.
Output a structured review with specific file:line references and fix recommendations.
Give a clear verdict: APPROVE or REQUEST CHANGES.

## /ship
_Run the pre-launch checklist and prepare for production deployment_

Invoke the agent-skills:shipping-and-launch skill.

Run through the complete pre-launch checklist:

1. **Code Quality** — Tests pass, build clean, lint clean, no TODOs, no console.logs
2. **Security** — npm audit clean, no secrets in code, auth in place, headers configured
3. **Performance** — Core Web Vitals good, no N+1 queries, images optimized, bundle sized
4. **Accessibility** — Keyboard nav works, screen reader compatible, contrast adequate
5. **Infrastructure** — Env vars set, migrations ready, monitoring configured
6. **Documentation** — README current, ADRs written, changelog updated

Report any failing checks and help resolve them before deployment.
Define the rollback plan before proceeding.

## /test
_Run TDD workflow — write failing tests, implement, verify. For bugs, use the Prove-It pattern._

Invoke the agent-skills:test-driven-development skill.

For new features:
1. Write tests that describe the expected behavior (they should FAIL)
2. Implement the code to make them pass
3. Refactor while keeping tests green

For bug fixes (Prove-It pattern):
1. Write a test that reproduces the bug (must FAIL)
2. Confirm the test fails
3. Implement the fix
4. Confirm the test passes
5. Run the full test suite for regressions

For browser-related issues, also invoke agent-skills:browser-testing-with-devtools to verify with Chrome DevTools MCP.

## /show-graph
_Show the published code graph and whether it matches the code you have checked out_

Invoke the agent-skills:code-graph-status skill.

CI rebuilds a deterministic code graph on every push to main and force-pushes it to an
orphan `graph` branch (`graph.json` + `manifest.json`). graphify makes no network or LLM
calls, so the graph is reproducible from a commit SHA.

```bash
git fetch -q origin graph
git show origin/graph:manifest.json
git rev-parse HEAD
git status --porcelain
```

Report one of three states:

| Condition | State |
|---|---|
| `manifest.sha` == HEAD, working tree clean | **current** |
| `manifest.sha` != HEAD | **stale** — name how many commits behind |
| `manifest.sha` == HEAD, working tree dirty | **stale locally** — name the dirty files |

This command reports; it does not rebuild.

## /verify
_Verify a fix or feature is actually complete before moving on_

Invoke the agent-skills:verification-before-completion skill.

Before declaring any task done, verify end-to-end:

1. Run the specific test(s) for the change — they must pass
2. Run the full test suite — no regressions
3. Run the build — no compile errors
4. Verify the original scenario manually if applicable
5. Check that the root cause (not just symptoms) is addressed
6. Confirm the fix/feature matches the acceptance criteria from the plan

Only mark a task complete when all checks pass. "It seems to work" is not sufficient.

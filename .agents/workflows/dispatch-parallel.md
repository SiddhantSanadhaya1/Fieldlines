---
description: Spin up multiple parallel agents for independent tasks simultaneously — faster than sequential dispatch
---

Invoke agent-skills:dispatching-parallel-agents.

Use when tasks in the plan are independent and can run concurrently without stepping on each other.

**Step 0 - Plan gate (blocking):**

First name the target: the ticket key (`FIEL-18`) or feature slug being dispatched.
Then look for a plan **for that target** - plans for other tickets do not count.

```bash
ls docs/statusneo/plans/*.md 2>/dev/null
grep -ril "<TARGET>" docs/statusneo/plans/ 2>/dev/null
```

If nothing matches the target, **STOP**. Do not dispatch a single subagent, and do not
satisfy the gate yourself: do not improvise a breakdown, do not infer tasks from
`SPEC.md`, a brainstorm doc, or a Jira ticket, and **do not run `/plan` and continue in
the same turn**. Report exactly this and end the turn:

> No implementation plan for `<TARGET>` in `docs/statusneo/plans/`. This command
> executes a plan, it does not create one. Run `/plan` first - or `/feature` then
> `/plan` if there is no spec yet.

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

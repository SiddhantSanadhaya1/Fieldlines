---
description: Execute a plan by dispatching a fresh subagent per task with two-stage review
---

Invoke the agent-skills:agent-task-dispatch skill.

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


Then execute the plan task by task using fresh subagents:

1. Read the plan from docs/statusneo/plans/
2. For each task, dispatch a fresh subagent with the task description and relevant context
3. After each task completes, run two-stage review:
   - Stage 1: Does it satisfy the spec/requirements?
   - Stage 2: Is the code quality acceptable?
4. Fix any Critical or Important issues before proceeding to the next task
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/execute` when tasks are independent and quality gates between tasks matter.

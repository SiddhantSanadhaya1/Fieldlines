---
description: Execute a plan inline in the current session with human checkpoints between batches
---

Invoke the agent-skills:executing-plans skill.

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


Then execute the plan in this session in batches:

1. Read the plan from docs/statusneo/plans/
2. Execute tasks in batches of 2-3, following each task's exact steps
3. After each batch, pause and present results for human review
4. Apply feedback before continuing to the next batch
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/dispatch` when you prefer to stay in one session and review progress manually at each checkpoint.

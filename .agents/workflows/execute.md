---
description: Execute a plan inline in the current session with human checkpoints between batches
---

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
degrades to a general code read and the quality gate is gone. Running without a plan
produces code that looks reviewed but was not.

Then execute the plan in this session in batches:

1. Read the plan from docs/statusneo/plans/
2. Execute tasks in batches of 2-3, following each task's exact steps
3. After each batch, pause and present results for human review
4. Apply feedback before continuing to the next batch
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/dispatch` when you prefer to stay in one session and review progress manually at each checkpoint.

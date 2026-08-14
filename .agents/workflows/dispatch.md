---
description: Execute a plan by dispatching a fresh subagent per task with two-stage review
---

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
degrades to a general code read and the quality gate is gone. Running without a plan
produces code that looks reviewed but was not.

Then execute the plan task by task using fresh subagents:

1. Read the plan from docs/statusneo/plans/
2. For each task, dispatch a fresh subagent with the task description and relevant context
3. After each task completes, run two-stage review:
   - Stage 1: Does it satisfy the spec/requirements?
   - Stage 2: Is the code quality acceptable?
4. Fix any Critical or Important issues before proceeding to the next task
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/execute` when tasks are independent and quality gates between tasks matter.

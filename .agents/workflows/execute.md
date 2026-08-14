---
description: Execute a plan inline in the current session with human checkpoints between batches
---

Invoke the agent-skills:executing-plans skill.

Given a plan document, execute it in this session in batches:

1. Read the plan from docs/statusneo/plans/
2. Execute tasks in batches of 2-3, following each task's exact steps
3. After each batch, pause and present results for human review
4. Apply feedback before continuing to the next batch
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/dispatch` when you prefer to stay in one session and review progress manually at each checkpoint.

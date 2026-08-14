---
description: Execute a plan by dispatching a fresh subagent per task with two-stage review
---

Invoke the agent-skills:agent-task-dispatch skill.

Given a plan document, execute it task by task using fresh subagents:

1. Read the plan from docs/statusneo/plans/
2. For each task, dispatch a fresh subagent with the task description and relevant context
3. After each task completes, run two-stage review:
   - Stage 1: Does it satisfy the spec/requirements?
   - Stage 2: Is the code quality acceptable?
4. Fix any Critical or Important issues before proceeding to the next task
5. When all tasks are done, use `/finish` to wrap up the branch

Use this over `/execute` when tasks are independent and quality gates between tasks matter.

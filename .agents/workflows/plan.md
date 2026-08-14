---
description: Break work into small verifiable tasks with acceptance criteria and dependency ordering
---

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

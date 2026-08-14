---
description: Spin up multiple parallel agents for independent tasks simultaneously — faster than sequential dispatch
---

Invoke agent-skills:dispatching-parallel-agents.

Use when tasks in the plan are independent and can run concurrently without stepping on each other.

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

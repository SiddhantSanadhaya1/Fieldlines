---
description: Systematically find the root cause of a bug before attempting any fix
---

Invoke the agent-skills:systematic-debugging skill and agent-skills:debugging-and-error-recovery skill.

No fixes without root cause investigation first. Work through four phases:

1. **Root Cause Investigation** — read error messages carefully, reproduce consistently, check recent changes, gather evidence at each component boundary
2. **Pattern Analysis** — find working examples of similar code, compare against references, identify what's different
3. **Hypothesis & Testing** — form one specific hypothesis, make the smallest possible change to test it, verify before continuing
4. **Implementation** — write a failing test first, fix the root cause (not the symptom), verify all tests pass

If 3+ fix attempts fail, stop and question the architecture — don't attempt fix #4 without discussion.

After confirming the fix works, use agent-skills:verification-before-completion to verify end-to-end before declaring done.

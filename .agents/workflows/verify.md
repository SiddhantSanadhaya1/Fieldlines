---
description: Verify a fix or feature is actually complete before moving on
---

Invoke the agent-skills:verification-before-completion skill.

Before declaring any task done, verify end-to-end:

1. Run the specific test(s) for the change — they must pass
2. Run the full test suite — no regressions
3. Run the build — no compile errors
4. Verify the original scenario manually if applicable
5. Check that the root cause (not just symptoms) is addressed
6. Confirm the fix/feature matches the acceptance criteria from the plan

Only mark a task complete when all checks pass. "It seems to work" is not sufficient.

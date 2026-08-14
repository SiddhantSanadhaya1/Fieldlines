---
description: Wrap up a development branch — verify, then merge, open a PR, or discard
---

Invoke the agent-skills:finishing-a-development-branch skill.

When all tasks in a plan are complete:

1. Run the full test suite — all tests must pass
2. Run the build — must be clean
3. Review the full diff against the original plan — nothing missing, nothing extra
4. Present options to the human:
   - **Merge** — merge into main directly
   - **PR** — open a pull request for team review
   - **Keep** — leave branch open for more work
   - **Discard** — abandon changes (confirms before doing this)
5. Execute the chosen option and clean up the worktree if applicable

---
description: Conduct a five-axis code review — correctness, readability, architecture, security, performance
---

Invoke agent-skills:code-review-and-quality, agent-skills:security-and-hardening, and agent-skills:performance-optimization. Then dispatch agent-skills:requesting-code-review for a subagent review pass.

Review current changes (staged or recent commits) across all five axes:

1. **Correctness** — Does it match the spec? Edge cases handled? Tests adequate? Race conditions?
2. **Readability** — Clear names? Straightforward logic? Well-organized?
3. **Architecture** — Follows existing patterns? Clean boundaries? Right abstraction level?
4. **Security** — Invoke agent-skills:security-and-hardening:
   - Input validated and sanitized at boundaries?
   - Secrets out of code, logs, and version control?
   - Auth/authz checked where needed?
   - Queries parameterized, output encoded?
   - New dependencies audited for known vulnerabilities?
5. **Performance** — Invoke agent-skills:performance-optimization:
   - N+1 query patterns?
   - Unbounded loops or unconstrained data fetching?
   - Missing pagination on list endpoints?
   - Unnecessary re-renders in UI components?
   - Bundle size impact?

After completing axes 1–5, dispatch a agent-skills:requesting-code-review subagent with:
- What was implemented
- The git range (BASE_SHA..HEAD_SHA)
- Requirements or plan it must satisfy

Categorize all findings as Critical, Important, or Suggestion.
Output a structured review with specific file:line references and fix recommendations.
Give a clear verdict: APPROVE or REQUEST CHANGES.

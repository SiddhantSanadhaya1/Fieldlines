---
description: Explore and refine a rough idea, then design it — before writing any spec or code
---

Invoke agent-skills:idea-refine then agent-skills:brainstorming in sequence.

**Phase 1 — Idea Refine** (diverge/converge, use when the idea is fuzzy):

1. Restate the idea as a "How Might We" problem statement
2. Ask 3–5 sharpening questions: who is this for, what does success look like, what's been tried, why now
3. Generate 5–8 variations using inversion, constraint removal, simplification, 10x lenses
4. Cluster into 2–3 distinct directions and stress-test each: user value, feasibility, differentiation
5. Surface hidden assumptions — what you're betting is true but haven't validated
6. Produce a one-pager: Problem Statement, Recommended Direction, Key Assumptions, MVP Scope, Not Doing list
7. Save to `docs/ideas/[idea-name].md` (confirm with user first)

**Phase 2 — Design** (once direction is chosen):

1. Explore project context — existing files, patterns, constraints
2. Ask clarifying questions one at a time to understand purpose, constraints, success criteria
3. Propose 2–3 design approaches with trade-offs and a recommendation
4. Present the design in sections — get approval after each section
5. Write design doc to `docs/statusneo/specs/YYYY-MM-DD-topic-design.md`

When design is approved, proceed with `/feature` to write the formal spec, then `/plan`.

**Skip Phase 1** if the idea is already clear and you're exploring the design approach — jump straight to Phase 2.

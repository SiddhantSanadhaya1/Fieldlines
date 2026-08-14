---
description: Fetch Jira tickets assigned to you via Jira MCP and save to jira-tasks.md — ready for /plan or /dispatch
---

Invoke agent-skills:jira-task-ingestion.

**Step 1 — Check MCP availability:**
Verify the Jira MCP server is connected. If not available, show setup instructions:

```
Jira MCP not found. Add to .mcp.json then restart Claude Code:

{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "mcp-atlassian", "--oauth"]
    }
  }
}

First run opens a browser window for Atlassian OAuth — no API token needed.
Or run: agentic-engineering init --claude  (writes this automatically)
```

**Step 2 — Determine scope:**
Ask (or infer from context):
- Filter by sprint? (`sprint in openSprints()`)
- Filter by project? (`project = PROJ`)
- Include In Review tickets?
- Default: all assigned, not Done, ordered by priority

**Step 3 — Fetch and write:**
Run the JQL query via Jira MCP. For each ticket fetch key, summary, description, acceptance criteria, priority, story points, status, labels, and URL.

Write `jira-tasks.md` in the project root. Format:
```
# Jira Tasks
_Fetched: [date]. [N] tickets._

## [KEY-123] Ticket title
**Priority:** High | **Points:** 5 | **Status:** In Progress
**URL:** [url]

### What to build
[description]

### Acceptance Criteria
- [ ] ...
```

**Step 4 — Show summary and prompt for next action:**
```
jira-tasks.md written — N tickets:
  In Progress: KEY-123, KEY-125
  To Do (High): KEY-124
  To Do (Medium): KEY-127, KEY-130

Next:
  /plan         → break into atomic subtasks
  /dispatch     → one subagent per ticket
  /dispatch-parallel → run independent tickets concurrently
```

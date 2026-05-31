---
title: Claude Code
---

# Claude Code

Claude Code speaks Streamable-HTTP MCP natively, so connecting Overslash is a one-liner: `claude mcp add --transport http overslash https://<your-overslash>/mcp`. On first tool use, Claude Code opens a browser, you sign in, pick or create an agent, and the binding is persisted.

## One-command setup

```bash
claude mcp add --transport http overslash https://<your-overslash>/mcp
```

The first time Claude Code invokes an Overslash tool, it opens a browser for the OAuth flow; you sign in, pick or create an agent, and the binding is saved.

By default the server is added at **local** scope (this project, just you). Add `--scope` before the name to change that:

```bash
# Shared with everyone on the project, committed to .mcp.json
claude mcp add --scope project --transport http overslash https://<your-overslash>/mcp

# Available to you across all projects
claude mcp add --scope user --transport http overslash https://<your-overslash>/mcp
```

All flags (`--transport`, `--scope`, …) must come before the server name.

## Manual `.mcp.json`

Prefer editing config by hand, or sharing it with a project? Add an `overslash` entry under `mcpServers`:

```json
{
  "mcpServers": {
    "overslash": {
      "type": "http",
      "url": "https://<your-overslash>/mcp"
    }
  }
}
```

The OAuth flow still runs on first tool use — the config only points Claude Code at the server.

## Verifying the connection

List configured servers and confirm Overslash shows as connected:

```bash
claude mcp list
```

Then, in a session, run a read-only tool to confirm the agent identity the client is acting as:

```
overslash_auth whoami
```

It returns the agent, its owning user, and org — proof the client is bound to a scoped agent rather than to you directly.

## Renaming or revoking the agent

The agent is a first-class identity owned by your user — manage it from the Overslash dashboard (rename it, inspect its audit trail, or revoke it). Revoking invalidates the client's token without touching your account; the next tool call re-runs the consent flow so you can re-bind or pick a different agent.

To drop the server from Claude Code entirely:

```bash
claude mcp remove overslash
```

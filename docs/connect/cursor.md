---
title: Cursor
---

# Cursor

Cursor uses an `mcp.json` file with the same `mcpServers` shape as Claude Code, but for a remote server it keys off a bare **`url`** field — there is no `"type": "http"` discriminator. Add an `overslash` entry pointing at your instance; on first tool use, Cursor opens a browser for the OAuth flow.

## Configure `mcp.json`

Cursor reads two locations:

- **Project** — `.cursor/mcp.json` in your repo root (share it with the team).
- **Global** — `~/.cursor/mcp.json` (available across all projects).

You can also add a server from the UI: **Settings → Tools & MCP → New server**.

```json
{
  "mcpServers": {
    "overslash": {
      "url": "https://<your-overslash>/mcp"
    }
  }
}
```

::: warning No `"type": "http"` here
Cursor infers the transport from the presence of `url`. Adding `"type": "http"` is not how Cursor's schema is documented — keep the entry to `url` (plus optional `headers`/`auth`).
:::

## Verifying the connection

Open **Settings → Tools & MCP**: the `overslash` server should list its tools (`overslash_search`, `overslash_call`, …) once the OAuth flow completes. If it shows as needing authentication, trigger any Overslash tool from the chat to launch the browser handshake. Cursor uses a fixed OAuth redirect, `cursor://anysphere.cursor-mcp/oauth/callback`, so no extra redirect configuration is needed.

## Renaming or revoking the agent

The client is bound to a scoped agent owned by your user. Rename it or revoke it from the Overslash dashboard; revoking invalidates Cursor's token without touching your account, and the next tool call re-runs consent. To remove the server from Cursor, delete the `overslash` entry from `mcp.json` (or remove it under **Settings → Tools & MCP**).

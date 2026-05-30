---
title: Windsurf
---

# Windsurf

Windsurf's MCP config uses the `mcpServers` shape, but a remote HTTP server is keyed off **`serverUrl`** — not `"type": "http"` and not `url`. Add Overslash with `serverUrl`; the first tool call triggers the OAuth handshake in the browser.

## Configure Windsurf's MCP file

Edit `~/.codeium/windsurf/mcp_config.json`, or use the UI: **Windsurf Settings → Cascade → MCP Servers** (the same panel hosts Windsurf's MCP marketplace).

```json
{
  "mcpServers": {
    "overslash": {
      "serverUrl": "https://<your-overslash>/mcp"
    }
  }
}
```

::: warning Field name matters
Windsurf expects `serverUrl` for remote HTTP servers. Using `"type": "http"` or a bare `url` (the shape other clients use) will not register the server. The `serverUrl` and `headers` fields support `${env:VAR_NAME}` interpolation if you need to inject a value from the environment.
:::

After editing the file, press the refresh button in the MCP Servers panel so Cascade reloads the config.

## Verifying the connection

In the MCP Servers panel, `overslash` should appear with its tool list (`overslash_search`, `overslash_call`, …) once authenticated. If it's still pending, invoke any Overslash tool from Cascade to launch the browser OAuth flow.

## Renaming or revoking the agent

The client acts as a scoped agent owned by your user. Rename or revoke it from the Overslash dashboard; revoking invalidates Windsurf's token without affecting your account, and the next tool call re-runs consent. To remove the server from Windsurf, delete the `overslash` entry from `mcp_config.json`.

---
title: Other MCP clients
---

# Other MCP clients

Any MCP client that supports the Streamable-HTTP transport can connect to Overslash: point it at `https://<your-overslash>/mcp` and trigger any tool to start the OAuth flow. There is **no single universal snippet**, though — the config location *and the field name for a remote URL* vary by client. Use the matrix below for the exact shape.

## Common shape

Most clients nest servers under `mcpServers` and key a remote HTTP server off a `url` field:

```json
{
  "mcpServers": {
    "overslash": {
      "url": "https://<your-overslash>/mcp"
    }
  }
}
```

This is the shape Cursor uses. Other clients differ on two points — whether they want a `type` discriminator, and what they call the URL field — so check the matrix before copying it.

## Where each client stores its config

| Client | Config location | Remote-URL field |
| --- | --- | --- |
| Claude Code | `claude mcp add` / `.mcp.json` | `type: "http"` + `url` |
| Cursor | `~/.cursor/mcp.json` or `.cursor/mcp.json` | `url` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `serverUrl` |
| OpenClaw | OpenClaw config, under `mcp.servers` | `url` + `transport: "streamable-http"` |
| Claude.ai | UI only — Customize → Connectors | n/a (paste URL) |
| ChatGPT | UI only — Settings → Connectors (Developer Mode) | n/a (paste URL) |

Each row links to a dedicated page in the sidebar with the full walkthrough. The MCP ecosystem moves quickly — if your client isn't listed, consult its own MCP docs for the field name, and **verify before relying on it rather than assuming the `url` shape above**.

## OAuth flow on first use

Whatever the field name, the handshake is the same: the first tool call opens a browser, you sign in and pick or create an agent, and the client persists that agent's bearer token. See [Connect an MCP client](./index.md#the-handshake-briefly) for the full sequence.

## When the client only supports stdio

If your client can't speak Streamable-HTTP MCP yet, use the stdio shim instead. See [Stdio fallback](./stdio-fallback.md).

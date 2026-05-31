---
title: OpenClaw
---

# OpenClaw

[OpenClaw](https://openclaw.ai) is an open-source personal AI agent that runs locally and connects to messaging platforms. It speaks MCP natively — add Overslash as an HTTP MCP server in OpenClaw's config and any conversation can call Overslash tools (`overslash_search`, `overslash_call`, …) to act on your services.

## Configure OpenClaw's MCP server list

OpenClaw stores MCP servers under `mcp.servers` in its config. Add Overslash with a `url` and the `streamable-http` transport:

```json
{
  "mcp": {
    "servers": {
      "overslash": {
        "url": "https://<your-overslash>/mcp",
        "transport": "streamable-http"
      }
    }
  }
}
```

::: tip Set `transport` explicitly
When `transport` is omitted, OpenClaw defaults to SSE. Overslash speaks Streamable-HTTP, so set `"transport": "streamable-http"` to use the right transport.
:::

Or add it from the CLI:

```bash
openclaw mcp set overslash '{"url":"https://<your-overslash>/mcp","transport":"streamable-http"}'
```

## Verifying the connection

```bash
openclaw mcp list          # overslash should be listed
openclaw mcp show overslash  # inspect its resolved config
```

On the first tool call, OpenClaw opens a browser for the OAuth flow; sign in and pick or create an agent. Once connected, any conversation can call `overslash_search`, `overslash_call`, and the other Overslash tools.

## Renaming or revoking the agent

The client is bound to a scoped agent owned by your user. Rename or revoke it from the Overslash dashboard — revoking invalidates OpenClaw's token without touching your account, and the next tool call re-runs consent. To remove the server from OpenClaw:

```bash
openclaw mcp unset overslash
```

## OpenClaw-specific notes

OpenClaw runs locally, so a `http://localhost:3000/mcp` URL works for a local Overslash instance. Per-server tuning such as `connectionTimeoutMs` and `headers` is supported in the same server entry if you need it.

External reference: [OpenClaw MCP docs](https://docs.openclaw.ai/cli/mcp).

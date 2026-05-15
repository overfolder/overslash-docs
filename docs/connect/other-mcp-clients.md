---
title: Other MCP clients
---

# Other MCP clients

Any MCP client that supports the Streamable-HTTP transport can connect to Overslash with the same JSON snippet — only the file location and field names vary by client. Drop the snippet below into your client's MCP config, restart, and trigger any Overslash tool to start the OAuth flow.

## Generic `.mcp.json` snippet

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

## Where each client stores its config

## OAuth flow on first use

## When the client only supports stdio

See [Stdio fallback](./stdio-fallback.md).

<!-- TODO: see FOLLOW_UPS.md -->

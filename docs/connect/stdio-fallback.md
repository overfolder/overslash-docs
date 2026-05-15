---
title: Stdio fallback
---

# Stdio fallback

For editors that don't yet speak Streamable-HTTP MCP, the `overslash mcp` subcommand is a 1:1 stdio↔HTTP pipe. Run `overslash mcp login` once to mint an agent token in a browser, then point your editor's MCP config at the `overslash` binary — the binary will tunnel every stdio frame to `POST /mcp` on your Overslash instance.

## When to use this path

## Step 1 — `overslash mcp login`

## Step 2 — configure your client

```json
{
  "mcpServers": {
    "overslash": {
      "command": "overslash",
      "args": ["mcp"]
    }
  }
}
```

## Profiles for multiple instances

## Troubleshooting

<!-- TODO: see FOLLOW_UPS.md -->

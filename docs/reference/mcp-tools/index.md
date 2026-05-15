---
title: MCP tools
---

# MCP tools

Overslash exposes five tools at `POST /mcp`: `overslash_search` to discover services, `overslash_call` to invoke an action (or resume a pending approval), `overslash_read` for read-only fast-path calls that skip confirmation, `overslash_auth` for identity introspection (`whoami`, `service_status`), and `overslash_approve` to resolve an approval an agent has surfaced.

::: warning Pre-release
Tool names, parameter shapes, and result formats may change.
:::

## Tools

- [`overslash_search`](./overslash_search.md)
- [`overslash_call`](./overslash_call.md)
- [`overslash_read`](./overslash_read.md)
- [`overslash_auth`](./overslash_auth.md)
- [`overslash_approve`](./overslash_approve.md)

## When to use which

<!-- TODO: see FOLLOW_UPS.md -->

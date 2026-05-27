---
title: MCP tools
---

# MCP tools

Overslash exposes five tools at `POST /mcp`: `overslash_search` to discover the services and actions a caller can reach, `overslash_read` for read-class actions that skip the confirmation prompt, `overslash_call` to invoke any action (read, write, or delete) or resume a pending approval, `overslash_auth` for identity introspection (`whoami`, `service_status`), and `overslash_approve` to resolve an approval raised by a descendant.

::: warning Pre-release
Tool names, parameter shapes, and result formats may change.
:::

## Tools

- [`overslash_search`](./overslash_search.md)
- [`overslash_read`](./overslash_read.md)
- [`overslash_call`](./overslash_call.md)
- [`overslash_auth`](./overslash_auth.md)
- [`overslash_approve`](./overslash_approve.md)

## When to use which

| Tool | Reach for it when | Class | Can return an approval? |
|---|---|---|---|
| [`overslash_search`](./overslash_search.md) | You don't yet know which service or action does the job. | Read-only | No |
| [`overslash_read`](./overslash_read.md) | You know the action and it only reads data. | Read-only (server-enforced) | No |
| [`overslash_call`](./overslash_call.md) | You need a write/delete, a read you'd rather route through the general path, or you're resuming a pending approval. | Any | **Yes** |
| [`overslash_auth`](./overslash_auth.md) | You need to know who you are (`whoami`) or whether a service is connected (`service_status`). | Read-only | No |
| [`overslash_approve`](./overslash_approve.md) | A descendant of yours raised an approval and you're resolving it. | Write | No |

A few rules of thumb:

- **Prefer `overslash_read` over `overslash_call` for read-only work.** The server rejects any non-read action routed through `overslash_read`, so a client can safely skip its confirmation prompt — the call is guaranteed not to mutate anything. See [What counts as read-only](./overslash_read.md#what-counts-as-read-only).
- **`overslash_call` is the only tool that can surface an approval** (a `pending_approval` result) and the only one that resumes one — re-call it with the `approval_id` and no `service`/`action`/`params`.
- **Pass the `service` field from a search result verbatim** to `overslash_read`/`overslash_call` — that's the *instance* name (e.g. `gmail_work`), never the `template` key (e.g. `gmail`).

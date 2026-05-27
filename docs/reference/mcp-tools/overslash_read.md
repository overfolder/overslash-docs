---
title: overslash_read
---

# `overslash_read`

A read-only variant of [`overslash_call`](./overslash_call.md). The server rejects any action that writes or deletes, so clients can safely skip their confirmation prompt — useful for fast iterations that just need to look something up.

::: warning Pre-release
:::

## Parameters

| Field | Type | Default | Notes |
|---|---|---|---|
| `service` | string | — | Instance name (e.g. `gmail_work`). Pass the `service` field from an [`overslash_search`](./overslash_search.md) result, not the `template` key. Required. |
| `action` | string | — | Action name. Required. |
| `params` | object | `{}` | Action arguments. |
| `verbose` | boolean | `false` | Return the full result including response headers and the untruncated raw body. The default compact shape (`status_code`, `duration_ms`, parsed body capped at ~8 KB) is enough for almost every read. |

There is no `approval_id` parameter — read actions never raise an approval, and approval replays always replay a write/delete (see below).

## Result shape

A successful read returns the same `status: "called"` shape as [`overslash_call`](./overslash_call.md#success):

```json
{
  "status": "called",
  "result": { "status_code": 200, "duration_ms": 88, "body": { "messages": [] } },
  "action_description": "List Gmail messages"
}
```

Errors use the same typed envelope as [`overslash_call`](./overslash_call.md#error).

## Examples

```json
{ "service": "gmail_work", "action": "list_messages", "params": { "q": "is:unread" } }
```

Routing a write through this tool is rejected before it executes:

```json
{ "service": "gmail_work", "action": "send_email", "params": { "to": "alice@example.com" } }
// → error: the resolved action's risk is not `read` — use overslash_call
```

## What counts as read-only

The server enforces the read-only guarantee — the client doesn't have to trust the action name:

- Every call is forwarded to the action gateway with `require_risk: "read"`. The gateway looks up the resolved action's risk class and **rejects with `400` if it isn't `read`** (`write`/`delete` actions are refused).
- **`approval_id` is rejected outright** — an approval resume always replays a previously permission-gated (write/delete) action, which has no place on a read-only tool. Use [`overslash_call`](./overslash_call.md) to resume an approval.
- For the `overslash` platform meta-service, only the read-class sub-actions pass: `list_pending`, `list_services`, `get_service`, `list_templates`, `get_template`. Anything else is refused with *"not read-class; use overslash_call."*

Because no call through `overslash_read` can mutate state, a client can skip its confirmation prompt for this tool.

---
title: overslash_call
---

# `overslash_call`

Invoke any service action — read, write, or delete — or resume a pending approval. This is the general-purpose tool; clients should surface a confirmation prompt before invocation unless the action is known to be read-only (in which case [`overslash_read`](./overslash_read.md) is preferred).

::: warning Pre-release
:::

## Parameters

| Field | Type | Default | Notes |
|---|---|---|---|
| `service` | string | — | Instance name (e.g. `gmail_work`). Pass the `service` field from an [`overslash_search`](./overslash_search.md) result, not the `template` key. Required for a fresh call. |
| `action` | string | — | Action name. Required for a fresh call. |
| `params` | object | `{}` | Action arguments. |
| `approval_id` | string | — | Resume a previously-approved action. **Mutually exclusive** with `service`/`action`/`params`. |
| `verbose` | boolean | `false` | Return the full result including response headers and the untruncated raw body. The default compact shape (`status_code`, `duration_ms`, parsed body capped at ~8 KB) is enough for almost every call. Ignored on approval replays. |

The tool accepts exactly two input shapes: a **fresh call** (`service` + `action` + optional `params`) or an **approval resume** (`approval_id` alone).

### Calling a service action

```json
{
  "service": "gmail_work",
  "action": "send_email",
  "params": { "to": "alice@example.com", "subject": "Hi", "body": "..." }
}
```

### Calling raw HTTP

Raw HTTP — the *Service + HTTP verb* shape (`service` + `method` + `path`, including the synthetic `http` pseudo-service) — is **not exposed through this MCP tool.** The `overslash_call` input schema accepts only `service`/`action`/`params`/`approval_id`/`verbose` and rejects everything else. Use the REST endpoint [`POST /v1/actions/call`](../rest-api/actions.md) for raw HTTP verb calls:

```json
{ "service": "stripe_prod", "method": "GET", "path": "/v1/customers?limit=10" }
```

### Resuming a pending approval

```json
{ "approval_id": "550e8400-e29b-41d4-a716-446655440000" }
```

## Result shape

The result is tagged by a `status` field: `called`, `pending_approval`, or `denied`. A failed call returns a typed error envelope instead (see [Error](#error)).

### Success

```json
{
  "status": "called",
  "result": { "status_code": 200, "duration_ms": 245, "body": { "id": "..." } },
  "action_description": "Send an email via Gmail"
}
```

`result` is the compact shape by default (headers dropped, body parsed as JSON, capped at ~8 KB). Pass `verbose: true` to get `status_code`, `headers`, the raw body string, `duration_ms`, and any `filtered_body`.

### Approval raised

When the action needs sign-off, the call returns `pending_approval` rather than executing:

```json
{
  "status": "pending_approval",
  "approval_id": "550e8400-e29b-41d4-a716-446655440000",
  "approval_url": "https://app.overslash.com/approvals/550e8400-...",
  "action_description": "Send email to alice@example.com",
  "expires_at": "2026-05-25T14:30:00Z",
  "relationship": "self",
  "suggested_tiers": [
    { "keys": ["gmail_work:send_email:alice@example.com"], "description": "this recipient" },
    { "keys": ["gmail_work:send_email:*"], "description": "anyone" }
  ],
  "auto_call_on_approve": true,
  "risk": "med",
  "permission_keys": ["gmail_work:send_email:alice@example.com"]
}
```

- **`relationship`** tells you which tool resolves the approval: `"self"` → [`overslash_approve_self`](./overslash_approve.md#self-approval-overslash-approve-self); `"downstream"` → [`overslash_approve`](./overslash_approve.md).
- **`auto_call_on_approve`** controls what happens once it's allowed. `true` (default): the gateway auto-replays the call in the background and the result lands on the execution record via webhook/audit — **no follow-up call needed.** `false`: the requesting agent is in deferred-execution mode and must replay explicitly by re-calling this tool with the `approval_id`.
- A pending approval **expires 15 minutes** after the user allows it.

### Error

A failed call returns a typed error envelope keyed by `error`:

```json
{ "error": "needs_authentication", "connection_id": "1111...", "auth_url": "https://app/connect-authorize?id=abc" }
```

Typed codes include `needs_authentication` (carries `auth_url` + `connection_id`), `reauth_required`, `missing_scopes`, `credential_missing`, and `not_in_your_chain`. A user rejection comes back as `{ "status": "denied", "reason": "..." }`.

## Examples

A write that requires approval, then the resume once it's been allowed in deferred-execution mode:

```json
// 1. Fresh call → approval raised
{ "service": "gmail_work", "action": "send_email", "params": { "to": "alice@example.com" } }
// → { "status": "pending_approval", "approval_id": "550e...", "auto_call_on_approve": false, ... }

// 2. After the user allows it (auto_call_on_approve was false), replay:
{ "approval_id": "550e8400-e29b-41d4-a716-446655440000" }
// → { "status": "called", "result": { "status_code": 200, ... } }
```

---
title: overslash_auth
---

# `overslash_auth`

Identity introspection. Two sub-actions: `whoami` returns the calling identity, its kind, and its owner/parent; `service_status` returns a named service instance's configuration and credential health. Select the sub-action with the `action` field; `service_status` takes its target under `params`.

::: warning Pre-release
:::

## `whoami`

Self-introspection for the bearer making the call — handy when a downstream call needs the caller's own `identity_id` or `org_id`.

### Parameters

```json
{ "action": "whoami" }
```

No `params`.

### Result shape

```json
{
  "org_id": "11111111-1111-1111-1111-111111111111",
  "identity_id": "22222222-2222-2222-2222-222222222222",
  "kind": "agent",
  "name": "henry",
  "parent_id": "33333333-3333-3333-3333-333333333333",
  "owner_id": "44444444-4444-4444-4444-444444444444"
}
```

| Field | Notes |
|---|---|
| `org_id` | Organization the identity belongs to. |
| `identity_id` | The calling identity's id. |
| `kind` | `user`, `agent`, or `sub_agent`. |
| `name` | Identity name. |
| `parent_id` | The identity directly above this one in the chain — an agent's owner user, or the agent that spawned a subagent. `null` for users. |
| `owner_id` | The user this identity ultimately rolls up to (audit and grants surface to them). `null` for users. |

## `service_status`

Inspect one service instance: whether it's connected and whether its credentials are healthy.

### Parameters

```json
{ "action": "service_status", "params": { "service": "gmail_work" } }
```

`params.service` is the instance name (required).

### Result shape

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "org_id": "22222222-2222-2222-2222-222222222222",
  "owner_identity_id": "33333333-3333-3333-3333-333333333333",
  "name": "gmail_work",
  "template_source": "global",
  "template_key": "gmail",
  "connection_id": "44444444-4444-4444-4444-444444444444",
  "status": "active",
  "is_system": false,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-05-15T14:20:00Z",
  "credentials_status": "ok"
}
```

| Field | Notes |
|---|---|
| `id` | Service instance id. |
| `org_id` | Organization that owns the instance. |
| `owner_identity_id` | Owning identity. Omitted for org-level instances. |
| `name` | Instance name (what you pass as `service` elsewhere). |
| `template_source` | Where the template came from (e.g. `global`). |
| `template_key` | Template the instance was created from. |
| `template_id` | Template id. Omitted when not applicable. |
| `connection_id` | Bound OAuth connection. Omitted for API-key or un-connected instances. |
| `secret_name` | Variable name of the backing secret for API-key instances. Omitted otherwise. |
| `url` | Base URL override. Omitted when unset. |
| `status` | `draft`, `active`, or `archived`. |
| `is_system` | Whether this is a built-in system service. |
| `created_at` / `updated_at` | RFC 3339 timestamps. |
| `credentials_status` | Derived credential health (omitted for services with no auth): `ok`, `needs_authentication`, `partially_degraded`, or `needs_reconnect`. |

`credentials_status` summarizes whether the instance can actually be called:

- `ok` — at least one action is fully covered by the connection's scopes.
- `needs_authentication` — no connection bound yet; run the OAuth flow first.
- `partially_degraded` — some actions covered, some not; uncovered calls `403` with `missing_scopes`.
- `needs_reconnect` — every scope-bearing action is uncovered; the connection is bound but useless.

## Examples

```json
{ "action": "whoami" }
```

```json
{ "action": "service_status", "params": { "service": "gmail_work" } }
```

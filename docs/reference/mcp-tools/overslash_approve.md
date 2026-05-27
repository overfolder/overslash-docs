---
title: overslash_approve
---

# `overslash_approve`

Resolve a pending approval that was raised by a **descendant** of the caller — the delegation case, where a user-bound client resolves its agent's approval, or an agent resolves its subagent's. It forwards to `POST /v1/approvals/{approval_id}/resolve`, and the originating action resumes server-side once allowed.

Use the `approval_id` from the `pending_approval` envelope an earlier [`overslash_call`](./overslash_call.md#approval-raised) returned. That envelope's `relationship` field tells you which tool to use: `"downstream"` → this tool; `"self"` → [`overslash_approve_self`](#self-approval-overslash-approve-self).

::: warning Pre-release
:::

## Who can call it

The tool *name* is a permission-scoping hint for clients like Claude Code — **not** the security boundary. The boundary is enforced server-side: on every call the server classifies the caller↔requester relationship and **rejects unless the caller is an ancestor of the requester** in the identity chain. A sibling or otherwise unrelated caller gets the typed `not_in_your_chain` error (org admins are the one exception — they may step in). Resolving your *own* pending approval is a separate, gated path — see [Self-approval](#self-approval-overslash-approve-self) below.

## Parameters

| Field | Type | Required | Notes |
|---|---|---|---|
| `approval_id` | string (UUID) | yes | The approval to resolve. |
| `resolution` | string | yes | One of `allow`, `deny`, or `allow_remember`. |
| `remember_keys` | string[] | with `allow_remember` | Permission keys to remember. Must be a subset of the approval's `suggested_tiers`. |
| `ttl` | string | with `allow_remember` | How long the remembered rule stays live, e.g. `24h`, `30d`. |

`allow` permits this one call; `deny` rejects it; `allow_remember` permits it **and** mints a reusable permission rule from `remember_keys` for `ttl`, so future matching calls skip the prompt.

## Result shape

Resolving returns the updated approval (an `ApprovalResponse`). The fields you'll most often read:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "allowed",
  "relationship": "downstream",
  "risk": "med",
  "permission_keys": ["gmail_work:send_email:alice@example.com"],
  "suggested_tiers": [
    { "keys": ["gmail_work:send_email:alice@example.com"], "description": "this recipient" },
    { "keys": ["gmail_work:send_email:*"], "description": "anyone" }
  ],
  "expires_at": "2026-05-25T14:30:00Z",
  "execution": {
    "id": "33333333-3333-3333-3333-333333333333",
    "status": "pending",
    "runtime": "http",
    "triggered_by": "user"
  }
}
```

| Field | Notes |
|---|---|
| `status` | `allowed`, `denied`, or `bubbled` (escalated upward). |
| `relationship` | The viewer's relationship to the requester: `self`, `downstream`, or `not_in_your_chain`. |
| `risk` | `low` (read), `med` (write), or `high` (delete). |
| `permission_keys` / `suggested_tiers` / `derived_keys` | What was granted, and the broadening ladder offered for "remember at a wider scope." |
| `execution` | Replay lifecycle of the gated action once allowed: `id`, `status` (`pending` → `executing` → `executed`/`failed`/`cancelled`/`expired`), `runtime` (`http`/`mcp`), `triggered_by` (`user`/`agent`/`auto`), `http_status_code`, and `result` once executed. Absent on deny/bubble. |

## Self-approval (`overslash_approve_self`)

A sibling tool, `overslash_approve_self`, resolves an approval the **caller itself** raised (`relationship: "self"`). It takes the same parameters and returns the same shape, but it is the genuinely "user-bound client only" path:

- It is **hidden** from `tools/list` unless the human at the keyboard has turned on self-approval for this MCP connection (the connection's `self_approve_enabled` flag). Without the flag, the tool simply isn't advertised, and the server re-checks the flag on every call so revoking it takes effect immediately.
- Pure REST callers — anything without an MCP client binding — cannot self-approve at all.

In short: an agent can resolve a descendant's approval with `overslash_approve`, but rubber-stamping its *own* request requires a human to have explicitly enabled it.

## Examples

Allow a descendant's pending approval, once:

```json
{ "approval_id": "550e8400-e29b-41d4-a716-446655440000", "resolution": "allow" }
```

Allow and remember, so the same recipient doesn't prompt again for 30 days:

```json
{
  "approval_id": "550e8400-e29b-41d4-a716-446655440000",
  "resolution": "allow_remember",
  "remember_keys": ["gmail_work:send_email:alice@example.com"],
  "ttl": "30d"
}
```

Deny:

```json
{ "approval_id": "550e8400-e29b-41d4-a716-446655440000", "resolution": "deny" }
```

## See also

- [Concepts → Approvals](../../guide/concepts/approvals.md)
- [REST API → Approvals](../rest-api/approvals.md)

---
title: Identities
---

# Identities

Overslash distinguishes three kinds of identity: the human **user** who owns an account, the **agent** that an MCP client (Claude Code, Cursor, etc.) authenticates as, and the **subagent** that an agent may spawn for a scoped task. Each has its own credentials, its own permissions, and its own audit trail — so revoking or scoping one never touches the others.

## Users

A user is a human account holder, created by signup or by admin invite. Users are the only identity kind that can sign in to the dashboard — every other identity exists in service of work a user delegated.

Each user has a **dashboard role** that controls what they can do *to the organization itself*:

- `viewer` — read-only across the org.
- `operator` — connect services, mint keys for their own agents, resolve approvals.
- `admin` — everything, plus org membership and cross-user audit.

Dashboard roles are distinct from per-service permissions. The role decides "can this user use the Approvals UI?"; per-service grants (covered in [Permissions](./permissions.md)) decide "can this user — or anyone acting on their behalf — call `gmail.send`?"

Every user automatically gets a **"Myself" group** that owns the services they personally connect. The group has a single member (the user), can't be renamed, and exists so a user's personal Gmail or GitHub credentials are scoped to them by default — admins don't get them for free. See [Permissions](./permissions.md) for how Myself fits into the wider grant model.

## Agents

An agent is a non-human identity bound to exactly one MCP client. The agent is created the first time the client completes an OAuth handshake against the Overslash MCP endpoint; from that point on, the client carries credentials that resolve to *that* agent and no other.

Three things to know about agents:

- **They are owned by one user.** Audit trails roll up to that user; permission grants given to an agent are also visible to its owner.
- **They start with zero permissions.** An agent that has just enrolled cannot call any service. The owner (or an admin) has to grant access explicitly, either directly to the agent or to a group the agent belongs to. The defaults are deliberately empty — see [Permissions](./permissions.md).
- **They are not auto-cleaned.** An agent persists until its owner revokes its credentials or archives it. Long-lived clients (a Claude.ai connector, a local Cursor) are expected to keep the same agent identity across many sessions.

## Subagents

An agent can spawn a **subagent** for a scoped task — for example, a parent agent running a multi-step workflow might spin up a short-lived worker to fetch a single dataset. The subagent is a first-class identity: its own credentials, its own permissions, its own rows in the audit log.

A few specifics worth knowing:

- **Creation.** The parent calls `create_subagent` (name, optional TTL, optional `inherit_permissions`). The response includes a `osk_…` key, returned exactly once — Overslash stores only the hash.
- **UI presentation.** The dashboard renders subagents in the same tree as agents, with a parent pointer. The `sub_agent` kind is a backend distinction kept for idle-cleanup and depth tracking; users don't need to think about it.
- **Idle cleanup.** A subagent that hasn't authenticated within the org's `subagent_idle_timeout_secs` is **archived** in two phases: first its API keys are auto-revoked and pending approvals are expired (`archived_at` is set), then after `subagent_archive_retention_days` the row is hard-deleted. While archived, calls return `403 identity_archived` with a `restorable_until` timestamp; `POST /v1/identities/{id}/restore` un-archives within the retention window. Users and agents are *never* auto-archived — only subagents.
- **Permission inheritance.** If the parent passed `inherit_permissions=true`, the subagent's effective permissions track the parent's exactly. Otherwise the subagent must be granted services explicitly, just like a top-level agent. Pattern guidance — when to use long-lived specialists vs. ephemeral workers — lives in [Permissions](./permissions.md).

## How an MCP client becomes an agent

The agent identity is created on first connect, through a standard OAuth 2.1 Authorization Code + PKCE flow:

1. The MCP client hits the Overslash MCP endpoint with no credentials. The server responds `401` and includes the OAuth metadata document pointing at `/oauth/authorize` and `/oauth/token`.
2. The client opens the authorize URL in the user's browser. The user signs in to the dashboard (or is already signed in), sees a consent screen showing the client's name and the scopes it's asking for, and approves.
3. The server creates a fresh **agent identity** owned by that user, mints an access token (a JWT with `aud=mcp`, `sub=agent_id`), and redirects back to the client's callback.
4. The client stores the token and sends `Authorization: Bearer <jwt>` on every subsequent MCP call.

One invariant is worth calling out: an MCP token must resolve to an **agent**, never a user. If a token's `sub` points at a user-kind identity, the gateway rejects the request — even though the JWT itself is valid. The user always remains a separate principal; the agent acts on their behalf. This keeps audit, revocation, and consent cleanly separated.

See [Connect → Overview](../../connect/index.md) for the per-client setup walk-throughs, and [Reference → Architecture → MCP OAuth transport](../../reference/architecture/mcp-oauth-transport.md) for the protocol details.

## Static keys vs. OAuth tokens

Overslash accepts two credential formats on the same `Authorization: Bearer …` header. They authenticate to the same identity model — only the issuance and lifecycle differ.

**OAuth bearer (JWT).** The default for interactive clients. Issued by the OAuth flow above, signed by the gateway, carries `aud=mcp` and a short expiry. The client is expected to refresh on its own schedule. Revoking the *user's* dashboard session does not invalidate already-issued MCP tokens (they expire by `exp`); to terminate an agent immediately, archive the agent identity.

**Static `osk_…` key.** For headless callers — CI jobs, cron, batch pipelines, self-hosted scripts — where there's no browser to drive an OAuth flow. Minted explicitly via `POST /v1/api-keys`, which returns the raw key material **once**; only an Argon2 hash is stored, so a lost key cannot be recovered. The key carries an optional `expires_at` and optional `scopes` (notably `"impersonate"`, which lets a service key act as an arbitrary identity via the `X-Overslash-As` header). Keys are revocable at any moment.

**Which to use:**

| Caller | Credential |
|---|---|
| An MCP client running on a user's machine | OAuth — the client handles it. |
| A scheduled job calling Overslash without a human present | `osk_` static key bound to an agent. |
| A service account shared across CI runners | Org-level service key (`POST /v1/org-service-keys`). |

Both formats land in the same authentication path: the gateway looks at the prefix, validates against the right store, and resolves to a single `AuthContext`. Downstream permission checks don't know — or care — which one you used.

See [Reference → REST API → Identities](../../reference/rest-api/identities.md) for the API shapes.

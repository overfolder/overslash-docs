---
title: Permissions
---

# Permissions

Permissions in Overslash form an inheritance chain: a user grants scopes to an agent, an agent may delegate a subset to a subagent, and every call is checked against the live chain at execution time. A gap anywhere in the chain doesn't fail the call — it raises an [approval](./approvals.md), which a human can resolve to widen the chain just enough to proceed.

## The chain: User → Agent → SubAgent

When a subagent calls an action, *every* level of its ancestry has to authorize the call. The check walks outward — subagent, then its parent agent, then the user — and the call only proceeds if no level objects.

```mermaid
flowchart TB
    call([SubAgent calls an action])
    call --> sub

    subgraph chain[Ancestor chain walk]
        direction TB
        sub{SubAgent}
        sub -->|inherit_permissions = true: skip| agent
        sub -->|has matching rule| agent
        sub -->|no rule, no inherit| gap
        agent{Agent}
        agent -->|has matching rule| user
        agent -->|no rule| gap
        user{User}
        user -->|within group ceiling| pass([Call runs])
        user -->|exceeds ceiling| deny([Denied — not approvable])
    end

    gap([Gap]) --> approval([Approval raised at the gap level])
    approval -->|allow & remember| widen([Rule planted on closest<br/>non-inheriting ancestor])
    widen -.->|next call passes| pass

    classDef node fill:#eef2ff,stroke:#6366f1,stroke-width:1px,color:#1f2937
    classDef good fill:#f0fdf4,stroke:#16a34a,stroke-width:1px,color:#1f2937
    classDef bad fill:#fef2f2,stroke:#dc2626,stroke-width:1px,color:#1f2937
    classDef warn fill:#fff7ed,stroke:#f97316,stroke-width:1px,color:#1f2937

    class sub,agent,user node
    class pass,widen good
    class deny bad
    class gap,approval warn
```

A subagent created with `inherit_permissions = true` is **skipped** during the walk — it borrows its parent's rules live rather than holding its own, so a rule the parent gains today applies to the inheriting child on its next call. A subagent created with `inherit_permissions = false` must be granted services explicitly, like a top-level agent. See [Identities](./identities.md) for how these identities relate.

## Scopes and services

Every permission — and every permission check — uses one key format:

```
{service}:{action}:{arg}
```

A call produces a concrete key; a grant matches keys, using `*` and `**` as wildcards:

| Key or grant | Meaning |
|---|---|
| `github:create_pull_request:overfolder/backend` | One action against one specific repo |
| `github:create_pull_request:*` | That action against any repo |
| `github:*:*` | Any action on GitHub |
| `github:POST:/repos/*/pulls` | A specific HTTP verb + path |
| `http:POST:api.stripe.com` | Raw HTTP to one host |
| `secret:gh_token:api.github.com` | Inject a specific secret toward one host |

The `:arg` segment comes from the action's `scope_param` (see [Services & Actions](./services-and-actions.md)), which is what lets a grant be scoped to a single resource rather than the whole service. Two pseudo-services round this out: `http` gates raw HTTP by target host, and `secret` gates secret injection by host — required alongside an `http` key so a [secret](./secrets.md) approved for one host can't be exfiltrated to another. A call is allowed when the `allow` rules on the caller's chain collectively cover its key.

## Standing permissions vs. one-off approvals

Permissions are enforced in two layers, and the difference between them is the difference between a ceiling and a key:

- **Layer 1 — the group ceiling (coarse, admin-managed).** Org admins put users into groups, and each group grants a set of services at an access level. An agent inherits its owner-user's ceiling. A request that *exceeds* the ceiling is denied outright — **no approval can override it.** The ceiling also controls visibility: a service no group grants you is hidden entirely.
- **Layer 2 — permission keys (fine, agent-specific).** Within the ceiling, an agent still needs a specific key for each action. These keys are never written by hand — they accrue when someone clicks **Allow & remember** on an [approval](./approvals.md). A read on a grant with `auto_approve_reads` skips Layer 2 entirely.

That second layer is how an approval **widens** the chain. When a resolver picks *allow & remember*, the new rule is planted on the **closest ancestor that does not inherit permissions** (the requester itself, or the nearest non-inheriting parent) — never on an inheriting subagent, whose rules would be ignored by the walk anyway. The rule carries the approved key pattern and an optional TTL, and is written only after the call actually succeeds. From then on every descendant of that ancestor passes the same key without prompting, until the TTL expires.

Users acting directly (dashboard, API Explorer, an MCP session logged in as a user) skip Layer 2 altogether — there are no permission keys for a user, only the group ceiling. The user is their own approver.

## Roles (viewer / operator / admin)

Overslash has no single global role enum. What a person or agent can do is the **access level** carried by each group grant, defined precisely against an action's `risk` (see [Services & Actions](./services-and-actions.md)):

| Access level | Permits | HTTP methods | Action risk |
|---|---|---|---|
| **viewer** (read) | Non-mutating actions only | `GET` / `HEAD` / `OPTIONS` | `read` |
| **operator** (write) | Read **plus** mutating actions | `+ POST` / `PUT` / `PATCH` | `+ write` |
| **admin** | Everything, including destructive actions | `+ DELETE` | `+ delete` |

The levels are cumulative: operator includes everything viewer can do, admin everything operator can do. A grant can also set `auto_approve_reads`, letting an agent run that service's read actions with no approval.

**Org admin** is a level above per-service grants: the authority to manage groups, templates, members, and cross-user audit. It is held by users with `is_org_admin = true`, kept in sync with membership of the system **Admins** group; an agent earns the same authority by being placed in a group with `admin` access on the system `overslash` meta-service. This is the same viewer/operator/admin framing used for the dashboard role in [Identities](./identities.md) — there, it describes what a user can do *to the org*; here, it describes the access level a grant carries *for a service*.

Finally, every user gets an automatic **"Myself" group** that owns the services they personally connect, granted to them at `admin` with `auto_approve_reads = true`. It's why a user's own Gmail or GitHub is theirs by default and not handed to admins for free; see [Identities](./identities.md) for the details.

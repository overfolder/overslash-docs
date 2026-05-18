---
title: Concepts
---

# Concepts

Overslash models a small set of primitives — identities, services, secrets, connections, approvals, and audit — and composes them into a permission chain that runs from a human user down to the action an agent is about to take. These pages explain each primitive on its own and how they fit together.

## The primitives

- [Identities](./identities.md) — users, agents, subagents
- [Services & Actions](./services-and-actions.md) — what an agent can do
- [Secrets](./secrets.md) — the encrypted vault
- [Connections](./connections.md) — OAuth credentials, reusable across agents
- [Approvals](./approvals.md) — human-in-the-loop when permissions run out
- [Permissions](./permissions.md) — the inheritance chain
- [Audit](./audit.md) — what happened, by whom, against what

## Mental model

Identities nest. An organization contains users, a user owns one or more agents, an agent may spawn subagents, and an action is always called from inside one of them. Permission and audit follow that containment — every check walks outward through the ancestors.

```mermaid
flowchart TB
    subgraph org[Org]
        direction TB
        subgraph user[User]
            direction TB
            subgraph agent[Agent]
                direction TB
                subgraph subagent[SubAgent]
                    action([Action])
                end
            end
        end
    end

    classDef org fill:#f5f7fa,stroke:#7a8599,stroke-width:1px,color:#1f2937
    classDef user fill:#eef2ff,stroke:#6366f1,stroke-width:1px,color:#1f2937
    classDef agent fill:#ecfeff,stroke:#0891b2,stroke-width:1px,color:#1f2937
    classDef subagent fill:#f0fdf4,stroke:#16a34a,stroke-width:1px,color:#1f2937
    classDef action fill:#fff7ed,stroke:#f97316,stroke-width:1px,color:#1f2937

    class org org
    class user user
    class agent agent
    class subagent subagent
    class action action
```

The rest of this page makes the diagram concrete: how permissions are named, how subagents inherit them, who can resolve an approval, and a walkthrough that ties them together.

### Permission keys

Every action call carries a key of the form `service:action:arg` — the `:arg` segment scopes the call to a specific resource.

| Key | What it permits |
|---|---|
| `github:create_pull_request:overfolder/backend` | Open a PR against one specific repo |
| `gmail:send_message:me` | Send mail from the caller's own mailbox |
| `slack:send_message:C12345` | Post to one specific Slack channel |
| `http:POST:api.stripe.com/v1/charges` | One HTTP call to one Stripe endpoint |

Grants use the same shape, with `*` and `**` as wildcards so a single rule can cover many calls:

| Grant | Covers |
|---|---|
| `gmail:*:*` | Every Gmail action against every mailbox |
| `github:create_pull_request:*` | Open PRs against any repo |
| `http:*:api.github.com/**` | Any HTTP verb to any GitHub API path |

A call is allowed when the set of `allow` rules on the caller's ancestor chain collectively covers its key. A matching `deny` rule beats any allow.

### Subagent inheritance

When an agent spawns a subagent it sets a boolean `inherit_permissions` flag.

- `inherit_permissions = false` — the subagent has its own rule set and must be granted services explicitly. Right choice for long-lived specialists where you want a minimum-privilege boundary that can't be widened by accident.
- `inherit_permissions = true` — the subagent is skipped during rule lookup; the gateway uses the parent's rules. Right choice for ephemeral workers whose privileges should track the parent's exactly. The flag is read **live**, not snapshotted: if the parent gains a rule, an inheriting subagent picks it up on the next call.

When an approval is later granted with `allow_remember`, the resulting rule is planted on the closest ancestor that does *not* inherit — never on a subagent that does. That way the rule survives the subagent being garbage-collected.

### Resolving approvals

If a call needs a key no ancestor allows, the gateway raises an **approval**, suspends the action, and waits.

| Resolver | Eligible? |
|---|---|
| The originating user | Always |
| An ancestor agent in the same chain | Yes |
| A sibling or unrelated agent | No |
| An org admin | Yes (any approval in the org) |

Resolution is one of `allow` (one-shot), `deny`, `allow_remember` (creates a persistent rule with an optional TTL like `24h` or `30d`), or `bubble_up` (pass the decision to the next eligible resolver). Every outcome lands in the audit log against the originating user.

The "ancestor agent" case is how an agent approves for its own subagent without bothering the human: a planning agent can grant its worker the narrow permission it needs to finish the task. Approvals only travel up the chain — a sibling agent or an unrelated user is never eligible.

### Walkthrough

User `alice` owns agent `claude-code`, which spawned subagent `researcher` with `inherit_permissions = true`. The researcher tries to call `github:create_pull_request:overfolder/backend`.

1. The chain walk starts at `researcher`. `inherit_permissions = true`, so its rules are skipped.
2. `claude-code` (its parent) holds no matching rule. The walk reports a **gap** — the requested key isn't covered.
3. An approval is raised, scoped to `github:create_pull_request:overfolder/backend`. Initial resolver: `alice`.
4. Either alice resolves it from the dashboard, or `claude-code` resolves it directly via the `overslash_approve` MCP tool — both are eligible because `claude-code` is an ancestor in the chain.
5. The resolver chooses `allow_remember`, optionally widens the pattern to `github:create_pull_request:overfolder/*`, and sets TTL `30d`. The rule is planted on `claude-code` (the closest non-inheriting ancestor). The suspended call resumes.
6. From here on, any descendant of `claude-code` — including a brand-new subagent spawned tomorrow — calling that key against any repo under `overfolder/*` passes the chain walk without raising another approval, until the TTL expires.

---

The pages below cover each primitive in isolation; come back here when you need to see how they fit together.

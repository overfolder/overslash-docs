---
title: Audit
---

# Audit

Every action, approval, secret access, and identity change is recorded in an append-only audit log scoped to the org. The log captures who acted (user, agent, or subagent), what action ran, against which connection, and the outcome — so an action taken three weeks ago by a now-revoked agent is still traceable end to end.

## What gets logged

Each entry names the **actor** (with the full identity chain, e.g. `spiffe://acme/user/alice/agent/henry`), the **event** (a dotted action string like `approval.resolved`), an affected **resource**, an event-specific **detail** payload, the caller's IP, and — when one identity acted as another via impersonation — who stood behind the call. The events fall into a handful of families:

| Family | Representative events |
|---|---|
| Action execution | `action.executed` (carries `replayed_from_approval` and `execution_id` when run from an approval) |
| Approvals | `approval.resolved`, `approval.bubbled`, `approval.executed`, `approval.execution_cancelled` |
| Secret access | `secret_request.created`, `secret_request.fulfilled` |
| Connections | `connection.created`, `connection.deleted`, `connection.set_default`, `connection.upgraded_scopes` |
| Permissions & groups | `permission_rule.created`, `permission_rule.deleted`, `group.created`/`updated`/`deleted`, `group.grant.created`/`deleted` |
| Identities & keys | `identity.created`, `identity.updated`, `membership.removed`, `api_key.created`, `api_key.deleted` |
| Templates | `template.created`/`updated`/`deleted`, `template.global.enabled`/`disabled`, `template.draft.*` |
| Org configuration | `org_idp_config.*`, `rate_limit.upsert`/`delete`, `byoc_credential.created`/`deleted` |

For actions whose templates declare `disclose` filters, the audit row also carries a curated **Summary** — human-readable fields like the "To" and "Subject" of an email — rendered above the raw payload so a reviewer can see what an action did without decoding it by hand.

## What is *not* logged

The audit log records *that* a credential was used and *who* used it — never the credential itself:

- **Secret values and OAuth tokens are never written to the log.** A request's resolved payload is stored for review, but template-declared sensitive fields are replaced with the `[REDACTED]` sentinel before that payload is persisted (see [Secrets](./secrets.md)). Reveal of a secret value is a dashboard-only action and produces no plaintext in any audit field.
- **Routine permission checks are not logged.** A call that passes the [permission chain](./permissions.md) cleanly produces an `action.executed` row, not a play-by-play of each ancestor check. Only approval-worthy events — an approval raised, resolved, or bubbled, and the creation or deletion of a standing rule — are recorded. Reads that short-circuit via `auto_approve_reads` likewise leave no approval trail; their `action.executed` row is the record.

The principle is that the log is sufficient to reconstruct *what happened and who is accountable*, without ever becoming a place a secret could leak.

## Retention and access

The log is **append-only** and scoped to the org — entries are never edited or deleted in the normal course of operation. Access mirrors the rest of the permission model: a user sees the entries for their own subtree (themselves and the agents and subagents beneath them), while an org admin sees the whole org, which is what makes offboarding and compliance review possible. Impersonated calls record both the acting identity and the principal behind it, so an `X-Overslash-As` action is never anonymous.

## Querying

Entries are queryable by **identity**, **service**, **time range**, and **event type**, so "everything agent `henry` did against Gmail last week" or "every `connection.deleted` this month" are both single filters. The same data backs the dashboard's audit views and the REST endpoint.

See also: [Reference → REST API → Audit](../../reference/rest-api/audit.md), and the [Approvals](./approvals.md), [Secrets](./secrets.md), and [Connections](./connections.md) pages for the events each one emits.

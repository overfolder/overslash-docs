---
title: What is Overslash?
---

# What is Overslash?

Overslash is a standalone, multi-tenant gateway that sits between AI agents and the services they need to act on. It handles the parts every agent platform ends up reinventing: an encrypted secrets vault, OAuth flows and token refresh, a User → Agent → SubAgent permission chain, human approval workflows, and authenticated HTTP execution. Agents declare what services and scopes they need; Overslash takes care of authentication, authorization, approval, and the request itself.

## Who it's for

Overslash is for anyone giving AI agents the ability to act on real services — GitHub, Gmail, Stripe, Slack, and the rest — and who would rather not rebuild authentication, approvals, and audit inside every agent loop.

- **Agent-platform builders.** If you maintain a harness like Overfolder, OpenClaw, or something homegrown, Overslash is the piece you'd otherwise write yourself: a vault, an OAuth engine, a permission model, and an execution path. Point your agents at it over plain HTTP and delete that code from your own stack.
- **Organizations running agents in production.** Multi-tenancy means each org gets isolated identities, secrets, and an audit trail, so you can answer "which agent did what, with whose authority, and when?" without trusting the agent to tell you truthfully.

It is a **standalone service**, not a library you embed and not part of any particular agent framework. Overslash knows nothing about LLMs, prompts, or agent loops — it authenticates a request, authorizes it, and runs it.

## What it replaces

Every agent platform ends up rebuilding the same five things, usually badly and usually coupled tightly to the agent loop:

1. **Secret management** — agents need keys and tokens but shouldn't hold them in context.
2. **OAuth flows** — connecting to a service means redirect handling, token storage, and refresh logic.
3. **Permission gating** — destructive actions (sending mail, opening PRs, charging cards) need a human in the loop.
4. **Audit trail** — someone has to record what ran, when, and on whose authority.
5. **Identity hierarchy** — agents spawn subagents that spawn more subagents; each action needs a clear chain of authority.

The usual result is auth code tangled into the agent loop, permissions enforced by prompt ("please ask before sending"), and secrets leaking into conversation context. Overslash extracts all of it into one service behind a clean REST API: agents reference secrets by handle, the gateway injects credentials at call time, and approvals and audit happen server-side where the agent can't bypass them.

## How it fits with MCP

MCP is one way into Overslash, not the whole of it. The same backend is exposed through **three peer surfaces**:

- a **REST API** for any HTTP client,
- a **CLI** (`overslash`) for shells and scripts, and
- an **MCP server** for MCP-aware clients (Claude Code, Claude.ai, Cursor, and others).

The MCP server speaks OAuth 2.1 over Streamable HTTP for modern clients, with a stdio fallback for clients that don't yet support it. The client authenticates as an **agent** identity — never as the user directly — so consent, revocation, and audit stay cleanly separated. See [Identities](./concepts/identities.md) for how that works.

Across all three surfaces you get the same small set of meta-tools: `overslash_search` to discover services, `overslash_read` for read-class actions, `overslash_call` to run any action or resume a pending approval, `overslash_auth` for identity introspection, and `overslash_approve` to resolve an approval raised by a descendant identity. So an agent uses the same handful of verbs whether it reaches Overslash over MCP, the CLI, or raw REST.

For client-by-client setup, see [Connect an MCP client](../connect/index.md); for the wire protocol, see [MCP OAuth transport](../reference/architecture/mcp-oauth-transport.md).

## Where to go next

- [Getting Started](./getting-started.md) — stand up Overslash and connect your first client.
- [Concepts overview](./concepts/index.md) — the mental model: identities, services, approvals, and audit.
- [Connect an MCP client](../connect/index.md) — per-client setup walk-throughs.

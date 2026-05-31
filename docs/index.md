---
layout: home

# TODO(hero media): add a real dashboard screenshot or short demo video to the
# hero `image:` field below once the UI in overslash/UI_SPEC.md stabilises. Do
# not invent a UI — the dashboard surface is not yet stable. Tracked in
# docs/FOLLOW_UPS.md → "Home & top-level" and the Cross-cutting screenshot item.

hero:
  name: Overslash
  text: Identity, secrets & authenticated execution for AI agents
  tagline: A standalone, multi-tenant gateway that sits between your agents and the outside world — so they can act, without ever touching your credentials.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Connect a client
      link: /connect/
    - theme: alt
      text: Reference
      link: /reference/

features:
  - title: Encrypted secret vault
    details: Versioned, AES-256-GCM-encrypted secrets that are never returned through the API. Agents reference them by handle; Overslash injects them at call time.
  - title: Permission chains + human approvals
    details: User → Agent → SubAgent. Every level in the identity hierarchy authorizes an action; when an agent reaches the edge of its permission chain, an out-of-band approval bubbles up to a human.
  - title: Authenticated execution
    details: Agents call services through one backend — over REST, CLI, or MCP, as high-level service+action or raw HTTP — and credentials stay server-side.
---

::: warning Pre-release
Overslash is under active development and **not yet ready for production use**. APIs, schemas, and behaviors will change without notice.
:::

## The problem

AI agents that touch external services — GitHub, Gmail, Stripe, Slack — hit the same wall every time, and every agent platform rebuilds it from scratch, badly:

- **Secret management** — agents need API keys and tokens, but shouldn't hold them in context.
- **OAuth flows** — connecting a service means redirect flows, token storage, and refresh logic.
- **Permission gating** — destructive actions (sending mail, opening PRs, charging cards) need a human in the loop.
- **Audit trail** — organizations need to know what their agents did, when, and on whose authority.
- **Identity hierarchy** — agents spawn subagents that spawn more subagents. Who approved what?

The auth code ends up coupled to the agent loop, permissions become prompt-based ("please ask before sending"), and secrets leak into conversation context.

## What Overslash is

Overslash extracts all of that into a single service with a clean API. It is **purely an auth and identity layer**: it answers one question — *"is this identity allowed to do this action with these credentials?"* — and if the answer is yes, it makes the authenticated HTTP call.

It is deliberately **not** an agent framework, an LLM router, or an orchestrator. It doesn't run prompts, schedule work, manage compute, or track which agents are online. It owns identity, secrets, OAuth, permissions, approvals, execution, the service registry, and the audit trail — and nothing else.

→ [What is Overslash?](/guide/what-is-overslash)

## One backend, three surfaces

Point your agent at Overslash, declare the services and scopes it needs, and the same backend is reachable three ways — so any HTTP client, shell-capable agent, or MCP-aware editor can use it without rebuilding the plumbing:

- **REST API** — for any HTTP client. See the [API reference](/reference/).
- **CLI** (`overslash`) — for shells and scripts, and to self-host the whole product from a single binary.
- **MCP server** — for MCP-aware clients like Claude Code, Claude.ai, ChatGPT, Cursor, and Windsurf. See [Connect a client](/connect/).

## Next steps

- [Get started](/guide/getting-started) — stand up Overslash and make your first authenticated call.
- [Connect a client](/connect/) — wire up Claude Code, Claude.ai, ChatGPT, Cursor, Windsurf, and more.
- [Reference](/reference/) — REST API, CLI, MCP tools, service registry, and architecture.

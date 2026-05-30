---
title: Status & Roadmap
---

# Status & Roadmap

Overslash is **pre-release**. Treat the README, this site, and the source repo's `SPEC.md` as the target; `STATUS.md` in the source repo is the authoritative record of what's actually implemented today. Until the first tagged release, expect breaking changes between commits — schemas, env vars, MCP tool names, and CLI flags are all in flux.

::: warning Pre-release
APIs and behaviors will change without notice. We do not yet provide upgrade guarantees, security advisories, or stability commitments.
:::

## What ships today

The gateway surface is functional end to end — an agent can authenticate, discover a service, and run an authenticated action through to a real upstream API, with approvals and audit in the path. Concretely, today you get:

- **Encrypted secret vault.** Versioned, encrypted at rest, and **never returned through the API** — agents reference secrets by handle and the gateway injects them at call time.
- **OAuth engine and connections.** Connect a service once via an OAuth flow; Overslash stores the tokens and refreshes them automatically. Credentials resolve through a three-tier cascade — a user's own client (BYOC) → org-level credentials → system defaults — so an org can bring its own OAuth app without per-user setup.
- **Service registry.** Services are described as OpenAPI blueprints with human-readable action descriptions. Nine templates ship today — **Eventbrite, GitHub, Gmail, Google Calendar, Google Drive, Resend, Slack, Stripe, and X** — alongside the built-in `overslash` platform namespace. Orgs (and, where enabled, users) can register their own.
- **Authenticated execution.** A single action surface — pick a service instance, supply an HTTP verb and path, and the gateway resolves auth and bounds the request to the service's allowed hosts. (The earlier split between raw-HTTP and connection-based calls has been collapsed into this one shape.)
- **Human approvals.** When an action exceeds what an identity is permitted, it raises an approval that a human resolves — `allow`, `deny`, or allow-and-remember with a TTL. Approvals surface as URLs, so they can be routed to any channel.
- **Identity hierarchy and permissions.** A User → Agent → SubAgent chain where every level must authorize an action, with groups as a permission ceiling. Agents start with zero permissions and are granted access explicitly.
- **Full audit trail.** Every action, approval, secret access, and connection change is recorded.
- **Rate limiting.** Two-tier limits — a shared per-user bucket plus optional per-identity caps — with standard `X-RateLimit-*` headers.
- **Dashboard.** A web UI for managing identities, services, secrets, connections, approvals, and the audit log.

All of this is reachable over the same three surfaces — **REST API, CLI (`overslash`), and MCP server** — backed by one service. For the authoritative, commit-level record of what's implemented, see `STATUS.md` in the source repo.

## What's planned

A near-term roadmap is still being finalized with the maintainers, so we're not publishing a feature-by-feature list yet — `SPEC.md` describes the target product, not a set of dated promises. For the most current signal on what's landing, watch [GitHub releases](https://github.com/overfolder/overslash/releases) and the [status page](https://status.overslash.com) linked below.

<!-- TODO (maintainer confirmation): draft "What's planned" from STATUS.md "Not Yet Built → Launch blockers". Do not publish SPEC features as roadmap promises. See FOLLOW_UPS.md → guide/. -->

## What's explicitly out of scope

The non-goals are being confirmed with the maintainers before we commit them here. The guiding principle is that Overslash is a **gateway** — it handles identity, secrets, authorization, and authenticated execution. It is deliberately *not* an agent framework, an orchestrator, or a compute platform: it knows nothing about LLMs, prompts, agent scheduling, or where agents run. Treat that as the spirit of the boundary until the detailed list is published.

<!-- TODO (maintainer confirmation): finalize the non-goals list against SPEC.md §2 (Non-Goals). See FOLLOW_UPS.md → guide/. -->

## Following along

- GitHub releases: [github.com/overfolder/overslash/releases](https://github.com/overfolder/overslash/releases)
- Live status: [status.overslash.com](https://status.overslash.com)

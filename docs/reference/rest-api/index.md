---
title: REST API
---

# REST API

Overslash's REST API lives under `/v1/*` and is the canonical interface for the dashboard, the CLI, and any custom integration. Every endpoint is authenticated with either an OAuth bearer token (agent identities) or a static `osk_` key (headless / CI). Responses are JSON; errors follow a consistent `{ "error": { "code", "message" } }` shape.

::: warning Pre-release
Endpoint paths, request shapes, and error codes may change between commits.
:::

## Base URL

## Authentication

## Errors

## Pagination

## Idempotency

## Endpoint index

- [Actions](./actions.md)
- [Approvals](./approvals.md)
- [Secrets](./secrets.md)
- [Connections](./connections.md)
- [Services](./services.md)
- [Identities](./identities.md)
- [Search](./search.md)
- [Audit](./audit.md)
- [Webhooks](./webhooks.md)
- [OAuth](./oauth.md)

<!-- TODO: see FOLLOW_UPS.md -->

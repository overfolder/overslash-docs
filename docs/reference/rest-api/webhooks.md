---
title: Webhooks
---

# Webhooks

Overslash can POST out-of-band notifications when an approval is raised or resolved. Webhooks let external systems (PagerDuty, Slack, custom dashboards) react to permission-chain gaps without polling the API.

::: warning Pre-release
:::

## `POST /v1/webhooks`

## `GET /v1/webhooks`

## Event payloads

### `approval.raised`

### `approval.resolved`

## Signing & verification

## Retries

<!-- TODO: see FOLLOW_UPS.md -->

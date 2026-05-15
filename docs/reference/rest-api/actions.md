---
title: Actions
---

# Actions

Actions are how an agent does something in the outside world. The REST surface offers two endpoints: `POST /v1/actions/call` for high-level service+action calls (`github.create_issue`, …), and `POST /v1/actions/http` for raw authenticated HTTP through a registered connection. Both return either a result, an approval handle, or a structured error.

::: warning Pre-release
:::

## `POST /v1/actions/call`

### Request

### Response

### Approval flow

## `POST /v1/actions/http`

### Request

### Response

## Error codes

<!-- TODO: see FOLLOW_UPS.md -->

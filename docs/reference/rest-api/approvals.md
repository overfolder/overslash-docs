---
title: Approvals
---

# Approvals

The approvals endpoints let an operator (or an agent surfacing one) inspect and resolve pending approvals. `GET /v1/approvals/{id}` returns the approval's state, the action it gates, and the requesting identity; `POST /v1/approvals/{id}/resolve` decides it.

::: warning Pre-release
:::

## `GET /v1/approvals/{id}`

## `GET /v1/approvals`

## `POST /v1/approvals/{id}/resolve`

### Decisions: allow_once / allow_always / deny

## Error codes

<!-- TODO: see FOLLOW_UPS.md -->

---
title: Secrets
---

# Secrets

The secrets endpoints manage the encrypted vault. You can list secrets, create new ones (which rotates to a new version), and inspect version history — but the API will **never** return decrypted secret material. Secrets are referenced by handle in service and action calls.

::: warning Pre-release
:::

## `GET /v1/secrets`

## `POST /v1/secrets`

## `GET /v1/secrets/{id}`

## `GET /v1/secrets/{id}/versions`

## `DELETE /v1/secrets/{id}`

## Error codes

<!-- TODO: see FOLLOW_UPS.md -->

---
title: Configuration
---

# Configuration

All configuration is via environment variables. The canonical list lives in `.env.example` in the source repo; the table below tracks the same set with one-line descriptions and required/optional status.

::: warning Pre-release
Variable names may be renamed before the first tagged release.
:::

## Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. |
| `SECRETS_ENCRYPTION_KEY` | Base64-encoded 32-byte AES-256 key for the secrets vault. |
| `SIGNING_KEY` | Base64-encoded 32-byte key used to sign OAuth and session tokens. |

## OAuth providers

## Email

## Billing

## Logging & telemetry

## Network

## See also

- [Self-hosting → Configuration](../guide/self-hosting/configuration.md)
- [Self-hosting → Keys & Rotation](../guide/self-hosting/keys-and-rotation.md)

<!-- TODO: see FOLLOW_UPS.md -->

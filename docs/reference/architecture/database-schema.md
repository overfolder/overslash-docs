---
title: Database schema
---

# Database schema

Overslash's persistence layer is a single PostgreSQL database. The schema is intentionally narrow — about a dozen tables — and is migrated automatically on first startup. This page captures the high-level shape; for the authoritative DDL, read the SQL migrations under `crates/overslash-db/migrations/` in the source repo.

::: warning Pre-release
The schema is not yet stable across minor versions.
:::

## Core tables

### `users`

### `agents` & `subagents`

### `secrets` & `secret_versions`

### `connections`

### `approvals`

### `services` (custom registry)

### `audit_events`

### `webhooks`

## Indexes worth knowing about

## Migration policy

<!-- TODO: see FOLLOW_UPS.md -->

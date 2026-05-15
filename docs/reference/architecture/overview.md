---
title: Architecture overview
---

# Architecture overview

Overslash is a Rust + Axum service on top of PostgreSQL, with a SvelteKit dashboard embedded into the same binary. Requests flow through a small set of layers: transport (REST or MCP), authentication (OAuth bearer or static `osk_` key), permission check (the User → Agent → SubAgent chain), execution (service registry lookup → authenticated HTTP), and audit.

::: warning Pre-release
:::

## Components

### `overslash-api` (Axum)

### `overslash-core` (domain logic)

### `overslash-db` (Postgres models & migrations)

### `overslash-mcp` (stdio shim)

### `overslash-cli` (binary entry point)

### Dashboard (SvelteKit)

## Request lifecycle

## Service registry resolution

## Where to read the code

<!-- TODO: see FOLLOW_UPS.md -->

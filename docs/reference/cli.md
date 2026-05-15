---
title: CLI
---

# CLI

The single `overslash` binary has a small set of subcommands: `web` (REST API + dashboard on one port), `serve` (API only, for cloud deployments with a separate dashboard), `mcp` (stdio↔HTTP shim for editors without Streamable-HTTP support), `watch` (poll an approval), and `admin` (operator utilities such as secret re-encryption).

::: warning Pre-release
Flags and subcommands may change.
:::

## `overslash web`

## `overslash serve`

## `overslash mcp`

### `overslash mcp login`

## `overslash watch <approval_id>`

## `overslash admin reencrypt`

## Global flags

### `--profile`

### `--config`

### `OVERSLASH_MCP_CONFIG`

<!-- TODO: see FOLLOW_UPS.md -->

---
title: CLI
---

# CLI

Overslash ships as a single `overslash` binary with seven subcommands:

| Command | Purpose |
|---|---|
| `serve` | REST API only — cloud mode, dashboard hosted separately. |
| `web` | REST API plus the embedded dashboard, served same-origin — self-hosted mode. |
| `mcp` | MCP stdio server, and the `mcp login` helper for editors without Streamable-HTTP support. |
| `watch` | Poll a pending approval until it resolves, then exit. |
| `services` | List service instances and call actions. |
| `call` | Shortcut for `services call`. |
| `admin` | Operator utilities (runbook-driven), such as secret re-encryption. |

::: warning Pre-release
Flags and subcommands may change before the first tagged release.
:::

## `overslash serve`

Start the REST API only (cloud mode — dashboard hosted separately).

| Flag | Env | Default | Description |
|---|---|---|---|
| `--host` | `HOST` | `0.0.0.0` | Address to bind on. |
| `--port` | `PORT` | `8080` | Port to bind on. |

## `overslash web`

Start the REST API and serve the embedded dashboard same-origin (self-hosted mode).

| Flag | Env | Default | Description |
|---|---|---|---|
| `--host` | `HOST` | `0.0.0.0` | Address to bind on. |
| `--port` | — | `7171` | Port to bind on. See precedence below. |

The bind port is resolved with the precedence **`--port` > `OVERSLASH_WEB_PORT` > `PORT` > `7171`**: an explicit `--port` flag always wins; otherwise `OVERSLASH_WEB_PORT` (typically written into `.env.local` for worktree isolation) is tried, then the legacy `PORT`, then the `7171` default.

## `overslash mcp`

Run the MCP stdio server. With no subcommand, `overslash mcp` speaks the Model Context Protocol over stdio — this is the form editors launch as a local MCP server.

`--profile` and `--config` are [global config-resolution flags](#global-flags) accepted here.

### `overslash mcp login`

Authenticate against an Overslash deployment via OAuth 2.1 and persist the resulting token in `~/.config/overslash/mcp.json`.

| Flag | Default | Description |
|---|---|---|
| `--server` | _prompted_ | Server URL (e.g. `https://acme.overslash.dev`). Prompted interactively if omitted. |
| `--re-auth` | `false` | Force a fresh client registration and consent even if a token is already configured. |

## `overslash watch <approval_id>`

Watch a pending approval until it resolves (or times out), then exit. Polls `GET /v1/approvals/{id}` and writes the final approval JSON to stdout.

Exit codes: **`0`** = allowed, **`1`** = denied / expired / timeout, **`2`** = error. This makes `watch` convenient to gate a script on a human decision.

| Argument / Flag | Default | Description |
|---|---|---|
| `approval_id` | — | _(positional, required)_ Approval UUID to watch. |
| `--timeout` | `15m` | Maximum time to wait, e.g. `15m`, `1h`, `900s`. |
| `--poll` | `3s` | Poll interval, e.g. `3s`, `10s`. |
| `--profile` | — | [Config-resolution flag](#global-flags). |
| `--config` | — | [Config-resolution flag](#global-flags). |

## `overslash services`

List and call services. `--profile` and `--config` are accepted as [config-resolution flags](#global-flags).

### `overslash services list`

List all service instances visible to this identity. Takes no additional flags.

### `overslash services call`

Call a service action. Accepts the shared [call fields](#call-fields) below.

## `overslash call`

Shortcut for `overslash services call` — accepts the same [call fields](#call-fields), plus `--profile` and `--config`.

### Call fields

A call resolves in one of two modes:

- **Mode A — raw HTTP**: supply `--url` (and optionally `--method`, `--header`, `--body`). The call goes through the synthetic `http` pseudo-service. See [Service registry → Raw HTTP passthrough](./service-registry.md#raw-http-passthrough).
- **Mode C — service + action**: supply `--service` and `--action`, with `--param` for each argument.

| Flag | Value | Description |
|---|---|---|
| `--service` | string | Service instance name or UUID (Mode C). |
| `--action` | string | Action key (Mode C). |
| `--param` | `KEY=VALUE` | Action parameter (repeatable; value is JSON or a plain string). |
| `--url` | string | Raw URL to call (Mode A). |
| `--method` | string | HTTP method for the raw call (Mode A, default `GET`). |
| `--header` | `KEY:VALUE` | Extra request header (repeatable, Mode A). |
| `--body` | string | Raw request body string (Mode A). |
| `--filter` | string | jq expression to filter the response body. |

## `overslash admin`

Operator commands (runbook-driven, not for day-to-day use).

### `overslash admin reencrypt`

Re-encrypt every ciphertext at rest under the active master key.

This **refuses to run unless `SECRETS_ENCRYPTION_KEY_PREVIOUS` is set**, so the only legitimate context is the middle step of a master-key rotation: the previous deploy added the new key as active and kept the old key as previous; this command rotates the ciphertext; the next deploy drops the previous key. See [Self-hosting → Keys & Rotation](../guide/self-hosting/keys-and-rotation.md).

| Flag | Default | Description |
|---|---|---|
| `--dry-run` | `false` | Decrypt and re-encrypt in memory but never write back. Surfaces rows that would fail (e.g. tagged with a third, unknown key) without mutating state. |
| `--batch` | `500` | Rows fetched per batch. |

## Global flags

These flags are accepted by the client-side commands (`watch`, `mcp`, `services`, `call`) and select which stored credential profile a command uses.

| Flag | Env | Description |
|---|---|---|
| `--profile` | — | Profile name. Reads `~/.config/overslash/mcp.<profile>.json` (and `mcp login` writes it). |
| `--config` | `OVERSLASH_MCP_CONFIG` | Override the config path entirely. |

With neither set, commands use the default `~/.config/overslash/mcp.json`. `OVERSLASH_MCP_CONFIG` is the environment equivalent of `--config`.

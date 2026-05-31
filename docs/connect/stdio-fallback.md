---
title: Stdio fallback
---

# Stdio fallback

For editors that don't yet speak Streamable-HTTP MCP, the `overslash mcp` subcommand is a 1:1 stdio↔HTTP pipe. Run `overslash mcp login` once to mint an agent token in a browser, then point your editor's MCP config at the `overslash` binary — the binary will tunnel every stdio frame to `POST /mcp` on your Overslash instance.

## When to use this path

Reach for the stdio shim only when your client **cannot** speak Streamable-HTTP MCP. If it can, prefer the direct HTTP connection — it's one binding with no local binary to keep on `PATH`. The shim exists for editors that still launch MCP servers as local stdio processes.

## Step 1 — `overslash mcp login`

Run the login once to mint an agent token:

```bash
overslash mcp login --server https://<your-overslash>
```

Omit `--server` to be prompted (it defaults to whatever is already saved). The command:

1. Discovers the auth server at `/.well-known/oauth-authorization-server`.
2. On first run, registers a client (`POST /oauth/register`) and remembers the `client_id`.
3. Generates a PKCE pair, starts a one-shot `127.0.0.1` loopback listener, and opens your browser to `/oauth/authorize`.
4. You sign in and pick or create an agent.
5. Exchanges the code at `/oauth/token` and writes the tokens to `~/.config/overslash/mcp.json` (mode `0600` on macOS/Linux).

The saved config holds `server_url`, `token`, `refresh_token`, `client_id`, and `redirect_uri`:

```json
{
  "server_url": "https://<your-overslash>",
  "token": "…",
  "refresh_token": "…",
  "client_id": "…",
  "redirect_uri": "http://127.0.0.1:<port>/callback"
}
```

<!-- TODO(verify): confirm `overslash mcp login` end-to-end against a live build on both macOS and Linux. Flow and paths above are sourced from crates/overslash-cli/src/mcp_login.rs + config.rs; not yet run against a release binary. (FOLLOW_UPS connect/stdio-fallback) -->

## Step 2 — configure your client

Point your editor's MCP config at the `overslash` binary — it tunnels every stdio frame to `POST /mcp`:

```json
{
  "mcpServers": {
    "overslash": {
      "command": "overslash",
      "args": ["mcp"]
    }
  }
}
```

## Profiles for multiple instances

To connect to more than one Overslash instance, give each a named profile. `--profile work` reads and writes `~/.config/overslash/mcp.work.json` instead of the default `mcp.json`:

```bash
overslash mcp login --profile work --server https://acme.<your-overslash>
```

Then pass the same profile through the shim in your client config:

```json
{
  "mcpServers": {
    "overslash-work": {
      "command": "overslash",
      "args": ["mcp", "--profile", "work"]
    }
  }
}
```

`--config <path>` overrides the file location outright if you need a custom path.

## Troubleshooting

- **`401` / token expired** — if a refresh token is present, the shim refreshes and retries the frame transparently. If refresh fails (or no refresh token exists), it returns a JSON-RPC error; re-run `overslash mcp login`.
- **"failed to load MCP config"** — you haven't logged in yet for this profile. Run `overslash mcp login` (with the matching `--profile`/`--config`) first.
- **Callback port already in use** — the loopback port is pinned to what was registered at first login. Re-run with `--re-auth` to force a fresh client registration and consent on a new port.

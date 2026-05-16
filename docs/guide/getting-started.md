---
title: Getting Started
---

# Getting Started

The fastest path to a running Overslash: grab a prebuilt binary, point it at a Postgres database, and start it. The single `overslash` binary embeds the dashboard, applies migrations on first boot, and exposes both the REST API and the MCP endpoint on the same port.

::: warning Pre-release
Overslash is under active development. Self-host at your own risk; expect breakage between versions.
:::

## 1. Download a binary

Grab the latest release for your platform from [github.com/overfolder/overslash/releases](https://github.com/overfolder/overslash/releases):

- `overslash-vX.Y.Z-x86_64-unknown-linux-gnu.tar.gz` — Linux x86_64
- `overslash-vX.Y.Z-aarch64-unknown-linux-gnu.tar.gz` — Linux arm64
- `overslash-vX.Y.Z-aarch64-apple-darwin.tar.gz` — macOS Apple Silicon
- `overslash-vX.Y.Z-x86_64-pc-windows-msvc.zip` — Windows x86_64

Each release also publishes a `SHA256SUMS.txt` — verify with:

```bash
sha256sum -c SHA256SUMS.txt --ignore-missing
```

Extract the archive — you get a single `overslash` binary with the dashboard embedded.

## 2. Start Postgres

Any Postgres 14+ instance works. A throwaway one in Docker:

```bash
docker run -d --name overslash-pg \
  -e POSTGRES_PASSWORD=overslash -e POSTGRES_DB=overslash \
  -p 5432:5432 postgres:17
```

## 3. Run `overslash web`

Set the three required env vars and run the binary. The API auto-applies migrations on first start.

```bash
export DATABASE_URL=postgres://postgres:overslash@localhost:5432/overslash
export SECRETS_ENCRYPTION_KEY=$(openssl rand -base64 32)
export SIGNING_KEY=$(openssl rand -base64 32)
./overslash web
```

Dashboard at <http://localhost:3000>. Stop with `Ctrl+C`; the binary leaves no state outside Postgres.

## 4. Connect an MCP client

Overslash exposes its MCP endpoint at `POST /mcp` on the same port as the dashboard, so any client that speaks the Streamable-HTTP transport connects directly. For Claude Code:

```bash
claude mcp add --transport http overslash https://<your-overslash>/mcp
```

For local dev, the URL is `http://localhost:3000/mcp`.

On first launch, the client opens a browser for the OAuth flow. You sign in, name or pick an **agent** for this client to act as, and the binding is done — every subsequent call authenticates as that agent rather than as your user.

See [Connect an MCP client](../connect/index.md) for other clients (Cursor, Windsurf, ChatGPT, Claude.ai, stdio fallback).

## Next steps

- [Concepts: Identities](./concepts/identities.md)
- [Self-hosting: Configuration](./self-hosting/configuration.md)
- [Reference: CLI](../reference/cli.md)

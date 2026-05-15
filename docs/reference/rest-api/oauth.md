---
title: OAuth
---

# OAuth

Overslash is itself an OAuth 2.1 authorization server. Clients use it to acquire bearer tokens scoped to an **agent identity**. The endpoints below implement RFC 8414 (auth-server metadata), RFC 7591 (dynamic client registration), RFC 7009 (revocation), and OAuth 2.1 (auth code + PKCE).

::: warning Pre-release
:::

## Discovery

### `GET /.well-known/oauth-authorization-server`

### `GET /.well-known/oauth-protected-resource`

## Dynamic registration

### `POST /oauth/register`

## Authorization

### `GET /oauth/authorize`

### Consent screen

`/oauth/consent` is the user-facing screen where the agent identity is picked or created.

## Token

### `POST /oauth/token`

## Revocation

### `POST /oauth/revoke`

## Related

- [Architecture → MCP OAuth transport](../architecture/mcp-oauth-transport.md)
- [Connect → Overview](../../connect/index.md)

<!-- TODO: see FOLLOW_UPS.md -->

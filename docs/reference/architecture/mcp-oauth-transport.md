---
title: MCP OAuth transport
---

# MCP OAuth transport

Overslash implements the MCP Streamable-HTTP transport with OAuth 2.1 on top of standard discovery and dynamic registration. This page is the public summary of the design; the authoritative document is `docs/design/mcp-oauth-transport.md` in the source repo.

::: warning Pre-release
:::

Overslash adopts the MCP **Authorization** profile (2025-06-18 spec revision) layered on **Streamable HTTP**. An MCP client drives the whole auth lifecycle itself: it hits the server, gets a `401` pointing at the authorization-server metadata, registers itself, opens a browser for consent, and uses the resulting access token on every subsequent request. Overslash **is** its own Authorization Server — the OAuth endpoints below wrap the existing sign-in flow so MCP clients can drive it without ever touching the dashboard.

## Transport: Streamable-HTTP at `POST /mcp`

MCP JSON-RPC requests are sent to `POST /mcp`. The handler requires an `Authorization: Bearer …` value — either an OAuth access token or a static `osk_` agent key. A missing or invalid token returns `401 Unauthorized` with a `WWW-Authenticate: Bearer resource_metadata="…"` header that points the client at the protected-resource metadata, which is what kicks off discovery.

`GET /mcp` is an optional Server-Sent Events channel for server-initiated notifications, used when a given MCP capability requires it. It carries the same authentication.

## Authorization-server metadata: `/.well-known/oauth-authorization-server`

`GET /.well-known/oauth-authorization-server` returns the [RFC 8414](https://www.rfc-editor.org/rfc/rfc8414) metadata document: the `issuer`, `authorization_endpoint`, `token_endpoint`, `registration_endpoint`, and `revocation_endpoint`, along with the supported scopes, response types, and PKCE methods. There is one Authorization Server per Overslash deployment.

## Protected-resource metadata: `/.well-known/oauth-protected-resource`

`GET /.well-known/oauth-protected-resource` returns the [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728) metadata that points clients at the authorization-server metadata above. This is the document referenced by the `WWW-Authenticate` header on a `401` from `/mcp`.

## Dynamic client registration: `POST /oauth/register`

`POST /oauth/register` implements [RFC 7591](https://www.rfc-editor.org/rfc/rfc7591) Dynamic Client Registration. A client posts the standard body (`redirect_uris`, `client_name`, `software_id`, …) and receives a `client_id`. Clients are **public** — no `client_secret` is issued; security rests on PKCE.

Registration is open by default: gating it would break the seamless "paste server URL → consent → done" flow MCP clients expect. The blast radius is bounded — a client still has to get a real user to consent in a real browser. Registered clients are visible to org admins in the dashboard and can be revoked individually.

## Authorization flow

The flow is OAuth 2.1 Authorization Code with PKCE:

1. **Discover** — `GET /.well-known/oauth-authorization-server` to learn the endpoints.
2. **Register** (first run only) — `POST /oauth/register` to obtain a `client_id`.
3. **Authorize** — `GET /oauth/authorize` with `response_type=code`, the `client_id`, `redirect_uri`, and a PKCE `code_challenge`. If the user has no active session, Overslash redirects through the sign-in flow first; on success it issues a short-lived, single-use authorization code bound to the client and PKCE challenge.
4. **Token** — `POST /oauth/token` with the code and PKCE verifier (grant `authorization_code`) returns an access token and a refresh token.

From there the client sends `Authorization: Bearer <access token>` on every `/mcp` request and refreshes as needed (grant `refresh_token`).

## Consent screen and agent identity binding

The first time a given `(user, client)` pair authorizes, Overslash shows a consent screen where the user either **creates a new agent** (default name taken from the client's registered `client_name`) or **picks an existing agent** they already own. The MCP session then acts as that agent identity.

The choice is remembered server-side and tied to the `(user, client)` pair, so subsequent authorizations by the same client skip the consent screen and mint tokens for the bound agent directly. If the bound agent is later archived or removed, the next login falls through to a fresh consent screen rather than failing.

This is why both authentication modes resolve to an **agent** identity:

| Mode | How the client authenticates | Identity | Fine-grained permissions / approvals |
|---|---|---|---|
| **OAuth (default)** | Browser flow → consent enrolls an agent under the user → access token | An agent owned by the signed-in user | Active; approvals surface through the user's dashboard, webhooks, or SSE |
| **Agent key** | Static `Authorization: Bearer osk_…`, no OAuth | The agent the key is bound to | Active; approvals surface via webhook / SSE / approval URL |

Keeping both modes on a single agent identity means the downstream permission and approval surface is uniform — there is no "user or agent?" branch to get wrong. See [Identities](../../guide/concepts/identities.md) and [Approvals](../../guide/concepts/approvals.md).

## Token issuance, refresh, revocation

- **Access token** — short-lived; presented as the `Bearer` value on every `/mcp` request. Distinct from the dashboard session token so one cannot be replayed as the other.
- **Refresh token** — single-use with rotation, per the OAuth 2.1 best-current-practice. Each refresh issues a new refresh token and invalidates the old one; reusing a rotated token revokes the whole chain, which mitigates replay attacks.
- **Revocation** — `POST /oauth/revoke` ([RFC 7009](https://www.rfc-editor.org/rfc/rfc7009)) revokes a refresh token (and, best-effort, an access token).

::: tip
For the request/response shapes of the OAuth endpoints, see the [REST API → OAuth reference](../rest-api/oauth.md). The internal token format and storage details are intentionally not documented here — see `docs/design/mcp-oauth-transport.md` in the source repo.
:::

## Why the stdio shim still exists

Some editors only speak MCP over stdio. For them, `overslash mcp` runs as a thin stdio↔HTTP shim: it holds a single credential and pipes each JSON-RPC frame to `POST /mcp`, refreshing the token on a `401` when a refresh token is available. It carries no business logic — both the direct-HTTP and shim paths terminate at the same handler.

`overslash mcp login` provisions the shim's credential by running the full OAuth Authorization Code + PKCE flow (discover → register → browser consent → token) and writing the result to the local config. See [Stdio fallback](../../connect/stdio-fallback.md) for the setup walkthrough.

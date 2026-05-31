---
title: Connections
---

# Connections

A **connection** is an OAuth credential that a user authorizes once and then reuses across agents. Overslash stores the refresh token, manages the access-token lifecycle, and exposes the connection by name — agents never see the tokens themselves, only the action they're calling.

For a step-by-step walkthrough using your own OAuth app, see [Link Google services](../how-to/link-google-services.md).

## Connection vs. secret

Connections and [secrets](./secrets.md) are both encrypted credentials, but they answer different needs:

| | Secret | Connection |
|---|---|---|
| What it holds | A raw blob — API key, bearer token | An OAuth grant — access token + refresh token |
| Who manages the lifecycle | You (set and rotate by hand) | Overslash (refreshes automatically) |
| How it's obtained | Pasted in | An OAuth authorize → callback handshake |
| Carries | Just the value | Provider, granted `scopes`, `account_email`, expiry |

In short: reach for a secret when an API just wants a static token, and a connection when the provider speaks OAuth and hands back something that expires. A connection's access token, refresh token, and expiry are all stored encrypted (with the same AES-256-GCM scheme described in [Secrets](./secrets.md)); the agent only ever names the action it wants, never the tokens behind it.

## OAuth providers

OAuth client credentials are scoped to a **provider**, not to an individual service. Google Calendar, Google Drive, and Gmail all declare `provider: google` in their templates, so they share one OAuth app — configure Google once and all three light up. Scopes still differ per service (Calendar asks for calendar scopes, Gmail for mail scopes), but the underlying client ID and secret are the same.

Where those client credentials come from is a three-tier cascade, resolved top-to-bottom with the first match winning:

1. **User-level (BYOC)** — a user supplies their own OAuth app credentials, stored as secrets in their vault under well-known names like `OAUTH_GOOGLE_CLIENT_ID`. Lets a power user or contractor use their own cloud project without touching org config.
2. **Org-level** — an org admin configures one OAuth app for the whole org. This is the recommended path for Google Workspace customers, since an Internal-tier OAuth app skips Google's brand-verification and CASA review.
3. **Overslash system** — defaults managed by the instance operator, for consumer accounts and low-stakes scopes.

If no credentials resolve at any tier, the connect flow stops with an explanation rather than a confusing provider-side error.

## Per-user vs. per-org connections

A connection is bound to the identity that authorized it and carries an `is_default` flag per provider, so a user can hold more than one Google account and mark which one a service reaches for by default. Because resolution follows the identity subtree, a connection a user authorizes is reusable by the agents and subagents acting on that user's behalf — authorize Gmail once, and every agent under you can send mail through it (subject to the [permission chain](./permissions.md)) without its own handshake.

Note the distinction from the cascade above: the *client credentials* (which OAuth app) resolve user → org → system, while a *connection* (the resulting token for a specific account) lives on the identity that authorized it.

## Token refresh

Access tokens expire; Overslash handles that for you. At execution time, if a connection's stored token is past its expiry, the OAuth engine exchanges the stored refresh token for a fresh access token, updates the row, and proceeds with the call — the agent never observes the refresh. Before the call goes out, Overslash also compares the connection's **granted scopes** against the scopes the action's template requires; if the connection is missing a scope, it fails with an explicit upgrade hint rather than letting the provider return an opaque 403.

## Revocation

A connection is revoked by deleting it: the stored access and refresh tokens are dropped, and any action that relied on it stops resolving until the user re-authorizes. Revoking one connection never touches the others — a user's Gmail connection and an agent's standing permissions are independent, so cutting off one account doesn't disturb the rest. Every create, default change, scope upgrade, and deletion lands in the [audit log](./audit.md).

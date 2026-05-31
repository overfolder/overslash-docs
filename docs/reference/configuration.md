---
title: Configuration
---

# Configuration

All configuration is via environment variables. The canonical list is `.env.example` in the source repo; the tables below track that same set with one-line descriptions and required/optional status. Conditionally-required variables are marked as such in the **Required** column.

::: warning Pre-release
Variable names may be renamed before the first tagged release.
:::

## Required

These have no safe default — the server will not start without them.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | yes | — | Postgres connection string. |
| `SECRETS_ENCRYPTION_KEY` | yes | — | Active master key for the secrets vault, as **64 hex characters** (32 bytes). Encrypts every secret, OAuth token, and IdP credential. |
| `SIGNING_KEY` | yes | — | 64-hex-character (32-byte) key used to sign OAuth and session tokens. |

## Server & network

| Variable | Required | Default | Description |
|---|---|---|---|
| `HOST` | no | `0.0.0.0` | Address to bind on. |
| `PORT` | no | `8080` | Port to bind on. `8080` is the compiled fallback for `serve` when `PORT` is unset; `.env.example` ships `PORT=3000` as a starting value. `web` does **not** use this default — it resolves its port as `--port` > `OVERSLASH_WEB_PORT` > `PORT` > `7171` (see the [CLI](./cli.md#overslash-web)). |

## Approvals

| Variable | Required | Default | Description |
|---|---|---|---|
| `APPROVAL_EXPIRY_SECS` | no | `1800` | Seconds a pending approval lives before it expires. |

## Logging

| Variable | Required | Default | Description |
|---|---|---|---|
| `RUST_LOG` | no | `info` | Log-level filter (standard `tracing`/`env_logger` syntax, e.g. `info`, `debug`, `overslash=trace`). |

## Local development

| Variable | Required | Default | Description |
|---|---|---|---|
| `DEV_AUTH` | no | _unset_ | Enables `/auth/dev/token`, which returns a session cookie for `dev@overslash.local`. Needed for the screenshot script and non-OAuth local testing. **Leave unset in production.** |

## OAuth providers

Optional. Enable Overslash-managed sign-in: when set, corp orgs that opt in accept authentication through these shared OAuth apps (admission is still gated by each org's invite allowlist). Leave unset to require every org to register its own OAuth app. Provide both halves of a pair.

| Variable | Required | Default | Description |
|---|---|---|---|
| `GOOGLE_AUTH_CLIENT_ID` | no | _unset_ | Google OAuth client ID for managed sign-in. |
| `GOOGLE_AUTH_CLIENT_SECRET` | no | _unset_ | Google OAuth client secret. |
| `GITHUB_AUTH_CLIENT_ID` | no | _unset_ | GitHub OAuth client ID for managed sign-in. |
| `GITHUB_AUTH_CLIENT_SECRET` | no | _unset_ | GitHub OAuth client secret. |

## Billing

Optional — only needed when `CLOUD_BILLING=true`. The lookup keys resolve to a literal `price_…` ID at startup; set the same value on the matching Price in the Stripe Dashboard.

| Variable | Required | Default | Description |
|---|---|---|---|
| `CLOUD_BILLING` | no | `false` | When `true`, gates Team-org creation behind a Stripe subscription. |
| `STRIPE_SECRET_KEY` | if `CLOUD_BILLING=true` | — | Stripe API secret key (`sk_…`). |
| `STRIPE_WEBHOOK_SECRET` | if `CLOUD_BILLING=true` | — | Stripe webhook signing secret (`whsec_…`). |
| `STRIPE_EUR_LOOKUP_KEY` | no | `overslash_seat_eur` | Stripe lookup key for the EUR seat price. |
| `STRIPE_USD_LOOKUP_KEY` | no | `overslash_seat_usd` | Stripe lookup key for the USD seat price. |

## Email

Optional. With `EMAIL_PROVIDER` unset the API uses a no-op mailer and boots cleanly. Setting `EMAIL_PROVIDER` **without** a real `EMAIL_API_KEY` and `EMAIL_FROM` fails startup validation.

| Variable | Required | Default | Description |
|---|---|---|---|
| `EMAIL_PROVIDER` | no | _unset_ | Transactional email provider, e.g. `resend`. Unset → no-op mailer. |
| `EMAIL_FROM` | if `EMAIL_PROVIDER` set | — | `From` address for outbound mail (e.g. `no-reply@overslash.com`). |
| `EMAIL_REPLY_TO` | no | _unset_ | `Reply-To` address. |
| `EMAIL_API_KEY` | if `EMAIL_PROVIDER` set | — | Provider API key (e.g. Resend `re_…`). |

## See also

- [Self-hosting → Configuration](../guide/self-hosting/configuration.md)
- [Self-hosting → Keys & Rotation](../guide/self-hosting/keys-and-rotation.md)

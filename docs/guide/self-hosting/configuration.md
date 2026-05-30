---
title: Configuration
---

# Configuration

Overslash is configured exclusively through environment variables. Three are required to boot — `DATABASE_URL`, `SECRETS_ENCRYPTION_KEY`, and `SIGNING_KEY`; everything else (OAuth providers, billing, email, log level) is optional and degrades gracefully when omitted. The canonical list lives in `.env.example` in the source repo and in [Reference → Configuration](../../reference/configuration.md).

Configuration is read once at startup by `Config::from_env()`. Missing required variables — and missing dependencies of an enabled feature — cause the process to exit immediately with an error (`validate_env`), so a misconfigured deploy fails fast rather than booting half-broken.

## Required variables

These three must be set or the server will not start.

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:pass@host:5432/overslash`. See [Database](./database.md). |
| `SECRETS_ENCRYPTION_KEY` | 64-character hex (32 bytes). Master key that AES-256-GCM-encrypts every secret in the vault. Generate with `openssl rand -hex 32`. See [Keys & Rotation](./keys-and-rotation.md). |
| `SIGNING_KEY` | 64-character hex (32 bytes). Signs OAuth and session tokens. Generate with `openssl rand -hex 32`. |

## Conditionally required

These become required only when you enable the feature they belong to. Enabling the feature without them trips `validate_env` and the server exits at startup.

| Variable | Required when | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `CLOUD_BILLING=true` | Stripe API secret key. |
| `STRIPE_WEBHOOK_SECRET` | `CLOUD_BILLING=true` | Verifies inbound Stripe webhooks. |
| `EMAIL_API_KEY` | `EMAIL_PROVIDER` is set | Provider API key (e.g. Resend). |
| `EMAIL_FROM` | `EMAIL_PROVIDER` is set | Sender address. |

## Optional variables

All optional variables have safe defaults. They are grouped by concern below.

### Networking & URLs

| Variable | Default | Notes |
|---|---|---|
| `HOST` | `0.0.0.0` | Bind address. |
| `PORT` | `8080` (`serve`) / fallback for `web` | Listen port. `overslash web` resolves `--port` → `OVERSLASH_WEB_PORT` → `PORT` → `7171`. |
| `PUBLIC_URL` | derived from `HOST`/`PORT` | External base URL; set this behind a proxy so OAuth redirects resolve. |
| `DASHBOARD_ORIGIN` | `*localhost*` | Allowed dashboard origin(s) for CORS. Set explicitly in production. |
| `DASHBOARD_URL` | `/` | Where the API redirects to reach the dashboard. |
| `APP_HOST_SUFFIX` | — | Apex for the dashboard subdomain, e.g. `app.overslash.com`. |
| `API_HOST_SUFFIX` | — | Apex for the programmatic surface, e.g. `api.overslash.com`. |
| `SESSION_COOKIE_DOMAIN` | — | e.g. `.overslash.com` to share sessions across subdomains. |
| `MCP_EXTRA_ORIGINS` | — | Comma-separated extra origins allowed on `/mcp` + OAuth endpoints. |

### Authentication & org control

| Variable | Default | Notes |
|---|---|---|
| `GOOGLE_AUTH_CLIENT_ID` / `GOOGLE_AUTH_CLIENT_SECRET` | — | Shared Google OAuth app for Overslash-managed sign-in. Leave unset to require each org to register its own. |
| `GITHUB_AUTH_CLIENT_ID` / `GITHUB_AUTH_CLIENT_SECRET` | — | Same, for GitHub. |
| `DEV_AUTH` | unset | When set, enables `/auth/dev/token` (a dev login). **Leave unset in production.** |
| `ALLOW_ORG_CREATION` | `true` | Set `false` to lock down org creation after initial setup. |
| `SINGLE_ORG_MODE` | — | When set to an org slug, scopes all requests to that org. |

### Limits & timeouts

| Variable | Default | Notes |
|---|---|---|
| `APPROVAL_EXPIRY_SECS` | `1800` | How long a pending approval stays open. |
| `EXECUTION_PENDING_TTL_SECS` | `900` | TTL for a pending execution awaiting approval. |
| `EXECUTION_REPLAY_TIMEOUT_SECS` | `30` | Replay window for a resumed execution. |
| `DEFAULT_RATE_LIMIT` | `1000` | Requests per window (default scope). |
| `DEFAULT_RATE_WINDOW_SECS` | `60` | Rate-limit window length. |
| `MAX_RESPONSE_BODY_BYTES` | `5242880` | Max upstream response body (5 MB). |
| `FILTER_TIMEOUT_MS` | `2000` | Response-filter evaluation timeout. |

### Billing (Stripe)

| Variable | Default | Notes |
|---|---|---|
| `CLOUD_BILLING` | `false` | Set `true` to enable Stripe billing (then the Stripe secrets above are required). |
| `STRIPE_EUR_LOOKUP_KEY` | `overslash_seat_eur` | Stripe Price lookup key (EUR). |
| `STRIPE_USD_LOOKUP_KEY` | `overslash_seat_usd` | Stripe Price lookup key (USD). |

### Transactional email

| Variable | Default | Notes |
|---|---|---|
| `EMAIL_PROVIDER` | — | Currently `resend`. Unset = no-op mailer (boots cleanly). |
| `EMAIL_FROM` | — | Sender address (required when `EMAIL_PROVIDER` set). |
| `EMAIL_REPLY_TO` | — | Reply-to; falls back to the provider default. |

### Infrastructure & keys

| Variable | Default | Notes |
|---|---|---|
| `REDIS_URL` | — | Valkey/Redis for caching and pub-sub. Recommended with multiple replicas. |
| `SECRETS_ENCRYPTION_KEY_PREVIOUS` | — | Previous master key, decrypt-only, set during a key rotation. See [Keys & Rotation](./keys-and-rotation.md). |
| `SECRETS_ENCRYPTION_KEY_ACTIVE_ID` | `1` | Version byte stamped on new ciphertext. **Bump on every rotation.** |
| `SECRETS_ENCRYPTION_KEY_PREVIOUS_ID` | `active_id − 1` | Version byte of the previous key. |
| `OVERSLA_SH_BASE_URL` / `OVERSLA_SH_API_KEY` | — | Base URL and key for the short-link service. |

### Logging

| Variable | Default | Notes |
|---|---|---|
| `RUST_LOG` | `info` | Log level / filter, e.g. `info` or `info,overslash_metrics=debug`. See [Monitoring](./monitoring.md). |
| `OVERSLASH_ENV` | — | Deployment marker (e.g. `dev`, `prod`) surfaced in logs/tooling. |

## Deprecated & internal-only

There are no formally deprecated variables today.

A handful of variables exist only for testing or as escape hatches and **must not be set in production**: `OVERSLASH_DANGER_READ_AUTH_SECRET_FROM_ENVVARS`, `OVERSLASH_SSRF_ALLOW_PRIVATE`, `OVERSLASH_SERVICE_BASE_OVERRIDES`, and `PREVIEW_ORIGIN_ALLOWLIST`. They relax safety checks (SSRF protection, OAuth origin allowlisting) and are intended for local development and CI only.

## Profiles for multiple environments

Overslash reads `.env` automatically if present, so the simplest pattern is one `.env` file per environment, built from the template:

```bash
cp .env.example .env
# edit DATABASE_URL, SECRETS_ENCRYPTION_KEY, SIGNING_KEY, …
```

For deployed environments, inject variables through your platform's secret store (Secret Manager, Kubernetes `Secret`, Compose `.env`) rather than committing them. Set `OVERSLASH_ENV` (e.g. `dev`, `prod`) to mark the deployment in logs and tooling.

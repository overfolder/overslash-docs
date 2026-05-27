# Documentation follow-ups

Per-page punch list for the docs scaffold. This file is excluded from the published site (`srcExclude` in `.vitepress/config.ts`) — it lives in `docs/` because the source-of-truth pointers reference paths inside the overslash repo and that's where the docs writers will be working.

Sources of truth in `~/code/overfolder/overslash/`:

- `README.md` — install, dev, MCP connection examples
- `SPEC.md` — product surface (identity, approvals, services, …)
- `STATUS.md` — what actually ships today vs. SPEC
- `DECISIONS.md` — settled architectural decisions
- `.env.example` — configuration reference
- `docs/design/mcp-oauth-transport.md` — MCP OAuth specifics
- `docs/design/INDEX.md` — index of every internal design doc
- `crates/overslash-api/src/routes/*.rs` — REST endpoint implementations
- `crates/overslash-mcp/src/*.rs` — MCP tool implementations
- `services/*.yaml` — service registry YAML examples
- `UI_SPEC.md` — dashboard surface

---

## Home & top-level

- [ ] `index.md` — confirm the three feature blurbs match how we want to position Overslash externally. Pull a real screenshot or short video for the hero once the dashboard UI stabilises (`UI_SPEC.md`).

## guide/

- [ ] `guide/what-is-overslash.md` — fill the four headings (who it's for / what it replaces / how it fits with MCP / where to go next) from `SPEC.md` §1–§2 + `README.md` L3–L17.
- [ ] `guide/getting-started.md` — fill the four numbered steps from `README.md` L47–L98 (`overslash web` quickstart). Include verified-working `claude mcp add` invocation.
- [ ] `guide/status-and-roadmap.md` — generate "What ships today" from `STATUS.md`. Confirm "What's planned" and "What's out of scope" with maintainers — `SPEC.md` is aspirational, not a roadmap promise.

## guide/concepts/

- [x] `concepts/index.md` — add a simple ASCII or Mermaid diagram showing User → Agent → SubAgent → Action.
- [x] `concepts/identities.md` — distinguish static `osk_` keys vs. OAuth bearer tokens. Source: `SPEC.md` identity section + `crates/overslash-api/src/auth.rs`.
- [ ] `concepts/services-and-actions.md` — clarify the relationship between a service definition (YAML) and a runtime action. Cross-link `reference/service-registry.md`.
- [ ] `concepts/secrets.md` — describe AES-256-GCM, versioning semantics, and "API never returns secret material" invariant. Source: `crates/overslash-core/src/secrets/*`.
- [ ] `concepts/connections.md` — explain the difference between a secret (raw blob) and a connection (OAuth credential with refresh).
- [ ] `concepts/approvals.md` — full lifecycle diagram (raised → notified → resolved → action resumes). Source: `SPEC.md` approvals section + `crates/overslash-core/src/approvals/*`.
- [ ] `concepts/permissions.md` — diagram the inheritance chain and how an approval widens it. Define roles (viewer/operator/admin) precisely.
- [ ] `concepts/audit.md` — list which events are logged and which are not.

## guide/self-hosting/

- [ ] `self-hosting/deployment.md` — write three concrete walk-throughs (single-binary, Docker Compose, Kubernetes). Reference `infra/` for OpenTofu and `docker/docker-compose.dev.yml` for compose patterns.
- [ ] `self-hosting/configuration.md` — generate a complete env-var table from `.env.example`. Mark which are required vs. optional vs. deprecated.
- [ ] `self-hosting/keys-and-rotation.md` — verify the `overslash admin reencrypt` flow end-to-end; document failure modes. Source: `crates/overslash-cli/src/admin/*`.
- [ ] `self-hosting/database.md` — Postgres version matrix, connection-pool sizing, backup recipe. Cover migrations: when to use `make migrate` vs. auto-migrate-on-boot.
- [ ] `self-hosting/monitoring.md` — list metric names emitted by `overslash-metrics`. Source: `crates/overslash-metrics/src/*`.

## connect/

- [ ] `connect/index.md` — diagram the OAuth handshake (sequence diagram between client, browser, and `/oauth/*`). Source: `docs/design/mcp-oauth-transport.md`.
- [ ] `connect/claude-code.md` — verify the exact `claude mcp add --transport http overslash https://…` syntax against the current Claude Code release. Source: `README.md` L193–L201.
- [ ] `connect/claude-ai.md` — document the custom-connector setup flow (where to paste the MCP URL, what the consent screen shows, what scopes are requested). Verify with a real connect attempt.
- [ ] `connect/chatgpt.md` — document the connectors UI path for adding an HTTP MCP server. Verify with a real connect attempt.
- [ ] `connect/cursor.md` — locate Cursor's current MCP config file path; confirm `"type": "http"` is the right discriminator.
- [ ] `connect/windsurf.md` — same: confirm config file location and field names for Windsurf's current release.
- [ ] `connect/openclaw.md` — confirm OpenClaw's MCP HTTP client config format. External source: `https://docs.openclaw.ai/cli/mcp`.
- [ ] `connect/other-mcp-clients.md` — maintain a short matrix of "client → where its MCP config lives". Keep this fresh — the ecosystem moves.
- [ ] `connect/stdio-fallback.md` — verify `overslash mcp login` end-to-end on macOS and Linux. Document the config file paths (`~/.config/overslash/mcp.json`, profile variant). Source: `README.md` L226–L231 + `crates/overslash-cli/src/mcp/login.rs`.

## reference/

- [ ] `reference/index.md` — once the surface stabilises, link to an OpenAPI spec (currently TBD).
- [ ] `reference/cli.md` — for each subcommand, list all flags with one-line descriptions. Source: `crates/overslash-cli/src/main.rs` (clap definitions).
- [ ] `reference/service-registry.md` — write a complete JSON-Schema-style definition for the YAML format. Pair it with three worked examples from `services/`. Source: `services/github.yaml`, `services/gmail.yaml`, `services/slack.yaml` + `crates/overslash-core/src/services/loader.rs`.
- [ ] `reference/configuration.md` — generate the full env-var matrix (variable, required/optional, default, since version). Source: `.env.example`.

### reference/rest-api/

- [ ] `rest-api/index.md` — define the error envelope shape and the canonical error codes. Document the pagination shape (cursor vs. page+size). Source: `crates/overslash-api/src/error.rs`.
- [ ] `rest-api/actions.md` — full request/response shapes for `POST /v1/actions/call` and `POST /v1/actions/http`, including the "approval raised" response shape. Source: `crates/overslash-api/src/routes/actions.rs`.
- [ ] `rest-api/approvals.md` — fully document the resolve decision enum (`allow_once` / `allow_always` / `deny`) and any TTL semantics. Source: `crates/overslash-api/src/routes/approvals.rs`.
- [ ] `rest-api/secrets.md` — confirm the version-history endpoint shape and that decrypted material is never returned. Source: `crates/overslash-api/src/routes/secrets.rs`.
- [ ] `rest-api/connections.md` — document the OAuth initiation flow (what URL to redirect the user to after `POST /v1/connections`). Source: `crates/overslash-api/src/routes/connections.rs`.
- [ ] `rest-api/services.md` — describe the difference between `/v1/services` (registry view) and `/v1/templates` (action templates). Source: `crates/overslash-api/src/routes/services.rs`.
- [ ] `rest-api/identities.md` — distinguish the `/me` shortcut from the full list endpoint; document role-based access. Source: `crates/overslash-api/src/routes/identities.rs`.
- [ ] `rest-api/search.md` — define the query DSL (free text, category filters, capability filters). Source: `crates/overslash-api/src/routes/search.rs`.
- [ ] `rest-api/audit.md` — list every event type written to the audit log. Source: `crates/overslash-core/src/audit/*`.
- [ ] `rest-api/webhooks.md` — full signing scheme (HMAC algorithm, header names, replay protection), retry policy, and event payload shapes. Source: `crates/overslash-api/src/routes/webhooks.rs`.
- [ ] `rest-api/oauth.md` — confirm the `.well-known` payloads we actually emit; add a worked end-to-end example (discovery → register → authorize → token). Source: `docs/design/mcp-oauth-transport.md` + `crates/overslash-api/src/routes/oauth.rs`.

### reference/mcp-tools/

- [ ] `mcp-tools/index.md` — write a "when to use which" decision table.
- [ ] `mcp-tools/overslash_search.md` — define query shape, result shape, ranking notes. Source: `crates/overslash-mcp/src/tools/search.rs`.
- [ ] `mcp-tools/overslash_call.md` — three example shapes: service+action call, raw HTTP call, approval resume. Document the success/approval-raised/error result variants. Source: `crates/overslash-mcp/src/tools/call.rs`.
- [ ] `mcp-tools/overslash_read.md` — list the server-side check that rejects writes. Source: `crates/overslash-mcp/src/tools/read.rs`.
- [ ] `mcp-tools/overslash_auth.md` — full `whoami` and `service_status` payloads. Source: `crates/overslash-mcp/src/tools/auth.rs`.
- [ ] `mcp-tools/overslash_approve.md` — clarify which identities are allowed to call this tool (user-bound clients only, not other agents). Source: `crates/overslash-mcp/src/tools/approve.rs`.

### reference/architecture/

- [x] `architecture/overview.md` — one Mermaid diagram of components + a sequence diagram for a sample action call. Source: `SPEC.md` + `CLAUDE.md` navigation.
- [x] `architecture/mcp-oauth-transport.md` — port the public-facing parts of `docs/design/mcp-oauth-transport.md`. Decide which internal details stay in the source repo.
- ~~`architecture/database-schema.md`~~ — removed (not published). The database schema and internal storage details are intentionally kept out of the public docs.

---

## Cross-cutting

- [ ] Decide canonical public hostname (`overslash.com` vs. `overslash.dev`) and add it back to the nav as an external link.
- [ ] Add a `_includes/` or VitePress component for the "Pre-release" warning so it's edited in one place.
- [ ] Add screenshots for the dashboard once `UI_SPEC.md` stabilises — at least one per major flow (agents, approvals, secrets, connections, audit).
- [ ] Define a versioning policy for the docs (do we publish per-release? `latest` only?). Set up Vercel preview deploys for PRs.
- [ ] Add a `CONTRIBUTING.md` for the docs site (style guide, when to add a new section, how to cross-link).
- [ ] Once the SDK lands, add an `/sdk/` section.
- [ ] Add a 404 page with a search box.

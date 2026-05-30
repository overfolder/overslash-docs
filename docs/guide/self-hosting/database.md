---
title: Database
---

# Database

Overslash uses PostgreSQL for all persistent state — users, agents, secrets, connections, approvals, audit. The API auto-applies migrations on startup, so a fresh database needs no setup beyond a connection string. For day-to-day operations you mostly just back it up; for schema work you use `sqlx-cli`.

## Requirements

| | Version | Notes |
|---|---|---|
| Minimum | PostgreSQL 14 | Oldest supported. |
| Recommended | PostgreSQL 16 | CI and the official container images run pg16. |
| Cloud reference | PostgreSQL 16 (Cloud SQL) | What the `infra/` OpenTofu deploy provisions. |

The **pgvector extension is required** — Overslash uses it for vector search over services. The official images (`pgvector/pgvector:pg16`) bundle it; on a self-managed Postgres, install `pgvector` and ensure the role can `CREATE EXTENSION`. Migrations enable the extension on first boot.

Only `DATABASE_URL` is needed to connect:

```
DATABASE_URL=postgres://user:pass@host:5432/overslash
```

## First-time bootstrap

A fresh, empty database is all Overslash needs. On first start the API connects, runs all migrations (including enabling `pgvector`), and is ready — there is no separate install or seed step.

A throwaway local database in Docker:

```bash
docker run -d --name overslash-pg \
  -e POSTGRES_PASSWORD=overslash -e POSTGRES_DB=overslash \
  -p 5432:5432 pgvector/pgvector:pg16
```

## Migrations

Overslash embeds its migrations in the binary (via sqlx) and tracks applied ones in the `_sqlx_migrations` table, so migration runs are idempotent. There are two ways to apply them:

- **Auto-migrate on boot (default).** The API runs `MIGRATOR.run()` on every startup. Nothing to do — this is the right choice for single-instance self-hosting.
- **`make migrate` (explicit).** Runs `cargo sqlx migrate run` against `DATABASE_URL` without starting the server.

**When to use which.** Auto-migrate is fine when one process owns the database. Prefer an explicit `make migrate` step in CI/CD when you roll out **multiple replicas** at once: migrate once as a deploy step, then start the new replicas against the already-migrated schema. This avoids several instances racing to apply the same migration on boot.

Related Makefile targets in the source repo:

| Target | Does |
|---|---|
| `make migrate` | Apply pending migrations (`cargo sqlx migrate run`). |
| `make new-migration` | Scaffold a new reversible migration pair (`<n>_<name>.up.sql` / `.down.sql`). |
| `make schema` | Dump the current schema to `SCHEMA.sql` (schema only — not a backup). |

## Backup & restore

Overslash ships no backup tooling of its own — use standard Postgres tooling, and back up the database **together with** the active `SECRETS_ENCRYPTION_KEY` (a backup is useless without the key that decrypts its secrets — see [Keys & Rotation](./keys-and-rotation.md)).

Logical backup and restore with `pg_dump` / `pg_restore`:

```bash
# Backup (custom format, compressed)
pg_dump --format=custom --no-owner --no-acl \
  "$DATABASE_URL" > overslash-$(date +%F).dump

# Restore into a fresh database
pg_restore --no-owner --no-acl --dbname "$DATABASE_URL" overslash-2025-01-01.dump
```

On the GCP reference deploy, Cloud SQL automated backups handle this — keep them enabled and set a retention window that matches your recovery needs. Note that `make schema` exports schema only and is for version control, not disaster recovery.

## Connection pooling

The API opens a single connection pool at startup using sqlx defaults (roughly **10 max connections** per process). Pool size is **not currently tunable via environment variable** — plan capacity around the default.

For sizing: total connections into Postgres is approximately **`API replicas × pool size`**. Set Postgres `max_connections` comfortably above that, leaving headroom for migrations, backups, and ad-hoc admin sessions. A single self-hosted instance against a default Postgres needs no tuning; only multi-replica deploys need to raise `max_connections` (or front Postgres with a pooler such as PgBouncer).

The standalone metrics-exporter job (used in the GCP deploy) opens its own small pool (`max_connections(4)`, 10-second acquire timeout) — count it separately when sizing `max_connections`.

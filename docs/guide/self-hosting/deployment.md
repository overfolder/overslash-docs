---
title: Deployment
---

# Deployment

Overslash ships as a single static binary with the dashboard embedded. There are three supported shapes: a one-process `overslash web` (binary + Postgres, dashboard on the same port), a split `overslash serve` + standalone dashboard (cloud mode), and a container image suitable for Docker Compose or any container orchestrator. The `infra/` directory of the source repo includes reference OpenTofu/Terraform for a full Google Cloud deployment.

::: warning Pre-release
Deployment shapes may change before the first tagged release.
:::

This page walks through four ways to run Overslash:

1. **[Single binary](#single-binary)** — the simplest way to run it on one host.
2. **[Docker Compose](#docker-compose)** — Postgres, Valkey, and the API as containers.
3. **[Kubernetes](#kubernetes)** — reference manifests for the container image.
4. **[Google Cloud (OpenTofu)](#google-cloud-opentofu)** — a managed, autoscaling production deploy.

All of them need the same three required environment variables — `DATABASE_URL`, `SECRETS_ENCRYPTION_KEY`, and `SIGNING_KEY`. See [Configuration](./configuration.md) for the full list and [Keys & Rotation](./keys-and-rotation.md) for how to generate the keys (they are 64-character hex strings).

## Single binary

The single binary is the fastest path and the recommended shape for a small self-hosted instance. The `overslash` binary embeds the dashboard, applies migrations on first boot, and serves both the REST API and the MCP endpoint on one port.

**1. Get the binary.** Download the latest release for your platform from [github.com/overfolder/overslash/releases](https://github.com/overfolder/overslash/releases) and extract it — you get a single `overslash` executable.

**2. Start Postgres.** Any Postgres 14+ instance works (16 recommended). A throwaway one in Docker:

```bash
docker run -d --name overslash-pg \
  -e POSTGRES_PASSWORD=overslash -e POSTGRES_DB=overslash \
  -p 5432:5432 pgvector/pgvector:pg16
```

The `pgvector` image bundles the vector extension Overslash uses for search — see [Database](./database.md).

**3. Set the required variables and run.**

```bash
export DATABASE_URL=postgres://postgres:overslash@localhost:5432/overslash
export SECRETS_ENCRYPTION_KEY=$(openssl rand -hex 32)
export SIGNING_KEY=$(openssl rand -hex 32)
export PORT=3000
./overslash web
```

The dashboard, REST API, and MCP endpoint are now on `http://localhost:3000`. (`overslash web` resolves its port as `--port` → `OVERSLASH_WEB_PORT` → `PORT` → `7171`, so setting `PORT=3000` — as in `.env.example` — puts everything on `:3000`.) Stop with `Ctrl+C` — the binary leaves no state outside Postgres.

### Split mode (`serve`)

In cloud-style deployments the dashboard is hosted separately (e.g. on a CDN) and the API runs headless. Use `overslash serve` instead of `overslash web`:

```bash
./overslash serve            # REST API + MCP, no embedded dashboard (defaults to :8080)
```

Point the separately-hosted dashboard at the API with `DASHBOARD_ORIGIN` and `PUBLIC_URL` (see [Configuration](./configuration.md)).

## Docker Compose

Compose is a good fit when you want Postgres, Valkey (for caching/pub-sub), and the API managed together on one host. The source repo's `docker/docker-compose.prod.yml` is the reference; the API is built from `crates/overslash-api/Dockerfile` and runs `overslash serve` on port 8080.

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: overslash
      POSTGRES_PASSWORD: ${DB_PASSWORD:-overslash_prod}
      POSTGRES_DB: overslash
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U overslash"]
      interval: 5s
      timeout: 3s
      retries: 5

  valkey:
    image: valkey/valkey:8-alpine
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ..
      dockerfile: crates/overslash-api/Dockerfile
    environment:
      DATABASE_URL: postgres://overslash:${DB_PASSWORD:-overslash_prod}@postgres:5432/overslash
      SECRETS_ENCRYPTION_KEY: ${SECRETS_ENCRYPTION_KEY}
      SIGNING_KEY: ${SIGNING_KEY}
      REDIS_URL: redis://valkey:6379
      HOST: 0.0.0.0
      PORT: "8080"
      RUST_LOG: ${RUST_LOG:-info}
      PUBLIC_URL: ${PUBLIC_URL:-http://localhost:8080}
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  pgdata:
```

Provide the secrets through a `.env` file next to the compose file (Compose loads it automatically):

```bash
SECRETS_ENCRYPTION_KEY=<openssl rand -hex 32>
SIGNING_KEY=<openssl rand -hex 32>
DB_PASSWORD=<a strong password>
PUBLIC_URL=https://overslash.example.com
```

Then bring the stack up:

```bash
docker compose -f docker-compose.prod.yml up -d
```

The API listens on `:8080`. The image's `entrypoint.sh` assembles `DATABASE_URL` from `DB_USER`/`DB_PASSWORD`/`DB_NAME` parts if you set those instead of a full URL — handy when injecting a password from a secret store.

::: tip
Put a TLS-terminating reverse proxy (Caddy, nginx, a cloud load balancer) in front of the API and set `PUBLIC_URL` to the external HTTPS URL so OAuth redirects resolve correctly.
:::

## Kubernetes

Overslash does **not** ship Kubernetes manifests or a Helm chart yet. The production container image (`crates/overslash-api/Dockerfile`) is a standard, stateless HTTP service, so it runs on any orchestrator unchanged.

The manifests below are a **reference example** — copy them, point `DATABASE_URL` at managed or in-cluster Postgres, fill in the secret values, and adapt to your cluster's conventions (namespaces, ingress, resource requests).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: overslash
type: Opaque
stringData:
  # 64-char hex — see the Keys & Rotation guide.
  SECRETS_ENCRYPTION_KEY: "<openssl rand -hex 32>"
  SIGNING_KEY: "<openssl rand -hex 32>"
  DATABASE_URL: "postgres://overslash:<password>@postgres:5432/overslash"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: overslash
spec:
  replicas: 2
  selector:
    matchLabels: { app: overslash }
  template:
    metadata:
      labels: { app: overslash }
    spec:
      containers:
        - name: overslash
          image: ghcr.io/overfolder/overslash:latest   # or your registry
          ports:
            - containerPort: 8080
          envFrom:
            - secretRef: { name: overslash }
          env:
            - name: HOST
              value: "0.0.0.0"
            - name: PORT
              value: "8080"
            - name: PUBLIC_URL
              value: "https://overslash.example.com"
          readinessProbe:
            httpGet: { path: /ready, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /health, port: 8080 }
            initialDelaySeconds: 10
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: overslash
spec:
  selector: { app: overslash }
  ports:
    - port: 80
      targetPort: 8080
```

Add an `Ingress` (or `Gateway`) to terminate TLS and route your hostname to the `Service`, and run Postgres as a managed database or via an in-cluster operator. Because the API is stateless it scales horizontally — read the [High availability notes](#high-availability-notes) before bumping `replicas`.

## Google Cloud (OpenTofu)

The `infra/` directory contains a production-grade, cost-optimised Google Cloud deployment managed with [OpenTofu](https://opentofu.org/) (Terraform-compatible). The architecture:

```
Internet → Cloud Run (overslash-{env}-api)
              ├── Cloud SQL Auth Proxy → Cloud SQL (Postgres 16)
              ├── Secret Manager (keys, DB password, OAuth secrets)
              └── Memorystore Valkey (optional)

Cloud Build (GitHub trigger) → Artifact Registry → Cloud Run
```

| Component | Service | Notes |
|---|---|---|
| Compute | Cloud Run | Scales to zero, pay-per-request |
| Database | Cloud SQL (Postgres 16) | Automated backups; Auth Proxy by default |
| Secrets | Secret Manager | DB password, encryption keys, OAuth secrets |
| Registry | Artifact Registry | Docker images with cleanup policy |
| CI/CD | Cloud Build | Build → push → deploy on push to GitHub |
| DNS / LB (optional) | Cloud DNS + Cloud Load Balancing | Managed zone + global HTTPS LB |

Estimated cost is roughly **$8–15/month** for low-traffic production (Cloud Run scales to zero; the optional global load balancer adds ~$18/mo).

**Prerequisites:** OpenTofu ≥ 1.6, the Google Cloud SDK (`gcloud`), a GCP project with billing enabled, and a GitHub repo connected to Cloud Build.

**Quick start:**

```bash
cd infra

# 1. Authenticate
gcloud auth login
gcloud auth application-default login

# 2. Plan and apply (per-environment tfvars live in infra/env/)
make tofu-plan  ENV=dev
make tofu-apply ENV=dev

# 3. Push the first image
IMAGE_URL=$(tofu output -raw artifact_registry_url)/overslash-api:latest
gcloud auth configure-docker europe-west1-docker.pkg.dev
docker build -t "$IMAGE_URL" .. && docker push "$IMAGE_URL"
```

After the first apply, the Cloud Build trigger rebuilds, pushes, and deploys on every push.

::: tip Two OAuth clients
The Google deploy uses **two** Google OAuth clients — one for user sign-in (`openid email profile`, no verification) and one for connecting Google services on behalf of users (sensitive scopes, requires Google verification). Register them separately and load both into Secret Manager. See `infra/README.md` for the exact secret names and redirect URIs.
:::

The full module reference (networking, IAM, Cloud SQL connectivity modes, optional scheduler that stops/starts the database on a cron) lives in `infra/README.md` in the source repo.

## High availability notes

The Overslash API is **stateless** — all durable state lives in Postgres. High availability therefore comes down to two things:

- **Run managed, highly-available Postgres** (Cloud SQL HA, RDS Multi-AZ, or a replicated cluster). Postgres is the single source of truth; back it up and replicate it. See [Database](./database.md).
- **Run multiple API replicas behind a load balancer.** Cloud Run autoscaling does this for you; on Kubernetes or Compose, scale the API horizontally.

Two caveats when running multiple replicas:

- The connection pool is **per replica** (sqlx defaults, ~10 connections each). Size your Postgres `max_connections` for `replicas × pool size` — see [Database → Connection pooling](./database.md#connection-pooling).
- Rate-limit counters and the pending-approval cache are kept per process. With many replicas, configure `REDIS_URL` so shared state (caching/pub-sub) is centralised.

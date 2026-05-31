---
title: Monitoring
---

# Monitoring

Overslash exposes a Prometheus metrics endpoint, structured JSON logs, and a public status page that operators can mirror or reuse. The metrics surface counts actions, approvals, secret reads, OAuth refreshes, and HTTP error rates by service — enough to alert on stuck approvals, failing connections, and unusual write volume.

## Prometheus metrics

Metrics are exposed at `GET /internal/metrics` in Prometheus text format, on the API's normal port. The endpoint is mounted outside auth and rate limiting so a scraper can reach it without credentials — keep it on an internal network or restrict it at your proxy.

A minimal scrape config:

```yaml
scrape_configs:
  - job_name: 'overslash'
    metrics_path: /internal/metrics
    static_configs:
      - targets: ['overslash:8080']
```

Every metric is prefixed `overslash_`. They are grouped below by area.

### HTTP

| Metric | Type | Labels |
|---|---|---|
| `overslash_http_requests_total` | counter | `method`, `path`, `status` |
| `overslash_http_request_duration_seconds` | histogram | `method`, `path` |
| `overslash_http_requests_in_flight` | gauge | — |

### Action execution

| Metric | Type | Labels |
|---|---|---|
| `overslash_action_executions_total` | counter | `template_key`, `mode`, `status` |
| `overslash_action_execution_duration_seconds` | histogram | `template_key`, `mode` |
| `overslash_action_validations_total` | counter | `template_key`, `mode`, `outcome` |
| `overslash_action_validation_duration_seconds` | histogram | `template_key`, `mode` |
| `overslash_outbound_http_total` | counter | `template_key`, `status_class` |
| `overslash_outbound_http_duration_seconds` | histogram | `template_key`, `status_class` |

### Approvals

| Metric | Type | Labels |
|---|---|---|
| `overslash_approval_events_total` | counter | `event`, `identity_kind` |
| `overslash_approval_resolution_duration_seconds` | histogram | `decision` |
| `overslash_approvals_pending` | gauge | — |

### OAuth

| Metric | Type | Labels |
|---|---|---|
| `overslash_oauth_events_total` | counter | `provider`, `flow`, `status` |
| `overslash_oauth_token_refresh_duration_seconds` | histogram | `provider`, `status` |

### Permissions & rate limiting

| Metric | Type | Labels |
|---|---|---|
| `overslash_permission_checks_total` | counter | `decision`, `layer` |
| `overslash_rate_limit_decisions_total` | counter | `scope`, `decision` |

### Search & secrets

| Metric | Type | Labels |
|---|---|---|
| `overslash_search_queries_total` | counter | `mode`, `status` |
| `overslash_secret_operations_total` | counter | `op`, `status` |

### Webhooks

| Metric | Type | Labels |
|---|---|---|
| `overslash_webhook_deliveries_total` | counter | `event_type`, `status`, `final` |
| `overslash_webhook_delivery_attempts` | histogram | `event_type`, `outcome` |

### Database & background tasks

| Metric | Type | Labels |
|---|---|---|
| `overslash_db_pool_connections` | gauge | `state` (`active`/`idle`) |
| `overslash_background_task_ticks_total` | counter | `task`, `status` |
| `overslash_background_task_duration_seconds` | histogram | `task` |
| `overslash_background_task_last_success_timestamp` | gauge | `task` |

## Structured logs

Overslash emits structured logs via `tracing`. Control verbosity with `RUST_LOG` — a global level or per-target filters:

```bash
RUST_LOG=info
RUST_LOG=info,overslash_metrics=debug   # per-crate override
```

Run behind a log collector that parses the output and ships it to your aggregator.

## Health checks

Two unauthenticated endpoints, mounted outside auth and rate limiting and safe to poll frequently:

| Endpoint | Meaning |
|---|---|
| `GET /health` | Liveness — always returns `200` once the process is up. |
| `GET /ready` | Readiness — returns `200` when the app is initialised (migrations done, pool connected). |

Wire `/ready` to your load balancer / Kubernetes `readinessProbe` and `/health` to the `livenessProbe`.

## Status page

Live production health: [status.overslash.com](https://status.overslash.com).

## Recommended alerts

A starting set, expressed against the metrics above:

- **Stuck background task** — `time() - max by (task) (overslash_background_task_last_success_timestamp) > 300`. A task that hasn't succeeded in 5 minutes is wedged.
- **Pending approvals piling up** — sustained high `overslash_approvals_pending`, or growth without resolutions in `overslash_approval_events_total{event="approved"}`.
- **HTTP 5xx ratio** — `sum(rate(overslash_http_requests_total{status=~"5.."}[5m])) / sum(rate(overslash_http_requests_total[5m]))` above your threshold.
- **OAuth refresh failures** — `rate(overslash_oauth_events_total{flow="refresh",status="failure"}[5m]) > 0`. Failing refreshes mean connections will start breaking.
- **Webhook delivery failures** — `rate(overslash_webhook_deliveries_total{status="failed"}[15m]) > 0`.
- **Secret operation errors / denials** — watch `overslash_secret_operations_total{status="error"}` and `{status="denied"}` for misconfiguration or abuse.

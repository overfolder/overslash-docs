---
title: overslash_search
---

# `overslash_search`

Discover the service instances and actions a caller can reach, by free-text query. Useful when an agent doesn't yet know which service can do what it needs. Each result is one `(instance, action)` pair, ranked by relevance; an empty query lists every callable instance with no actions (browse mode).

::: warning Pre-release
:::

## Parameters

| Field | Type | Default | Notes |
|---|---|---|---|
| `query` | string | — | Free-text query. Pass an empty string to list every callable instance with no actions (browse mode). |
| `include_catalog` | boolean | `false` | When `true`, also surface un-connected templates as `setup_required: true` rows. The default returns only configured instances the caller can call right now. |
| `exclude` | string | — | Comma-separated services to omit. Each entry matches against **both** the instance name (`gmail_work`) and the template key (`gmail`), so one entry can drop a single instance or every instance of a template. Applied before scoring and the result limit. |

## Result shape

```json
{
  "query": "send an email",
  "results": [
    {
      "service": "gmail_work",
      "template": "gmail",
      "service_display_name": "Google Gmail",
      "account_email": "alice@example.com",
      "action": "send_email",
      "description": "Send an email message",
      "risk": "write",
      "tier": "user",
      "auth": { "type": "oauth", "provider": "google", "connected": true },
      "score": 0.94
    }
  ]
}
```

Each result carries:

| Field | Notes |
|---|---|
| `service` | **The instance name — pass this verbatim as the `service` argument to [`overslash_read`](./overslash_read.md) / [`overslash_call`](./overslash_call.md).** Never pass the `template` key. Omitted on `setup_required` rows (no instance is configured yet). |
| `template` | Template key. Always present, so two rows from the same template (`gmail_work`, `gmail_personal`) are recognizable as siblings. |
| `service_display_name` | Human-readable service name. |
| `account_email` | OAuth account identifier (e.g. `alice@example.com`). Present only for OAuth instances whose userinfo lookup returned an email. |
| `secret_name` | Variable name of the secret backing an API-key instance — the label only, never the value. Present only for API-key instances. |
| `action` | Action name. Absent in browse mode (empty query). |
| `description` | Action description. Absent in browse mode. |
| `risk` | `read`, `write`, or `delete`. Absent in browse mode. |
| `tier` | `global`, `org`, `team`, or `user`. |
| `auth` | `{ "type": "oauth" \| "api_key", "provider": <string>, "connected": <bool> }`. `provider` is present only for OAuth; `connected` is `false` for `setup_required` rows. |
| `score` | Relevance score. Absent in browse mode. |
| `setup_required` | `true` for catalog rows whose template has no configured instance. Present only when `include_catalog=true`. Set the row up via the dashboard before it becomes callable. |

## Ranking notes

For a non-empty query, results blend three signals:

1. **Keyword + Jaro-Winkler fuzzy** scoring over every visible `(service, action)` pair (weight `0.4`) — carries exact matches like `stripe` or `list_repos`.
2. **Embedding cosine similarity** via pgvector top-K (weight `0.6`), when embeddings are available for the deployment. Gracefully skipped otherwise.
3. **Post-rank bonuses** — a connected-instance bonus floats up actions the caller can run right now, plus a small bonus toward read-safer actions.

Browse mode (empty query) skips scoring entirely: instances are sorted connected-first, then alphabetically by display name. The default result limit is **20** and the hard cap is **100**; browse mode is not truncated.

## Examples

Search for an action:

```json
{ "query": "send an email" }
```

List every callable instance (browse mode):

```json
{ "query": "" }
```

Include un-connected templates, dropping one already-tried service:

```json
{ "query": "payments", "include_catalog": true, "exclude": "stripe_test" }
```

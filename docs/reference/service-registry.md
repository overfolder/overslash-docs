---
title: Service registry
---

# Service registry

The service registry describes the third-party APIs Overslash can act on. Each service is one **OpenAPI 3.1 document** with a small set of Overslash vendor extensions (`x-overslash-*`) that add the things OpenAPI doesn't model: a stable service key, a per-action risk level, permission scoping, and approval-time disclosure. Built-in services live in the source repo's `services/` directory; orgs can register custom services through the API.

::: warning Pre-release
The schema is stabilising; expect field renames before the first tagged release.
:::

## File layout

One file per service in `services/`, with a `.yaml` or `.yml` extension. At startup every file is parsed as OpenAPI 3.1, its aliases are normalized, and it is compiled into the in-memory service definition that the executor uses. A file that fails to parse, compile, or validate is logged and **skipped** — one broken template can't take down the process — so check the server logs after adding a service.

A synthetic `http` pseudo-service is always present (it backs raw HTTP passthrough) unless a shipped file claims the `http` key. You don't author it; see [Raw HTTP passthrough](#raw-http-passthrough).

## Schema

Overslash reads a standard OpenAPI 3.1 document and maps it onto its own model. The extension fields can be written **bare** (`risk:`, `scope_param:`, `key:`) — the loader normalizes them to their canonical `x-overslash-*` form — so the shipped files stay readable. The mapping:

### Top level

| OpenAPI field | Maps to | Required | Notes |
|---|---|---|---|
| `openapi` | — | yes | Must be `3.1.0`. |
| `info.title` | display name | yes | Human-readable service name. |
| `info.key` | service key | yes | Stable identifier (e.g. `github`). Used everywhere the API refers to the template. |
| `info.description` | description | no | One-line summary. |
| `info.category` | category | no | Grouping label (e.g. `Development`, `Communication`). |
| `servers[].url` | hosts | yes | One or more base URLs; their hostnames bind the service. |
| `components.securitySchemes` | auth methods | no | See [Auth](#auth). |
| `paths` | actions | no | One action per `path` × HTTP method. See [Actions](#actions). |

### Auth

Each entry under `components.securitySchemes` is one auth method.

**OAuth (`type: oauth2`)**

| Field | Required | Notes |
|---|---|---|
| `provider` | yes | OAuth provider key (e.g. `github`, `google`, `slack`). |
| `flows.authorizationCode.authorizationUrl` / `tokenUrl` | yes | Standard OAuth endpoints. |
| `flows.authorizationCode.scopes` | no | The **superset** of scopes the service may request. The caller picks the subset to request at connect time; the provider's granted scopes are recorded on the connection. |

**API key (`type: apiKey`)**

| Field | Required | Notes |
|---|---|---|
| `in` | yes | `header` or `query`. |
| `name` | yes | Header or query-parameter name. |
| `x-overslash-prefix` | no | String prepended to the value (e.g. `"Bearer "`). |
| `default_secret_name` | yes | Name of the vault secret holding the key. |

### Actions

Each `paths.<path>.<method>` operation is one action.

| Field | Required | Default | Notes |
|---|---|---|---|
| `operationId` | yes | — | The action key callers invoke. |
| `summary` | yes | — | Human-readable description. Supports `{param}` interpolation and `[optional segments]` that are dropped when the referenced param is absent. |
| `risk` | no | from method | `read`, `write`, or `delete`. When omitted, defaults from the HTTP method (`GET` → read, etc.). Drives whether an action needs approval and whether [`overslash_read`](./mcp-tools/overslash_read.md) will run it. |
| `scope_param` | no | `*` | Which parameter supplies the `{arg}` segment of the permission key. Without it the arg defaults to `*` (the whole action). |
| `security` | no | service scopes | Per-action minimum OAuth scopes, checked against the connection's granted scopes at call time. |
| `parameters` | no | — | See [Parameters](#parameters). |
| `requestBody` | no | — | Standard OpenAPI request body (`content.application/json.schema`). |

Disclosure and visibility extensions on an action:

| Field | Notes |
|---|---|
| `disclose` | List of `{ label, filter, max_chars? }`. Each `filter` is a jq expression over a `{method, url, params, body}` projection of the resolved request; the extracted values are shown in the approval UI and audit log. `max_chars` clamps long strings (e.g. email bodies). |
| `redact` | Dotted paths into the resolved request to replace with `"[REDACTED]"` in the persisted payload. |
| `response_type` | `json` (default) or `binary` (file downloads). |
| `disabled` | When `true`, hides the action and rejects invocation. |

### Parameters

Each entry in an action's `parameters` list:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Parameter name. |
| `in` | yes | `path` or `query`. |
| `required` | no | Defaults to `false` (path params are required). |
| `description` | no | Shown to agents. |
| `schema.type` | yes | `string`, `integer`, `boolean`, … |
| `schema.enum` | no | Allowed values. |
| `schema.default` | no | Default value. |
| `resolve` | no | `{ get, pick }` resolver that turns an opaque ID into a human-readable name for descriptions: `get` is a GET path with `{param}` placeholders (reusing the service's auth), `pick` is a dot-path into the JSON response. |

### Runtime

Most services are HTTP. The `runtime` extension can also be `mcp` (actions are tools on an external MCP server, configured by an `mcp` block) or `platform` (actions dispatch to in-process Rust handlers). These are advanced; HTTP is the common case documented above.

## Examples

The three shipped files below are the canonical worked examples.

### A read-only action

From `services/github.yaml` — OAuth service, two read actions. `list_repos` shows query parameters with an `enum` and a `default`, and the `[, sorted by {sort}]` optional segment in the summary:

```yaml
openapi: 3.1.0
info:
  title: GitHub
  key: github
  category: Development
servers:
  - url: https://api.github.com
components:
  securitySchemes:
    oauth:
      type: oauth2
      provider: github
      flows:
        authorizationCode:
          authorizationUrl: https://github.com/login/oauth/authorize
          tokenUrl: https://github.com/login/oauth/access_token
          scopes:
            repo: ""
            read:user: ""
            user:email: ""
paths:
  /user:
    get:
      operationId: get_authenticated_user
      summary: Get the authenticated user's profile
      risk: read
  /user/repos:
    get:
      operationId: list_repos
      summary: "List repositories for the authenticated user[, sorted by {sort}]"
      risk: read
      parameters:
        - name: sort
          in: query
          description: Sort by created, updated, pushed, full_name
          schema:
            type: string
            enum: [created, updated, pushed, full_name]
        - name: per_page
          in: query
          description: Results per page (max 100)
          schema:
            type: integer
            default: 30
```

### A write action

From `services/slack.yaml` — a `risk: write` action with `scope_param` (the permission key is anchored on `channel`) and a JSON `requestBody`:

```yaml
openapi: 3.1.0
info:
  title: Slack
  key: slack
  category: Communication
servers:
  - url: https://slack.com
  - url: https://api.slack.com
components:
  securitySchemes:
    oauth:
      type: oauth2
      provider: slack
      flows:
        authorizationCode:
          authorizationUrl: https://slack.com/oauth/v2/authorize
          tokenUrl: https://slack.com/api/oauth.v2.access
          scopes:
            chat:write: ""
            channels:read: ""
paths:
  /api/chat.postMessage:
    post:
      operationId: send_message
      summary: Send a message to Slack channel {channel}
      risk: write
      scope_param: channel
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [channel, text]
              properties:
                channel:
                  type: string
                  description: Channel ID
                text:
                  type: string
                  description: Message text
  /api/conversations.list:
    get:
      operationId: list_channels
      summary: List Slack channels
```

For a richer write example, `services/gmail.yaml`'s `send_message` uses `disclose` to decode the base64url RFC 2822 payload and surface the **To / Subject / Body** in the approval review UI — the pattern for making an opaque body human-reviewable.

### Raw HTTP passthrough

The synthetic `http` pseudo-service backs raw HTTP calls. You don't author a file for it; conceptually it is a service with **no hosts** (the caller supplies the full URL) and **no template-bound auth** (only per-call secret injection):

```yaml
# Conceptual shape of the built-in `http` pseudo-service — not a file you write.
info:
  key: http
  title: Raw HTTP
  category: Platform
servers: []        # no host binding — caller supplies the full URL
# no securitySchemes — per-call secrets only
```

Invoke it with `overslash call --url …` ([CLI](./cli.md#call-fields), Mode A) or `POST /v1/actions/call` with `service: "http"` ([REST → Actions](./rest-api/actions.md)). Note that raw HTTP is **not** expressible through the [`overslash_call`](./mcp-tools/overslash_call.md) MCP tool — it's REST/CLI only.

## Validating

Shipped templates are validated as they load; anything that fails parse, compile, or validation is logged as an error and skipped rather than served. After adding or editing a file, restart and check the logs for a `skipping` line naming your file.

## Registering a custom service

Orgs can register their own services at runtime through the REST API rather than shipping a file. See [REST → Services](./rest-api/services.md) for the endpoints, and [Concepts → Services & actions](../guide/concepts/services-and-actions.md) for how a service definition relates to a runtime action.

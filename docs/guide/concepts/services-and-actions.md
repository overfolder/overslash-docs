---
title: Services & Actions
---

# Services & Actions

A **service** is a third-party API that Overslash knows how to talk to (GitHub, Gmail, Slack, …), described by a YAML file in the service registry. An **action** is a named, parameterised operation on that service (`github.create_issue`, `gmail.send_message`, …). Agents call actions by name; Overslash resolves them to authenticated HTTP requests at execution time.

## The service registry

A service starts life as a **template**: an OpenAPI 3.1 document, annotated with a handful of `x-overslash-*` vendor extensions, that declares the API's base URL, how it authenticates, and which operations are exposed as actions. Templates are loaded into an in-memory **service registry** at startup — every `.yaml`/`.yml` file under the registry directory is parsed, validated, and keyed by its service key (`github`, `gmail`, `google_calendar`, …). A file that fails to parse or validate is skipped with a logged error rather than taking the process down, so one broken template never blocks the rest.

It helps to keep two words straight:

- A **template** is the definition — the YAML. It says *how* to talk to an API but carries no credentials of its own.
- A **service instance** is a template plus bound credentials, scoped to an org (and optionally shadowed per-user). Calling `github` resolves to *your* GitHub instance, with *your* [connection](./connections.md) or [secret](./secrets.md) attached.

The registry also injects one synthetic entry that has no YAML file: the `http` **pseudo-service**, which exposes raw HTTP calls for APIs that don't have a template yet. Granting `http` is rare — it effectively turns Overslash into a general-purpose HTTP proxy — and most orgs leave it ungranted. See [Permissions](./permissions.md) for how the `http` and `secret` pseudo-services are gated.

## Action types: read vs. write

Each operation in a template has an `operationId` (the action name) and a **risk** level — `read`, `write`, or `delete`. Risk is either declared explicitly or inferred from the HTTP method (`GET`/`HEAD`/`OPTIONS` → read, `POST`/`PUT`/`PATCH` → write, `DELETE` → delete).

Risk is not cosmetic. It maps directly onto the coarse-grained access levels a group can grant — `read` access permits read actions, `write` adds mutating actions, and `admin` adds destructive ones — so the same `risk` value that documents an action also determines who is allowed to call it. A service grant marked `auto_approve_reads` lets an agent run read actions with no approval at all, while writes always flow through the approval path. Both behaviours are described in [Permissions](./permissions.md) and [Approvals](./approvals.md).

## Parameters and templating

Actions take parameters — path segments, query strings, and request bodies — declared in the usual OpenAPI way and validated against the template's schema before a call goes out. Three Overslash extensions shape how those parameters surface elsewhere:

- **`scope_param`** names the parameter that becomes the `:arg` segment of the permission key. For a calendar action with `scope_param: calendarId`, a call against one calendar produces the key `google_calendar:create_event:<calendarId>`, so a grant can be scoped to a single calendar rather than the whole service.
- **`resolve`** turns an opaque identifier into a human-readable name for display — given a `calendarId`, Overslash can fetch the calendar and `pick` its `summary`, so approvals and audit rows read "Work" instead of a random ID.
- **Summary templating** lets an action declare a sentence like `"Create event '{summary}' on calendar {calendarId}"`, interpolated with the resolved parameters so a human reviewing an approval sees exactly what is about to happen.

## Custom services

The registry ships with templates for common APIs, but it isn't closed. Org admins (and template authors) can add new templates or import an existing OpenAPI document, and agents can create service instances programmatically — by default `on_behalf_of` their owner-user, so the resulting instance lands in that user's namespace rather than the agent's. Templates are validated on registration and again on promotion, so a malformed `disclose` filter or auth block is rejected before it can reach a live call.

See also: [Reference → Service registry](../../reference/service-registry.md) for the full YAML schema, and [Permissions](./permissions.md) for how a call is authorized once an action resolves.

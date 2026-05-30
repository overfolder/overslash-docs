---
title: Reference
---

# Reference

The reference section is the authoritative description of Overslash's public surface: the REST API, the MCP tool set, the CLI, the service registry YAML format, the configuration matrix, and the architectural notes that explain how the pieces fit together. Use the guide pages for narrative; come here for the exact shape of a call, flag, or schema.

::: warning Pre-release
Every page in this section documents behavior that may change before the first tagged release.
:::

## Sections

- [REST API](./rest-api/index.md) — HTTP endpoints by resource
- [MCP tools](./mcp-tools/index.md) — the tools exposed at `POST /mcp`
- [CLI](./cli.md) — `overslash serve | web | mcp | watch | services | call | admin`
- [Service registry](./service-registry.md) — OpenAPI YAML format for service definitions
- [Configuration](./configuration.md) — environment variables
- [Architecture](./architecture/overview.md) — internals worth knowing

## OpenAPI specification

::: info Planned
A machine-readable OpenAPI specification for the REST API is planned for once the
surface stabilises. Until it ships, the [REST API](./rest-api/index.md) pages are the
authoritative reference. (No spec URL exists yet — this note is a placeholder.)
:::

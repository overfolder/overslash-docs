---
title: Service registry
---

# Service registry

The service registry is a set of YAML files, one per service, that describe a third-party API in terms Overslash understands: base URL, authentication method, actions, parameters, and templating. Built-in services live in the source repo's `services/` directory under MIT; orgs can register custom services through the API.

::: warning Pre-release
The schema is stabilising; expect field renames before the first tagged release.
:::

## File layout

## Schema

### `name`, `display_name`, `category`

### `auth`

### `actions`

### `parameters`

### Templating

## Examples

### A read-only action

### A write action

### A raw HTTP passthrough

## Validating

## Registering a custom service

<!-- TODO: see FOLLOW_UPS.md -->

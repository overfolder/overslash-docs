---
title: Services & Actions
---

# Services & Actions

A **service** is a third-party API that Overslash knows how to talk to (GitHub, Gmail, Slack, …), described by a YAML file in the service registry. An **action** is a named, parameterised operation on that service (`github.create_issue`, `gmail.send_message`, …). Agents call actions by name; Overslash resolves them to authenticated HTTP requests at execution time.

## The service registry

## Action types: read vs. write

## Parameters and templating

## Custom services

See also: [Reference → Service registry](../../reference/service-registry.md).

<!-- TODO: see FOLLOW_UPS.md -->

---
title: MCP OAuth transport
---

# MCP OAuth transport

Overslash implements the MCP Streamable-HTTP transport with OAuth 2.1 on top of standard discovery and dynamic registration. This page is the public summary of the design; the authoritative document is `docs/design/mcp-oauth-transport.md` in the source repo.

::: warning Pre-release
:::

## Transport: Streamable-HTTP at `POST /mcp`

## Authorization-server metadata: `/.well-known/oauth-authorization-server`

## Protected-resource metadata: `/.well-known/oauth-protected-resource`

## Dynamic client registration: `POST /oauth/register`

## Authorization flow

## Consent screen and agent identity binding

## Token issuance, refresh, revocation

## Why the stdio shim still exists

<!-- TODO: see FOLLOW_UPS.md -->

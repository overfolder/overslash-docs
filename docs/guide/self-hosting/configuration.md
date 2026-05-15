---
title: Configuration
---

# Configuration

Overslash is configured exclusively through environment variables. Three are required to boot — `DATABASE_URL`, `SECRETS_ENCRYPTION_KEY`, and `SIGNING_KEY`; everything else (OAuth providers, billing, email, log level) is optional and degrades gracefully when omitted. The canonical list lives in `.env.example` in the source repo and in [Reference → Configuration](../../reference/configuration.md).

## Required variables

## Optional: OAuth providers

## Optional: Email

## Optional: Billing

## Optional: Logging & telemetry

## Profiles for multiple environments

<!-- TODO: see FOLLOW_UPS.md -->

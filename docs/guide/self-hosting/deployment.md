---
title: Deployment
---

# Deployment

Overslash ships as a single static binary with the dashboard embedded. There are three supported shapes: a one-process `overslash web` (binary + Postgres, dashboard on the same port), a split `overslash serve` + standalone dashboard (cloud mode), and a container image suitable for Kubernetes or Docker Compose. The `infra/` directory of the source repo includes reference OpenTofu/Terraform for cloud deployment.

::: warning Pre-release
Deployment shapes may change before the first tagged release.
:::

## Binary

## Docker

## Kubernetes

## Cloud (OpenTofu / Terraform)

## High availability notes

<!-- TODO: see FOLLOW_UPS.md -->

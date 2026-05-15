---
title: Database
---

# Database

Overslash uses PostgreSQL 14+ for all persistent state — users, agents, secrets, connections, approvals, audit. The API auto-applies migrations on startup, so a fresh database needs no setup beyond a connection string. For day-to-day operations you mostly just back it up; for schema work you use `sqlx-cli`.

## Requirements

## First-time bootstrap

## Migrations

## Backup & restore

## Connection pooling

<!-- TODO: see FOLLOW_UPS.md -->

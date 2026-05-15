---
title: Secrets
---

# Secrets

Secrets in Overslash are AES-256-GCM-encrypted, versioned, and **never returned through the API**. Callers reference a secret by handle; Overslash decrypts and injects it server-side at execution time. A new write produces a new version — old versions remain accessible for audit and rollback, but actions always resolve to the current one.

## Storage model

## Versioning

## Why the API never returns secret material

## Rotation

See also: [Self-hosting → Keys & rotation](../self-hosting/keys-and-rotation.md).

<!-- TODO: see FOLLOW_UPS.md -->

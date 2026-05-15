---
title: Keys & Rotation
---

# Keys & Rotation

Two cryptographic keys gate Overslash's security model: `SECRETS_ENCRYPTION_KEY` (used to AES-256-GCM-encrypt every secret in the vault) and `SIGNING_KEY` (used to sign OAuth and session tokens). Both are base64-encoded 32-byte values. Losing the encryption key means losing the vault; rotating it is supported, but requires re-encrypting every secret.

::: warning Pre-release
Re-encryption tooling is partially implemented; verify against `STATUS.md` before relying on it in production.
:::

## Generating keys

## Where to store them

## Rotating `SECRETS_ENCRYPTION_KEY`

The `overslash admin reencrypt` subcommand walks the vault and re-encrypts every secret with the new key.

## Rotating `SIGNING_KEY`

## Disaster recovery

<!-- TODO: see FOLLOW_UPS.md -->

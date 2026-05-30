---
title: Secrets
---

# Secrets

Secrets in Overslash are AES-256-GCM-encrypted, versioned, and **never returned through the API**. Callers reference a secret by handle; Overslash decrypts and injects it server-side at execution time. A new write produces a new version — old versions remain accessible for audit and rollback, but actions always resolve to the current one.

A secret is the simplest credential Overslash holds: an opaque encrypted blob — an API key, a bearer token, a webhook signing secret — that you set and rotate by hand. When a credential needs an OAuth handshake and automatic token refresh instead, that's a [connection](./connections.md), not a secret.

## Storage model

Every secret value is sealed with **AES-256-GCM** before it touches the database. Each encrypted blob is self-describing: a one-byte key version, a 12-byte random nonce generated fresh on every write, and the ciphertext followed by GCM's 16-byte authentication tag. Because the nonce is per-write and random, encrypting the same value twice produces different ciphertext, and the tag means tampering is detected on decrypt rather than silently passed through.

The encryption keys live in a **two-slot keyring** built from the deployment's configuration:

- an **active** key, used to encrypt new writes and to decrypt;
- an optional **previous** key, used to decrypt only.

The one-byte version stamped into each blob tells Overslash which slot decrypts it, so a key rotation can roll forward without a flag day: new writes use the active key, old blobs keep decrypting against the previous slot until they're rewritten. The keyring enforces `active_id > previous_id` so a rotation can never be silently applied in reverse. The operational side of rotating these keys lives in [Self-hosting → Keys & rotation](../self-hosting/keys-and-rotation.md).

Secret names are unique per org (`(org_id, name)`), so two agents under the same user can't mint the same name, and the namespace is shared across the org rather than per-agent.

## Versioning

Secrets are versioned, not overwritten. Every write creates a **new version** and bumps the secret's `current_version`; the prior versions stay in the table. Each version records who created it and when, which is what makes both audit and confident rollback possible.

Rollback never mutates an old version in place — restoring an earlier value simply writes a *new* version pointing at it, so the history stays append-only and the chain of "who set what, when" is never broken. Injection always uses the latest version, so rotating a credential is just another write: the next action picks it up automatically.

## Why the API never returns secret material

The defining invariant is that **secret values never leave the server through the API**. There is no endpoint, response shape, or audit field that returns plaintext to an agent. The invariant is enforced at the type level, not by convention:

- An agent listing secrets (`GET /v1/secrets`, bearer auth) gets a deliberately narrow shape — `{name, version_count, last_rotated_at}` — with no value, no ciphertext, no owner identity, and no creation timestamps. Agents can see *that* a secret exists and when it last rotated, nothing more.
- The dashboard (user/session auth) gets version *metadata* — names, version numbers, who created each version — but still no values in list or detail responses.
- Revealing an actual value is a separate, explicit, dashboard-only action gated by the user's own access; agents have no path to it at all.
- Values are **injected server-side at execution time**, decrypted only inside the action call and gated by the [permission chain](./permissions.md). The agent supplies a reference to the secret, never the secret.
- Where a template marks a field as sensitive, the value is replaced with a `[REDACTED]` sentinel *before* the resolved request is persisted to an approval or audit row — so a secret can't leak through the human-review surface either (see [Audit](./audit.md)).

The practical consequence: a compromised agent, a leaked log line, or a captured approval payload never exposes the underlying credential. The agent can *use* a secret without ever being able to *read* it.

## Rotation

Rotating a secret is a write. Put a new value under the same name, a new version is created, `current_version` advances, and the next action call injects the new material — no redeploy, no cache to clear, and the old version remains for audit. Rotating the *encryption* keys themselves (as opposed to the secrets they protect) uses the keyring's previous-slot mechanism described above; see [Self-hosting → Keys & rotation](../self-hosting/keys-and-rotation.md).

See also: [Connections](./connections.md) for OAuth-backed credentials with automatic refresh, and [Permissions](./permissions.md) for how secret injection is scoped to a specific host.

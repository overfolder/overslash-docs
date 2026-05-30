---
title: Keys & Rotation
---

# Keys & Rotation

Two cryptographic keys gate Overslash's security model: `SECRETS_ENCRYPTION_KEY` (used to AES-256-GCM-encrypt every secret in the vault) and `SIGNING_KEY` (used to sign OAuth and session tokens). Both are **64-character hex** strings — 32 raw bytes. Losing the encryption key means losing the vault; rotating it is supported and is described in full below.

::: warning Pre-release
The re-encryption flow described here works end-to-end (`overslash admin reencrypt`), but the operator runbook is still being finalised. Test a rotation against a copy of your database before running it in production.
:::

## Generating keys

Generate each key with OpenSSL — `-hex 32` produces exactly the 64 hex characters Overslash expects:

```bash
openssl rand -hex 32   # SECRETS_ENCRYPTION_KEY
openssl rand -hex 32   # SIGNING_KEY
```

A base64 value will **not** parse — the keys must be hex.

## Where to store them

Treat both keys as top-tier secrets:

- **Never** bake them into a container image or commit them to version control.
- Inject them at runtime from a secret manager (GCP Secret Manager, AWS Secrets Manager, Kubernetes `Secret`, Compose `.env`).
- **Back up `SECRETS_ENCRYPTION_KEY` separately from the database.** A database backup is useless without the key that decrypts its secrets, and the key is unrecoverable if lost.

## Rotating `SECRETS_ENCRYPTION_KEY`

Rotation is a three-deploy procedure. The encryption layer keeps a **keyring** with an active key and an optional previous key, each tagged by a one-byte version id. Every ciphertext is stamped with the id of the key that wrote it, which is what makes rotation resumable and safe to interleave with live traffic.

**Step 1 — introduce the new key.** Deploy with:

- `SECRETS_ENCRYPTION_KEY` = the **new** key
- `SECRETS_ENCRYPTION_KEY_ACTIVE_ID` = the previous active id **+ 1** (this id must strictly increase on every rotation)
- `SECRETS_ENCRYPTION_KEY_PREVIOUS` = the **old** key (decrypt-only)
- `SECRETS_ENCRYPTION_KEY_PREVIOUS_ID` = the old key's id (defaults to `active_id − 1`)

The server can now decrypt data written under either key and writes all new ciphertext under the new key.

**Step 2 — re-encrypt at rest.** Run a dry run first, then the real pass:

```bash
overslash admin reencrypt --dry-run     # report only, no writes
overslash admin reencrypt               # rewrite every ciphertext under the active key
overslash admin reencrypt --batch 1000  # optional: rows per batch (default 500)
```

`reencrypt` walks every encrypted column (secret values, connection access/refresh tokens, BYOC credentials, IdP client secrets, MCP upstream tokens) in batches. For each row it fast-path skips anything already tagged with the active id, otherwise decrypts with the keyring and re-encrypts under the active key. It prints per-table counts of `total`, `already_active`, `re_encrypted`, and `errors`.

**Step 3 — drop the previous key.** Once `reencrypt` reports zero rows left on the old key, deploy again with `SECRETS_ENCRYPTION_KEY_PREVIOUS` (and `_PREVIOUS_ID`) **removed**. The old key is now retired.

### Failure modes

- **Refuses to run without a previous key.** If `SECRETS_ENCRYPTION_KEY_PREVIOUS` is unset, `reencrypt` exits immediately — there is nothing to rotate from. This guards against running it outside a rotation.
- **Row-level errors are non-fatal.** A row that can't be decrypted (e.g. tagged with a third, unknown key) or written is logged and counted, and the command continues. If any errors accumulated, the command exits non-zero with a count. Run `--dry-run` first to surface undecryptable rows before mutating anything.
- **Not transactional — but safe to re-run.** Rows are written one at a time, so a crash mid-run leaves some rows rotated and some not. Simply run `reencrypt` again: already-rotated rows fast-path skip (they carry the active id), and the rest are picked up. This is correct precisely because the active id strictly increases each rotation.
- **Concurrent writes are handled.** Each update is a compare-and-swap against the ciphertext read at the start; if a live request rewrote the row in between, the swap is a no-op and the row counts as already-active (the concurrent write already used the active key).

## Rotating `SIGNING_KEY`

The signing key is **not** stored anywhere at rest, so rotating it requires no re-encryption. Swap `SIGNING_KEY` for a freshly generated value and redeploy. The trade-off is that existing OAuth and session tokens signed with the old key become invalid, so users and clients re-authenticate after the rotation. Schedule it during a low-traffic window if that matters.

## Disaster recovery

- **Lost `SECRETS_ENCRYPTION_KEY`:** the vault is unrecoverable — there is no backdoor. This is why the key must be backed up independently of the database.
- **Lost `SIGNING_KEY`:** no data loss; generate a new one and redeploy. All sessions and outstanding tokens are invalidated and clients re-authenticate.
- **Restoring a database backup:** restore it alongside the `SECRETS_ENCRYPTION_KEY` that was active when the backup was taken (or any key still on the keyring that can decrypt it).

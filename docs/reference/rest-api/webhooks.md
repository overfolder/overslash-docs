---
title: Webhooks
---

# Webhooks

Overslash can POST out-of-band notifications when an approval is raised or resolved. Webhooks let external systems (PagerDuty, Slack, custom dashboards) react to permission-chain gaps without polling the API.

::: warning Pre-release
:::

## `POST /v1/webhooks`

## `GET /v1/webhooks`

## Event payloads

### `approval.raised`

### `approval.resolved`

## Signing & verification

Every request Overslash sends to your endpoint — the `webhook.verification` handshake, each event delivery, and every retry — is signed with the subscription's secret. The secret is returned **once**, as `secret`, in the `POST /v1/webhooks` response; store it then.

| Header | Value |
|---|---|
| `X-Overslash-Timestamp` | Unix seconds at which this attempt was signed |
| `X-Overslash-Signature-V1` | `v1=<hex>` — HMAC-SHA256 over `"<timestamp>.<raw body>"`, lowercase hex |
| `X-Overslash-Event` | Event type, e.g. `approval.resolved` |
| `X-Overslash-Delivery` | Delivery id — the same as the envelope `id` |
| `X-Overslash-Org` | The org that registered the subscription, so a receiver serving several orgs can pick the secret before verifying |

To verify a delivery:

1. Read the **raw body bytes**. Do not parse and re-serialise the JSON first — the signature is over bytes, and re-serialising changes them. Mount the route before any JSON body-parsing middleware.
2. Reject the request if `X-Overslash-Timestamp` is missing or is not an integer.
3. Reject it if the timestamp is more than **5 minutes** from your clock, in either direction.
4. Compute HMAC-SHA256 with the secret (its UTF-8 bytes, as given — not hex-decoded) as key, over `<timestamp>` + `.` + raw body.
5. Split `X-Overslash-Signature-V1` on commas and compare your hex digest, **in constant time**, against each `v1=` entry. Accept if any matches. More than one entry appears only while a secret is being rotated.
6. Dedupe on the envelope `id` within the tolerance window.

Retries carry the same body (same `id`, same `created_at`) but are re-signed with a fresh timestamp, so a slow retry still verifies while a delivery captured earlier and replayed later does not.

::: warning `X-Overslash-Signature` is no longer sent
Earlier versions also sent `X-Overslash-Signature: sha256=<hex>`, an HMAC over the body alone. With no timestamp inside the MAC, a captured delivery verified forever, so it has been removed. A verifier still reading that header now finds it missing and rejects every delivery — switch it to the `v1` check above. `@overslash/sdk`'s `verifyWebhookSignature`, which checked the old header, has been removed too; use `verifyWebhook`.
:::

### Node / edge (`@overslash/sdk`)

```ts
import { parseWebhookEvent, verifyWebhook } from '@overslash/sdk/node';

app.post('/webhooks/overslash', express.raw({ type: '*/*' }), async (req, res) => {
  const ok = await verifyWebhook({
    payload: req.body, // the raw bytes
    timestamp: req.get('x-overslash-timestamp'),
    signature: req.get('x-overslash-signature-v1'),
    secret: process.env.OVERSLASH_WEBHOOK_SECRET!,
    // toleranceSeconds: 300 (default)
  });
  if (!ok) return res.sendStatus(401);

  const event = parseWebhookEvent(req.body.toString('utf8'));
  // ...
  res.sendStatus(204);
});
```

`verifyWebhook` uses WebCrypto, so the same code runs in Workers and edge runtimes.

### Any language

```python
import hashlib, hmac, re, time

def verify(raw_body: bytes, timestamp: str | None, signature: str | None, secret: str,
           tolerance: int = 300) -> bool:
    # ASCII digits only: str.isdigit() accepts e.g. "²", which int() rejects.
    if not timestamp or not re.fullmatch(r"[0-9]+", timestamp):
        return False
    if abs(time.time() - int(timestamp)) > tolerance:
        return False
    expected = hmac.new(secret.encode(), timestamp.encode() + b"." + raw_body,
                        hashlib.sha256).hexdigest()
    # Keep only hex digests: compare_digest raises on non-ASCII str input.
    candidates = [p.strip()[3:].lower() for p in (signature or "").split(",")
                  if p.strip().startswith("v1=")]
    candidates = [c for c in candidates if re.fullmatch(r"[0-9a-f]+", c)]
    ok = False
    for c in candidates:  # no early exit
        ok = hmac.compare_digest(expected, c) or ok
    return ok
```

Test vector: secret `whsec_test`, timestamp `1790000000`, body `{"id":"x"}` →
`v1=67533a13d71e2eb77b03c01b4fe125052bbf1417cff15203550ad39a75c4995b`.

## Retries

<!-- TODO: see FOLLOW_UPS.md -->

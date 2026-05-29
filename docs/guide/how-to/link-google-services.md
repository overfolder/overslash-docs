---
title: Link Google services
---

# Link Google services

This guide walks you through connecting a Google service — **Google Calendar** in this example — to Overslash using **your own** Google Cloud OAuth client. Once connected, the service's actions become available to your agents through Overslash, which holds the OAuth tokens on your behalf: agents invoke actions, they never see the tokens themselves. The same recipe applies to Gmail and Google Drive — only the scopes differ (see [Step 4](#step-4-configure-the-consent-screen-and-data-access-scopes)).

This is the **"use your own OAuth"** path. If your Overslash deployment already has org- or system-level Google credentials configured, you can connect with a few clicks and skip the Google Cloud setup entirely — but bringing your own OAuth app gives you your own consent screen, your own quota, and full control over which scopes are requested.

See [Connections](../concepts/connections.md) for the underlying model and [Services & Actions](../concepts/services-and-actions.md) for how a connection becomes callable actions.

::: tip Looking to connect a client instead?
Want to connect to Overslash from Claude Code, Cursor, ChatGPT, or another tool so it can act as an agent? See [Connect to Overslash from an MCP client](../../connect/index.md).
:::

## Before you begin

You'll need:

- Access to an **Overslash dashboard**. The quickest path is **Overslash Cloud** at [app.overslash.com](https://app.overslash.com) — sign in and you're ready, with nothing to run or host. If you run Overslash yourself, use your local dashboard (`http://localhost:3000`) or your self-hosted URL instead.
- A **Google account** with access to [Google Cloud Console](https://console.cloud.google.com).

::: tip Your Overslash base URL
Throughout this guide, **`<your-overslash>`** means the base URL of your Overslash dashboard. You'll need it again when you register the redirect URI in Step 5:

- **Overslash Cloud** → `https://app.overslash.com`
- **Local install** → `http://localhost:3000`
- **Self-hosted** → your own `PUBLIC_URL` (e.g. `https://overslash.example.com`)
:::

## Step 1 — Start the connection in Overslash

Begin in Overslash so you know exactly which credentials and scopes Google will ask for.

1. Open the dashboard and go to **Services**.
2. Click **+ New service**.
3. Search for and select the **Google Calendar** template, then click **Use this template**.
4. On the **Configure service** step, choose **Connect a new account**.
5. Expand the **Use your own OAuth app** panel.

Leave this tab open — you'll come back here in Step 6 to paste your Client ID and Client Secret, and in Step 7 to finish.

::: tip Which scopes do I need?
The **Use your own OAuth app** panel lists the exact scopes this service requires. Treat that on-screen list as the source of truth and mirror it in Google Cloud. The scopes are also listed explicitly in [Step 4](#step-4-configure-the-consent-screen-and-data-access-scopes) below.
:::

## Step 2 — Open Google Cloud Console

In a new tab, go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with the Google account that should own the OAuth app.

## Step 3 — Create and switch to a project

An OAuth client lives inside a Google Cloud **project**. Use a dedicated one for Overslash.

1. Click the **project picker** in the top bar (next to the "Google Cloud" logo).
2. Click **New Project**.
3. Name it — e.g. `Overslash` — and click **Create**.
4. When it's created, open the project picker again and **switch to** the new project.

::: tip
A dedicated project keeps the OAuth app, its consent screen, and its quota isolated from your other Google Cloud work.
:::

## Step 4 — Configure the consent screen and data-access scopes

1. In the left menu, go to **APIs & Services**.
2. Open **Library**, search for **Google Calendar API**, and click **Enable**.
3. Go to **OAuth consent screen**. Choose **External**, then fill in the required fields (app name, user support email, developer contact).
4. Open **Data access** → **Add or remove scopes**, and add the Calendar scope:

   ```text
   https://www.googleapis.com/auth/calendar
   ```

5. While the app is unverified, go to **Audience** (or **Test users**) and add your own Google account as a **test user** so you can complete the flow.

::: info Scopes for other Google services
Connecting a different Google service? Enable the matching API and add its scopes instead:

| Service | Scopes |
|---|---|
| **Google Calendar** | `https://www.googleapis.com/auth/calendar` |
| **Google Drive** | `https://www.googleapis.com/auth/drive` |
| **Gmail** | `https://www.googleapis.com/auth/gmail.readonly`, `…/gmail.send`, `…/gmail.modify`, `…/gmail.compose`, `…/gmail.metadata` |

Gmail's `readonly`, `send`, and `modify` scopes are **restricted** under Google's verification regime and may require [CASA security assessment](https://support.google.com/cloud/answer/13464321) before you can use the app in production with real users. Test users are unaffected.
:::

## Step 5 — Create the OAuth client

1. Go to **APIs & Services** → **Credentials**.
2. Click **Create credentials** → **OAuth client ID**.
3. For **Application type**, choose **Web application**, and give it a name (e.g. `Overslash`).
4. Under **Authorized redirect URIs**, click **Add URI** and enter Overslash's OAuth callback — `<your-overslash>` followed by `/v1/oauth/callback`:

   ```text
   # Overslash Cloud
   https://app.overslash.com/v1/oauth/callback

   # Local install
   http://localhost:3000/v1/oauth/callback

   # Self-hosted deployment
   https://overslash.example.com/v1/oauth/callback
   ```

   ::: warning Match it exactly
   The redirect URI must match **byte-for-byte** — same scheme (`http`/`https`), same host and port, the `/v1/oauth/callback` path, and **no trailing slash**. A mismatch is the most common cause of a `redirect_uri_mismatch` error during Step 7.
   :::

   You do **not** need to add an **Authorized JavaScript origin** — Overslash uses the server-side authorization-code flow, which Google authorizes against the redirect URI only.

5. Click **Create**. Copy the **Client ID** and **Client secret** from the dialog.

## Step 6 — Paste the secrets into Overslash

Return to the **Use your own OAuth app** panel from Step 1 and paste in:

- **Client ID** — e.g. `1234567890-abc.apps.googleusercontent.com`
- **Client Secret** — use the **Show**/**Hide** toggle to verify you pasted it correctly.

::: tip Where do the secrets go?
Overslash stores your Client ID and Client Secret **encrypted at rest** (with the server's secrets-encryption key) and binds the resulting connection to them, so token refreshes always reuse your OAuth app. The secrets are never exposed to agents.
:::

## Step 7 — Finish connecting

1. Click **+ Connect new**. Overslash saves your credentials and opens a Google consent popup.
2. Pick the Google account you added as a test user and **approve** the requested Calendar access.
3. The popup closes and Overslash auto-selects the new connection.
4. Give the service a **name** (or accept the default), then click **Create service**.

You'll land on the service's detail page, which shows the connected Google account and the granted scopes.

## Verify

On the service detail page, open the **Credentials** tab and confirm:

- A **✓ connected** badge showing the Google account email.
- The granted **scopes** (e.g. a `calendar` scope chip).

From here the service's actions are available to your agents — try a read action against your calendar (for example via `overslash_search` / `overslash_read`) to confirm the connection works end to end.

## Troubleshooting

- **`redirect_uri_mismatch`** — The redirect URI in Google Cloud doesn't exactly match `<your-overslash>/v1/oauth/callback`. Recheck the scheme, host, port, and trailing slash. On Overslash Cloud this is always `https://app.overslash.com/v1/oauth/callback`; if you self-host, confirm your deployment's `PUBLIC_URL` matches the URL you registered.
- **`access_blocked` / "app isn't verified"** — Your account isn't a test user on the consent screen, or the app needs verification. Add yourself under **Audience** / **Test users** (Step 4).
- **Missing or denied scope** — If an action fails for lack of a scope, add it under **Data access** in Google Cloud, then reconnect from the service's **Credentials** tab to re-run consent.
- **Wrong project** — If the OAuth client or enabled API seems to be missing, confirm the project picker is set to the project you created in Step 3.

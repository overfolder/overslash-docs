---
title: Set up an org-wide Google OAuth app
---

# Set up an org-wide Google OAuth app

This guide is for **org admins** who want to set up one Google OAuth app for the whole organization. Once it's saved under **Org settings → OAuth App Credentials**, every member connects Google Calendar, Gmail, Drive, Tasks, and Keep through it. Nobody has to bring their own app, and nobody depends on the instance's default Google client.

If you only want to connect your own account with your own OAuth app, follow [Link Google services](./link-google-services.md) instead.

## Why an org-wide app

Overslash looks for an OAuth client in this order and uses the first one it finds (see [Connections](../concepts/connections.md)):

1. **Your own app (BYOC)**, set by a user for their own connections.
2. **The org's app**, set by an admin. This is the one this guide sets up.
3. **The instance's default app**, set by whoever operates the Overslash deployment.

Setting up an org-wide app makes sense when:

- **Your org runs on Google Workspace** and wants to use Gmail, Drive, or Keep. These scopes are **restricted**. A public app needs Google verification and a [CASA security assessment](https://support.google.com/cloud/answer/13464321) to use them. An **Internal** app, used only by your own domain, needs neither.
- You want your **own consent screen**, with your org's name and logo instead of the instance's.
- You want your **own quota and audit trail** in a Google Cloud project you control.

## Internal or External?

Pick the audience before you start, because it decides almost everything else.

| | **Internal** (recommended for Workspace) | **External** |
|---|---|---|
| Who can connect | Only accounts in your Google Workspace organization | Any Google account |
| Google verification / CASA | **Not required**, even for restricted scopes | Required for sensitive and restricted scopes before going to production |
| While unverified | Not applicable | Only listed test users (up to 100) can connect, they see an "unverified app" warning, and **refresh tokens expire after 7 days** |
| Requirement | The Google Cloud project must belong to your Workspace organization | Any Google Cloud project |

::: tip Use Internal if you can
With **Internal**, Gmail, Drive, and Keep work for your whole team right away, and connections don't expire. Only choose External if some people who need to connect use accounts outside your Workspace domain, such as personal Gmail.
:::

## Before you begin

You'll need:

- **Org admin** access in Overslash. The OAuth App Credentials page is admin-only.
- A Google account that can **create projects inside your Workspace organization** in [Google Cloud Console](https://console.cloud.google.com). Ask your Workspace admin if you're not sure.
- Your **Overslash base URL**, written `<your-overslash>` below:
  - **Overslash Cloud**: `https://app.overslash.com`
  - **Self-hosted**: your deployment's `PUBLIC_URL`

::: tip Copy the URLs from Overslash
In Overslash, open **Org settings → OAuth App Credentials → Add provider credentials** and pick **Google**. The form shows the exact redirect URIs for your deployment, ready to copy, with a link back to this guide.
:::

## Step 1: Create a project in your organization

1. In [Google Cloud Console](https://console.cloud.google.com), open the **project picker** and click **New Project**.
2. Set **Organization** (and **Location**) to your Workspace organization. **Internal** is only offered for projects that belong to an organization.
3. Name it, for example `Overslash`, click **Create**, then switch to the new project.

## Step 2: Enable the APIs

Go to **APIs & Services → Library** and enable the API for each Google service your org will use:

| Service | API to enable |
|---|---|
| Google Calendar | **Google Calendar API** |
| Gmail | **Gmail API** |
| Google Drive | **Google Drive API** |
| Google Tasks | **Google Tasks API** |
| Google Keep | **Google Keep API** |

## Step 3: Configure the consent screen

1. Go to **Google Auth Platform** (shown as **OAuth consent screen** in older consoles).
2. Under **Branding**, set the app name, user support email, and developer contact. Members see this name when they connect.
3. Under **Audience**, choose **Internal**, or **External** if you decided on that above.
4. Under **Data access → Add or remove scopes**, add the scopes for the services you enabled:

| Service | Scopes | Google classification |
|---|---|---|
| **Always** (identifies the connected account) | `openid`, `https://www.googleapis.com/auth/userinfo.email`, `https://www.googleapis.com/auth/userinfo.profile` | Non-sensitive |
| Google Calendar | `https://www.googleapis.com/auth/calendar` | Sensitive |
| Gmail | `https://www.googleapis.com/auth/gmail.readonly`, `…/gmail.modify`, `…/gmail.compose`, `…/gmail.metadata` | Restricted |
| Gmail | `https://www.googleapis.com/auth/gmail.send` | Sensitive |
| Google Drive | `https://www.googleapis.com/auth/drive` | Restricted |
| Google Tasks | `https://www.googleapis.com/auth/tasks`, `…/tasks.readonly` | Sensitive |
| Google Keep | `https://www.googleapis.com/auth/keep` | Restricted |

Overslash always adds the three identity scopes, so it can label each connection with the Google account it belongs to.

::: info Sensitive and restricted scopes
With an **Internal** app, these classifications have no effect: Google doesn't review Internal apps. With an **External** app, sensitive scopes need Google verification, and restricted scopes also need a CASA assessment. Until then, only test users can connect.
:::

## Step 4: Create the OAuth client

1. Go to **Google Auth Platform → Clients** (or **APIs & Services → Credentials**) and click **Create client** (or **Create credentials → OAuth client ID**).
2. **Application type**: **Web application**. Give it a name, for example `Overslash`.
3. Under **Authorized redirect URIs**, add **both** of these:

   ```text
   <your-overslash>/v1/oauth/callback
   <your-overslash>/auth/callback/google
   ```

   On Overslash Cloud:

   ```text
   https://app.overslash.com/v1/oauth/callback
   https://app.overslash.com/auth/callback/google
   ```

   - **`/v1/oauth/callback`** is for **service connections** (Calendar, Gmail, Drive, and so on).
   - **`/auth/callback/google`** is for **signing in to Overslash with Google**. Once you save org credentials, Overslash also uses them for your members' Google sign-in. If this URI is missing, Google sign-in fails with `redirect_uri_mismatch`.

   ::: warning Match it exactly
   Each URI must match byte for byte: the same scheme, host, and port, the exact path, and **no trailing slash**.
   :::

4. Under **Authorized JavaScript origins**, you can add `<your-overslash>`. Overslash uses the server-side authorization-code flow, so Google doesn't strictly require it.
5. Click **Create**, then copy the **Client ID** (`…apps.googleusercontent.com`) and the **Client secret**.

::: warning Treat the client secret like a password
Paste it straight into Overslash in the next step. Don't send it over chat or email. If it leaks, rotate it in Google Cloud and update it in Overslash.
:::

## Step 5: Save the credentials in Overslash

1. In Overslash, go to **Org settings → OAuth App Credentials**.
2. Click **Add provider credentials**, or **Override** if the Google row is currently served by the instance (`env`).
3. Choose **Google**, then paste the **Client ID** and **Client secret**.
4. Click **Save credentials**.

Overslash stores both values encrypted in your org's vault. Agents never see them, and the API never returns the secret.

## Step 6: Test it

1. As a member of the org, connect a Google service, for example by creating a **Google Calendar** service from its template and choosing **Connect a new account**.
2. Google's consent screen should show **your app's name**. With an Internal app there's no "unverified app" warning.
3. Sign out and sign back in to Overslash with Google to confirm sign-in still works.

## What happens to existing connections

- **New connections** use the org app straight away.
- **Existing connections made with the instance's default client need to be reconnected.** Overslash refreshes tokens with whichever org or instance client is current. Google refuses to refresh a token for any client other than the one that issued it, so these connections stop working at their next refresh, usually within an hour. Reconnect them from the service's **Credentials** tab. Set up the org app before your members start connecting, or plan a short reconnect round.
- **Connections made with a member's own app (BYOC)** are unaffected. They're tied to that app and keep using it.
- **Removing or replacing** the org credential has the same effect in reverse: connections made with the old org app need to be reconnected.

## Troubleshooting

- **`redirect_uri_mismatch` when connecting a service**: `<your-overslash>/v1/oauth/callback` is missing from the client or doesn't match exactly.
- **`redirect_uri_mismatch` when signing in**: `<your-overslash>/auth/callback/google` is missing.
- **"Error 403: org_internal"**: the account that's connecting isn't in your Workspace organization. That's expected with an **Internal** app. Connect with a Workspace account, or switch the app to External.
- **"Internal" isn't offered under Audience**: the project doesn't belong to a Workspace organization. Create it under your organization (Step 1).
- **`access_not_configured` or "API has not been used in project"**: enable the matching API (Step 2) in the same project as the client.
- **Connections stopped working right after saving the org app**: they were made with the instance's default client. Reconnect them (see [What happens to existing connections](#what-happens-to-existing-connections)).
- **A connection stops working after about a week**: the app is **External** and still in testing, where Google expires refresh tokens after 7 days. Use an Internal app, or complete Google verification.

---
title: ChatGPT
---

# ChatGPT

ChatGPT supports remote MCP servers via its connectors interface. Configure Overslash as a connector with the URL `https://<your-overslash>/mcp`, complete the OAuth flow in the popup, and Overslash tools become callable from any ChatGPT conversation that has connectors enabled.

## Enable Developer Mode

Full custom MCP connectors live behind Developer Mode:

1. Click your profile → **Settings → Connectors**.
2. Click **Advanced** at the bottom.
3. Toggle **Developer mode** on.

## Add Overslash as a connector

1. Back in **Settings → Connectors**, click **Create**.
2. Give it a name (e.g. `Overslash`).
3. Enter the MCP server URL: `https://<your-overslash>/mcp`.
4. Set **Authentication** to **OAuth**.
5. Click **Create** — ChatGPT opens the OAuth popup.

## What the consent screen asks

The popup signs you into Overslash and asks you to **pick or create an agent** for ChatGPT to act as. Overslash requests a single `mcp` scope. After you confirm, the connector is bound to that agent's token.

## Verifying the connection

Start a conversation with connectors/developer tools enabled and confirm Overslash's tools (`overslash_search`, `overslash_call`, …) are listed and callable. Asking ChatGPT to run `overslash_auth whoami` returns the agent identity it's acting as.

## Limits and known issues

::: warning ChatGPT connects from OpenAI's cloud
The connector reaches your MCP server over the public internet from OpenAI's side, so the URL must be HTTPS and publicly reachable — `http://localhost:3000/mcp` will not work.
:::

Plan availability: custom connectors via Developer Mode are available on Plus, Pro, Team, Enterprise, and Edu — **not** on Free. Developer Mode is beta, so exact labels may shift between releases.

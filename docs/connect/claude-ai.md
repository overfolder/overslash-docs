---
title: Claude.ai
---

# Claude.ai

Claude.ai supports adding remote MCP servers as **custom connectors**. Paste your Overslash MCP URL into the connector setup flow, complete the OAuth consent in the popup, and Overslash tools (`overslash_search`, `overslash_call`, …) become available inside Claude.ai conversations.

## Add Overslash as a custom connector

On a Pro or Max individual plan:

1. Go to **Settings → Connectors** (also reachable via **Customize → Connectors**).
2. Click **+ Add custom connector** (the "+" next to Connectors).
3. Paste your MCP server URL: `https://<your-overslash>/mcp`.
4. (Optional) Expand **Advanced settings** to supply an OAuth Client ID / Secret — leave these blank to let Overslash register the client dynamically.
5. Click **Add**, then **Connect** to start the OAuth flow.

On a **Team or Enterprise** plan, an owner adds it once for the org first: **Settings → Connectors → Add → Custom → Web**, paste the URL, **Add**. Members then open **Customize → Connectors** and click **Connect** on the listed connector.

## What the consent screen asks

The OAuth popup signs you into Overslash and asks you to **pick or create an agent** for Claude.ai to act as. Overslash requests a single `mcp` scope. After you confirm, Claude.ai stores the agent's bearer token and the connector goes live.

## Verifying the connection

Open a new conversation, click the tools/connectors control, and confirm Overslash's tools (`overslash_search`, `overslash_call`, …) appear and are enabled. Asking Claude to run `overslash_auth whoami` echoes back the agent identity it's acting as.

## Limits and known issues

::: warning Claude.ai connects from Anthropic's cloud
Custom connectors reach your MCP server from Anthropic's cloud, **not** from your device — your instance must be reachable over the public internet. A `http://localhost:3000/mcp` URL will not work; if your server sits behind a firewall, allowlist Anthropic's published IP ranges.
:::

Plan availability: custom connectors are available on Free, Pro, Max, Team, and Enterprise, with Free limited to a single custom connector. The feature is in beta, so exact labels may shift between releases.

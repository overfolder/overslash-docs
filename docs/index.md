---
layout: home

hero:
  name: Overslash
  text: Identity, secrets & authenticated execution for AI agents
  tagline: A standalone, multi-tenant gateway that sits between your agents and the outside world — so they can act, without ever touching your credentials.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Connect a client
      link: /connect/
    - theme: alt
      text: Reference
      link: /reference/

features:
  - title: Encrypted secret vault
    details: Versioned, AES-256-GCM-encrypted secrets that are never returned through the API. Agents reference them by handle; Overslash injects them at call time.
  - title: OAuth + human approvals
    details: Connect a service once, reuse it across agents. Out-of-band approvals route to a human when an agent reaches the edge of its permission chain.
  - title: Authenticated HTTP execution
    details: Agents call services through Overslash — high-level service+action, connection-based HTTP, or raw HTTP — and credentials stay server-side.
---

::: warning Pre-release
Overslash is under active development and **not yet ready for production use**. APIs, schemas, and behaviors will change without notice.
:::

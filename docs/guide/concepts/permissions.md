---
title: Permissions
---

# Permissions

Permissions in Overslash form an inheritance chain: a user grants scopes to an agent, an agent may delegate a subset to a subagent, and every call is checked against the live chain at execution time. A gap anywhere in the chain doesn't fail the call — it raises an approval, which a human can resolve to widen the chain just enough to proceed.

## The chain: User → Agent → SubAgent

## Scopes and services

## Standing permissions vs. one-off approvals

## Roles (viewer / operator / admin)

<!-- TODO: see FOLLOW_UPS.md -->

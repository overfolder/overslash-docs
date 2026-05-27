import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  base: '/docs/',
  title: 'Overslash',
  description: 'Documentation for Overslash — an identity, secrets, and authenticated-execution gateway for AI agents.',
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.ico' }],
  ],

  // FOLLOW_UPS.md is a maintainer punch list, not a published page.
  srcExclude: ['**/FOLLOW_UPS.md'],

  themeConfig: {
    siteTitle: 'Overslash',

    nav: [
      { text: 'Guide', link: '/guide/what-is-overslash' },
      { text: 'Connect', link: '/connect/' },
      { text: 'Reference', link: '/reference/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Overslash?', link: '/guide/what-is-overslash' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Status & Roadmap', link: '/guide/status-and-roadmap' },
          ],
        },
        {
          text: 'Concepts',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/concepts/' },
            { text: 'Identities', link: '/guide/concepts/identities' },
            { text: 'Services & Actions', link: '/guide/concepts/services-and-actions' },
            { text: 'Secrets', link: '/guide/concepts/secrets' },
            { text: 'Connections', link: '/guide/concepts/connections' },
            { text: 'Approvals', link: '/guide/concepts/approvals' },
            { text: 'Permissions', link: '/guide/concepts/permissions' },
            { text: 'Audit', link: '/guide/concepts/audit' },
          ],
        },
        {
          text: 'How-to guides',
          collapsed: false,
          items: [
            { text: 'Link Google services', link: '/guide/how-to/link-google-services' },
            { text: 'Connect an MCP client', link: '/connect/' },
          ],
        },
        {
          text: 'Self-hosting',
          collapsed: true,
          items: [
            { text: 'Deployment', link: '/guide/self-hosting/deployment' },
            { text: 'Configuration', link: '/guide/self-hosting/configuration' },
            { text: 'Keys & Rotation', link: '/guide/self-hosting/keys-and-rotation' },
            { text: 'Database', link: '/guide/self-hosting/database' },
            { text: 'Monitoring', link: '/guide/self-hosting/monitoring' },
          ],
        },
      ],
      '/connect/': [
        {
          text: 'Connect an MCP client',
          items: [
            { text: 'Overview', link: '/connect/' },
            { text: 'Claude Code', link: '/connect/claude-code' },
            { text: 'Claude.ai', link: '/connect/claude-ai' },
            { text: 'ChatGPT', link: '/connect/chatgpt' },
            { text: 'Cursor', link: '/connect/cursor' },
            { text: 'Windsurf', link: '/connect/windsurf' },
            { text: 'OpenClaw', link: '/connect/openclaw' },
            { text: 'Other MCP clients', link: '/connect/other-mcp-clients' },
            { text: 'Stdio fallback', link: '/connect/stdio-fallback' },
          ],
        },
        {
          text: 'Connect a service',
          items: [
            { text: 'Link Google services', link: '/guide/how-to/link-google-services' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Overview', link: '/reference/' },
            { text: 'CLI', link: '/reference/cli' },
            { text: 'Service registry', link: '/reference/service-registry' },
            { text: 'Configuration', link: '/reference/configuration' },
          ],
        },
        {
          text: 'REST API',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/reference/rest-api/' },
            { text: 'Actions', link: '/reference/rest-api/actions' },
            { text: 'Approvals', link: '/reference/rest-api/approvals' },
            { text: 'Secrets', link: '/reference/rest-api/secrets' },
            { text: 'Connections', link: '/reference/rest-api/connections' },
            { text: 'Services', link: '/reference/rest-api/services' },
            { text: 'Identities', link: '/reference/rest-api/identities' },
            { text: 'Search', link: '/reference/rest-api/search' },
            { text: 'Audit', link: '/reference/rest-api/audit' },
            { text: 'Webhooks', link: '/reference/rest-api/webhooks' },
            { text: 'OAuth', link: '/reference/rest-api/oauth' },
          ],
        },
        {
          text: 'MCP tools',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/reference/mcp-tools/' },
            { text: 'overslash_search', link: '/reference/mcp-tools/overslash_search' },
            { text: 'overslash_call', link: '/reference/mcp-tools/overslash_call' },
            { text: 'overslash_read', link: '/reference/mcp-tools/overslash_read' },
            { text: 'overslash_auth', link: '/reference/mcp-tools/overslash_auth' },
            { text: 'overslash_approve', link: '/reference/mcp-tools/overslash_approve' },
          ],
        },
        {
          text: 'Architecture',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/reference/architecture/overview' },
            { text: 'MCP OAuth transport', link: '/reference/architecture/mcp-oauth-transport' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/overfolder' },
    ],

    footer: {
      message: 'Pre-release software — subject to change without notice.',
      copyright: 'Copyright © 2026 Overspiral S.L.',
    },

    search: {
      provider: 'local',
    },
  },
}))

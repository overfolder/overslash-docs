import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import fs from 'node:fs/promises'
import path from 'node:path'

const SITE_URL = 'https://app.overslash.com'
const BASE = '/docs/'

// Page metadata collected during render (transformPageData), consumed in
// buildEnd to generate llms.txt. Module-scoped: the SSG build is a single pass.
type PageMeta = { relativePath: string; title: string; description: string }
const pageMeta: PageMeta[] = []

// Friendly section names keyed by the top-level path segment, in display order.
const SECTIONS: { key: string; title: string }[] = [
  { key: '', title: 'Overview' },
  { key: 'guide', title: 'Guide' },
  { key: 'connect', title: 'Connect' },
  { key: 'reference', title: 'Reference' },
]

const sectionKey = (relativePath: string): string =>
  relativePath.includes('/') ? relativePath.split('/')[0] : ''

// Build an llms.txt (https://llmstxt.org) index linking every page's Markdown
// source, grouped by section.
function buildLlmsTxt(): string {
  // Dedupe by path (last write wins) in case transformPageData ran more than once.
  const byPath = new Map<string, PageMeta>()
  for (const m of pageMeta) byPath.set(m.relativePath, m)
  const pages = [...byPath.values()]

  const sections = [...SECTIONS]
  for (const m of pages) {
    const key = sectionKey(m.relativePath)
    if (!sections.some((s) => s.key === key)) {
      sections.push({ key, title: key.charAt(0).toUpperCase() + key.slice(1) })
    }
  }

  const lines: string[] = [
    '# Overslash',
    '',
    '> Documentation for Overslash — an identity, secrets, and authenticated-execution gateway for AI agents.',
    '',
    'Append `.md` to any docs URL to fetch its raw Markdown source. The links below point to those Markdown files.',
  ]

  for (const section of sections) {
    const inSection = pages
      .filter((m) => sectionKey(m.relativePath) === section.key)
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath))
    if (inSection.length === 0) continue
    lines.push('', `## ${section.title}`)
    for (const p of inSection) {
      const url = `${SITE_URL}${BASE}${p.relativePath}`
      const desc = p.description.trim()
      lines.push(`- [${p.title}](${url})${desc ? `: ${desc}` : ''}`)
    }
  }

  return lines.join('\n') + '\n'
}

export default withMermaid(defineConfig({
  base: '/docs/',
  title: 'Overslash',
  description: 'Documentation for Overslash — an identity, secrets, and authenticated-execution gateway for AI agents.',
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.ico' }],
  ],

  // FOLLOW_UPS.md is a maintainer punch list, not a published page.
  srcExclude: ['**/FOLLOW_UPS.md'],

  sitemap: {
    hostname: SITE_URL,
    // VitePress emits item URLs like "connect/chatgpt.html" — without the `/docs/`
    // base and with a `.html` that Vercel's cleanUrls strips. Rewrite to the real
    // public URL, e.g. https://app.overslash.com/docs/connect/chatgpt.
    transformItems(items) {
      return items.map((item) => {
        const clean = item.url.replace(/\.html$/, '').replace(/(^|\/)index$/, '$1')
        return { ...item, url: `docs/${clean}` }
      })
    },
  },

  // Collect page metadata for the llms.txt index built in buildEnd.
  transformPageData(pageData) {
    const isHome = pageData.relativePath === 'index.md'
    pageMeta.push({
      relativePath: pageData.relativePath,
      title: pageData.title || (isHome ? 'Overslash' : pageData.relativePath),
      description: pageData.frontmatter?.description || pageData.description || '',
    })
  },

  async buildEnd(siteConfig) {
    // 1. Copy each page's Markdown source next to its compiled HTML, so that
    //    appending `.md` to any docs URL returns the raw source. siteConfig.pages
    //    already respects srcExclude (FOLLOW_UPS.md is omitted).
    for (const page of siteConfig.pages) {
      const from = path.join(siteConfig.srcDir, page)
      const to = path.join(siteConfig.outDir, page)
      await fs.mkdir(path.dirname(to), { recursive: true })
      await fs.copyFile(from, to)
    }

    // 2. Emit llms.txt (llmstxt.org) indexing every page for agent navigation.
    await fs.writeFile(path.join(siteConfig.outDir, 'llms.txt'), buildLlmsTxt(), 'utf-8')
  },

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

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Overslash',
  description: 'Documentation for Overslash',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    siteTitle: 'Overslash',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Dashboard', link: 'https://overslash.com', target: '_self' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Overslash?', link: '/guide/what-is-overslash' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/overfolder' },
    ],

    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2025–present Overslash',
    },

    search: {
      provider: 'local',
    },
  },
})

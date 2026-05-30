import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import MarkdownLink from './MarkdownLink.vue'
import type { Theme } from 'vitepress'

// Extend the default theme to add a "View as Markdown" link at the foot of each
// content page, pointing to that page's raw .md source.
export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-footer-before': () => h(MarkdownLink),
    })
  },
} satisfies Theme

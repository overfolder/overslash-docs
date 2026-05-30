<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, site } = useData()

// site.base ends with '/', page.relativePath is e.g. 'guide/what-is-overslash.md'
// → /docs/guide/what-is-overslash.md
const href = computed(() => site.value.base + page.value.relativePath)
</script>

<template>
  <div class="view-markdown">
    <a :href="href">View this page as Markdown ↗</a>
    <span class="view-markdown__hint">— or append <code>.md</code> to any docs URL.</span>
  </div>
</template>

<style scoped>
.view-markdown {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.view-markdown a {
  font-weight: 500;
  color: var(--vp-c-brand-1);
}
.view-markdown__hint {
  margin-left: 0.4rem;
}
</style>

import { markRaw } from 'vue'

const _cache = new Map<string, any>()

/**
 * Memoized wrapper around @nuxt/content's parseMarkdown().
 * Results are wrapped in markRaw() to avoid reactive overhead on AST nodes.
 */
export async function cachedParseMarkdown(markdown: string) {
  const cached = _cache.get(markdown)
  if (cached) return cached

  const result = markRaw(await parseMarkdown(markdown))
  _cache.set(markdown, result)
  return result
}

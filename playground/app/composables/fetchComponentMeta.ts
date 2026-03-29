/**
 * Fetches component metadata (props, slots, events) for a given component name.
 * The data is served by /api/component-meta/[name].get.ts which provides
 * statically defined meta for Pro components.
 */
export function useFetchComponentMeta(name: string) {
  return useAsyncData(`component-meta-${name}`, () => $fetch<{ meta: any }>(`/api/component-meta/${name}.json`).catch(() => ({}) as any), {
    lazy: import.meta.client,
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
  })
}

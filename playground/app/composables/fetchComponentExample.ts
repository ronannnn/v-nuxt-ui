/**
 * Fetches example component source code for display in ComponentExample.
 * The data is served by /api/component-example/[name].get.ts which reads
 * the .vue source files from the examples directory.
 */
export function useFetchComponentExample(name: string) {
  return useAsyncData(`component-example-${name}`, () => $fetch(`/api/component-example/${name}.json`).catch(() => ({})), {
    lazy: import.meta.client,
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
  })
}

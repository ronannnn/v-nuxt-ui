import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

function upperFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Serves the source code of example components from the playground's
 * components/content/examples/ directory. This mirrors v4's API that
 * returns { code, pascalName } for ComponentExample to render.
 */
export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, message: 'Example name is required' })
  }

  const cleanName = name.replace(/\.json$/, '')
  const pascalName = upperFirst(cleanName)

  // Try to find the example file in the examples directory
  const possiblePaths = [
    resolve(process.cwd(), 'playground/app/components/content/examples', `${pascalName}.vue`),
    resolve(process.cwd(), 'app/components/content/examples', `${pascalName}.vue`),
    // Also try with the name as-is
    resolve(process.cwd(), 'playground/app/components/content/examples', `${cleanName}.vue`),
    resolve(process.cwd(), 'app/components/content/examples', `${cleanName}.vue`)
  ]

  for (const filePath of possiblePaths) {
    if (existsSync(filePath)) {
      try {
        const code = readFileSync(filePath, 'utf-8')
        return { code, pascalName }
      } catch {
        // Continue to next path
      }
    }
  }

  // Return empty if not found
  return { code: '', pascalName }
})

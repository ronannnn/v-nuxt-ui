import { z } from 'zod'
import { defineCollection } from '@nuxt/content'

const Button = z.object({
  label: z.string(),
  icon: z.string().optional(),
  to: z.string().optional(),
  target: z.enum(['_blank', '_self']).optional(),
  color: z.enum(['primary', 'neutral', 'success', 'warning', 'error', 'info']).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  variant: z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional()
})

export const collections = {
  docs: defineCollection({
    type: 'page',
    source: [{
      include: 'docs/**/*'
    }],
    schema: z.object({
      category: z.enum(['component', 'composable', 'utility', 'data', 'form', 'layout', 'overlay', 'element']).optional(),
      navigation: z.object({
        title: z.string().optional(),
        badge: z.string().optional()
      }).optional(),
      links: z.array(Button).optional()
    })
  })
}

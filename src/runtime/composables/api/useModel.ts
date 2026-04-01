import type { BaseModel } from '#v/types'
import { createSharedComposable } from '@vueuse/core'

export const useBizModel = createSharedComposable(() => ({
  extractIds: <T extends BaseModel>(models: T[] | undefined): T[] | undefined => models?.map(model => ({ id: model.id } as T))
}))

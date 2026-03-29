import type { SortableEvent } from 'vue-draggable-plus'
import type { GroupOptions } from 'sortablejs'

export type DndProps<T> = {
  handle?: string
  group?: GroupOptions | string
  sort?: boolean
  chosenClass?: string
  dragClass?: string
  ghostClass?: string
  forceFallback?: boolean
  clone?: (model: T) => T
  onAdd?: (event: SortableEvent) => void
  onEnd?: (event: SortableEvent) => void
}

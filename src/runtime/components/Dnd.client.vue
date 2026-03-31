<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { isEmptyString } from '#v/utils'
import { useApp } from '#v/composables/useApp'
import type { DndProps } from '../types/components/dnd'

const { sort = true, forceFallback = true, chosenClass } = defineProps<DndProps<T>>()
const model = defineModel<T[]>({
  default: () => []
})

const coalesceChosenClass = computed(() => {
  return !isEmptyString(chosenClass) ? chosenClass : (useApp().isMobile.value ? 'bg-muted' : '')
})
</script>

<template>
  <vue-draggable
    v-model="model"
    :animation="200"
    :handle="handle"
    :group="group"
    :chosen-class="coalesceChosenClass"
    :force-fallback="forceFallback"
    :delay="useApp().isMobile.value ? 100 : 0"
    :sort="sort"
    :clone="clone"
    class="select-none"
    @add="onAdd"
    @end="onEnd"
  >
    <slot />
  </vue-draggable>
</template>

<style>
.sortable-drag {
  opacity: 1 !important;
}
.sortable-ghost {
  opacity: 0.2 !important;
 }
</style>

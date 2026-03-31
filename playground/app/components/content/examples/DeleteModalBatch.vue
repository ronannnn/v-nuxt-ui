<script setup lang="ts">
import { ProDeleteModal } from '#components'

const toast = useToast()

const showDemo = () => {
  const overlay = useOverlay()
  overlay.create(ProDeleteModal, {
    props: {
      ids: [1, 2, 3],
      onDelete: async (_ids: number[]) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        return { data: toRef({ error: null, data: null }) }
      }
    }
  }).open().result.then((ok) => {
    if (ok) {
      toast.add({ title: 'Deleted!', description: `Deleted 3 items`, color: 'success' })
    }
  })
}
</script>

<template>
  <div class="space-y-4">
    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      @click="showDemo"
    >
      删除 3 条数据
    </UButton>
  </div>
</template>

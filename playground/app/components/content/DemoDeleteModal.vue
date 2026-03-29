<script setup lang="ts">
const toast = useToast()

const showDemo = () => {
  const overlay = useOverlay()
  overlay.create(resolveComponent('ProDeleteModal') as any, {
    props: {
      ids: [1, 2, 3],
      onDelete: async (_ids: number[]) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        return { error: null, data: null }
      }
    }
  }).open({}).result.then((ok) => {
    if (ok) {
      toast.add({ title: 'Deleted!', description: `Deleted ${3} items`, color: 'success' })
    }
  })
}
</script>

<template>
  <div class="border border-default rounded-lg p-6 space-y-4">
    <p class="text-sm text-muted">
      Click the button to open the delete confirmation modal:
    </p>

    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      @click="showDemo"
    >
      Delete 3 items
    </UButton>

    <p class="text-xs text-muted">
      The modal shows a warning with item count, and handles the async delete operation with loading state.
    </p>
  </div>
</template>

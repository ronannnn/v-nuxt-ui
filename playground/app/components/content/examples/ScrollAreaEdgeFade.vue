<template>
  <div class="space-y-6">
    <div>
      <p class="text-sm text-muted mb-2">
        Vertical scroll with edge fade effects:
      </p>
      <div class="h-48">
        <ProScrollArea enable-top-transparent enable-bottom-transparent>
          <div class="space-y-3 p-2">
            <div v-for="i in 20" :key="i" class="flex items-center gap-3 p-2 rounded border border-default">
              <UBadge variant="subtle" color="primary">
                {{ i }}
              </UBadge>
              <span class="text-sm">Scrollable item {{ i }}</span>
            </div>
          </div>
        </ProScrollArea>
      </div>
    </div>
    <div>
      <p class="text-sm text-muted mb-2">
        Horizontal scroll with tooltip hint:
      </p>
      <div class="h-24">
        <ProScrollArea enable-left-transparent enable-right-transparent enable-horizontal-tooltip>
          <div class="flex gap-3 p-2 w-max">
            <div v-for="i in 15" :key="i" class="shrink-0 w-32 p-3 rounded border border-default text-center">
              <span class="text-sm">Column {{ i }}</span>
            </div>
          </div>
        </ProScrollArea>
      </div>
    </div>
  </div>
</template>

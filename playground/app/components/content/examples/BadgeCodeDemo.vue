<script setup lang="ts">
const codeJson = ref(JSON.stringify({ name: 'John', age: 30, role: 'admin', permissions: ['read', 'write', 'delete'] }, null, 2))
const codeSql = ref("SELECT u.name, u.email FROM users u WHERE u.status = 'active' ORDER BY u.created_at DESC LIMIT 10;")
</script>

<template>
  <div class="space-y-6">
    <div>
      <h4 class="text-sm font-semibold mb-3">
        ProBadgeCodeModal — Click to view code in a modal
      </h4>
      <div class="flex gap-4 items-center">
        <span class="text-sm text-muted">JSON:</span>
        <ProBadgeCodeModal :data="codeJson" lang="json" title="User Data" />
        <span class="text-sm text-muted">SQL:</span>
        <ProBadgeCodeModal :data="codeSql" lang="sql" title="Query" />
      </div>
    </div>
    <div>
      <h4 class="text-sm font-semibold mb-3">
        ProBadgeCodeTooltip — Hover to preview code
      </h4>
      <div class="flex gap-4 items-center">
        <span class="text-sm text-muted">JSON:</span>
        <ProBadgeCodeTooltip :data="codeJson" lang="json" />
        <span class="text-sm text-muted">Text:</span>
        <ProBadgeCodeTooltip :data="'Hello, this is plain text.\nLine 2 here.'" lang="text" />
      </div>
    </div>
  </div>
</template>

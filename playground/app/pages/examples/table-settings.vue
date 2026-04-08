<script setup lang="ts">
definePageMeta({
  layout: 'examples'
})

const activeTab = ref('sys')
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Table 设置</h1>
    
    <UTabs v-model="activeTab" class="mb-4">
      <UTab value="sys" label="Table 系统配置">
        <ProSysTable />
      </UTab>
      <UTab value="user" label="用户 Table 设置">
        <ProTableSettings />
      </UTab>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import type { Flow, FlowNode } from '#v/types'

definePageMeta({
  layout: 'examples'
})

// 示例初始数据
const flowData = ref<Flow>({
  nodes: [
    { id: 1, name: '开始', x: 100, y: 100, width: 128, height: 40 },
    { id: 2, name: '处理', x: 360, y: 100, width: 128, height: 40 },
    { id: 3, name: '审核', x: 360, y: 260, width: 128, height: 40 },
    { id: 4, name: '结束', x: 620, y: 180, width: 128, height: 40 }
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2', sourceHandle: 'r2', targetHandle: 'l2' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: 'b2', targetHandle: 't2' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: 'r2', targetHandle: 'l2', label: '通过' },
    { id: 'e2-4', source: '2', target: '4', sourceHandle: 'r2', targetHandle: 'l1' }
  ]
})

// 双击节点编辑
const handleEditNode = (node: FlowNode) => {
  console.log('编辑节点:', node)
}
</script>

<template>
  <div class="p-4 w-full flex flex-col">
    <div class="mb-4">
      <h1 class="text-xl font-semibold">
        流程图编辑器
      </h1>
      <p class="text-sm text-muted mt-1">
        拖拽节点、连接节点、调整大小。点击底部工具栏添加节点或修改样式设置。选中节点/连接后按 Delete 删除。
      </p>
    </div>

    <div class="flex-1 w-full border border-default rounded-lg overflow-hidden">
      <ProFlowEditor
        v-model="flowData"
        @edit-node="handleEditNode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Flow, FlowNode } from '#v/types'

definePageMeta({
  layout: 'examples'
})

// 示例初始数据
const flowData = ref<Flow>({
  id: 1,
  nodes: [
    { id: 1, name: '开始', positionX: 100, positionY: 100, width: 120, height: 40 },
    { id: 2, name: '处理', positionX: 360, positionY: 100, width: 120, height: 40 },
    { id: 3, name: '审核', positionX: 360, positionY: 260, width: 120, height: 40 },
    { id: 4, name: '结束', positionX: 620, positionY: 180, width: 120, height: 40 }
  ],
  links: [
    { id: 1, parentId: 1, childId: 2, parentHandlePos: 'r2', childHandlePos: 'l2' },
    { id: 2, parentId: 2, childId: 3, parentHandlePos: 'b2', childHandlePos: 't2' },
    { id: 3, parentId: 3, childId: 4, parentHandlePos: 'r2', childHandlePos: 'l2', label: '通过' },
    { id: 4, parentId: 2, childId: 4, parentHandlePos: 'r2', childHandlePos: 'l1' }
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
      <div class="flex items-center gap-1">
        <ProLayoutButtonCollapse class="-ml-2" />
        <h1 class="text-xl font-semibold">
          流程图编辑器
        </h1>
      </div>
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

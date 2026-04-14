<script setup lang="ts">
import { h, ref } from 'vue'
import { useOverlay } from '@nuxt/ui/composables'
import type { Flow, FlowApi, FlowNode, VColumn } from '#v/types'
import { getCreateAtColumn } from '#v/constants'
import { useFlowApi, useFlowNodeApi, useFlowEdgeApi } from '#v/composables'
import TablePage from '#v/components/table/Page.vue'
import FlowEditor from '#v/components/flow/FlowEditor.client.vue'
import CreateModal from './CreateModal.vue'
import EditNodeModal from './EditNodeModal.vue'

const overlay = useOverlay()
const createModal = overlay.create(CreateModal)
const editNodeModal = overlay.create(EditNodeModal)

const tablePageRef = ref<any>(null)

const columns: VColumn<Flow>[] = [
  {
    accessorKey: 'name',
    header: '流程名称',
    sortOption: true,
    filterOption: {
      type: 'input',
      initHide: false
    }
  },
  {
    accessorKey: 'description',
    header: '流程描述',
    cell: ({ row }) => row.original.description || '—'
  },
  {
    accessorKey: 'nodes',
    header: '节点数',
    cell: ({ row }) => `${row.original.nodes?.length ?? 0}个`
  },
  {
    accessorKey: 'edges',
    header: '连接数',
    cell: ({ row }) => `${row.original.edges?.length ?? 0}个`
  },
  getCreateAtColumn<Flow>()
]

const flowNodeApi = useFlowNodeApi()
const flowEdgeApi = useFlowEdgeApi()
const flowEditorApi: FlowApi = {
  createNode: flowNodeApi.create,
  updateNode: flowNodeApi.update,
  deleteNode: flowNodeApi.deleteById,
  createEdge: flowEdgeApi.create,
  updateEdge: flowEdgeApi.update,
  deleteEdge: flowEdgeApi.deleteById
}

function updateExpandedFlow(row: Flow, updatedFlow: Flow) {
  tablePageRef.value?.updateRow(updatedFlow)
  Object.assign(row, updatedFlow)
}

function updateNodeInFlow(row: Flow, updatedNode: FlowNode) {
  const currentNodes = row.nodes ?? []
  const nodes = currentNodes.map(node => node.id === updatedNode.id ? { ...node, ...updatedNode } : node)
  const updatedFlow = { ...row, nodes }
  updateExpandedFlow(row, updatedFlow)
}

async function handleEditNode(row: Flow, node: FlowNode) {
  await editNodeModal.open({
    model: node,
    onSave: async (newNode: FlowNode) => {
      const { data } = await flowNodeApi.update(newNode)
      if (data.value.data) {
        updateNodeInFlow(row, data.value.data)
      }
    }
  }).result
}

function getExpandVNode(row: Flow) {
  return h('div', {
    class: 'w-full h-150 border border-default rounded bg-default'
  }, [
    h(FlowEditor, {
      'modelValue': row,
      'api': flowEditorApi,
      'showStats': false,
      'onUpdate:modelValue': (updatedModel: Flow) => updateExpandedFlow(row, updatedModel),
      'onEditNode': (node: FlowNode) => handleEditNode(row, node)
    })
  ])
}
</script>

<template>
  <TablePage
    ref="tablePageRef"
    name="sys-flow"
    cn-name="流程列表"
    :use-api-group="useFlowApi"
    :biz-columns="columns"
    expandable
    :expand-v-node="getExpandVNode"
    @edit-row-from-modal="async (row: Flow) => Boolean(await createModal.open({ model: { ...row } }).result)"
  />
</template>

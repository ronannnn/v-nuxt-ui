<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'
import type { VFormFieldProps, Menu, Role } from '#v/types'
import * as z from 'zod'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useFormSubmission, useFormValues, useMenuApi, useRoleApi } from '#v/composables'
import { computed, onMounted, ref, toRef } from 'vue'
import { treeifyOptions } from '#v/utils'

const props = defineProps<{
  model: Role
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Role]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0, disabled: false, isAdmin: false })

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  model => emit('save', model),
  useRoleApi,
  ['menus']
)

// menu related
const menus = ref<Menu[]>([])
const onFetchMenus = async () => {
  const { data } = await useMenuApi().list({
    pagination: { pageNum: 0, pageSize: 0 },
    orderQuery: [
      { field: 'order', order: 'asc' }
    ]
  })
  if (data.value.data) {
    menus.value = data.value.data.list
  }
}
const sourceTreeItems = computed<TreeItem[]>(() => treeifyOptions(
  menus.value,
  () => {},
  'name',
  'id',
  'parentId'
))
const targetTreeItems = computed<TreeItem[]>({
  get() {
    return treeifyOptions(
      (newValues.value.menus || []).sort((a, b) => a.order?.localeCompare(b.order || '') || 0),
      () => {},
      'name',
      'id',
      'parentId'
    )
  },
  set(newVal) {
    const newMenuIds = newVal.map(item => Number(item.value))
    newValues.value.menus = menus.value.filter(menu => newMenuIds.includes(menu.id))
  }
})

function updateTargetTreeItems(newVal: TreeItem[]) {
  targetTreeItems.value = newVal
}

const fields = computed<VFormFieldProps[]>(() => [
  { name: 'name', type: 'input', label: '角色名称', colSpan: '12', zodType: z.string().min(2, '名称字数不足') },
  { name: 'isAdmin', type: 'button-switch', label: '是否是系统角色', colSpan: '12', zodType: z.boolean() },
  {
    name: 'menus',
    label: '菜单权限',
    colSpan: '24',
    zodType: z.array(z.object({ id: z.number() })),
    type: 'tree-select-transfer',
    sourceTreeItems: sourceTreeItems.value,
    targetTreeItems: targetTreeItems.value,
    onUpdateTargetTreeItems: updateTargetTreeItems
  },
  { name: 'disabled', type: 'button-switch', label: '是否禁用', colSpan: '12', zodType: z.boolean() },
  { name: 'remark', type: 'input', label: '备注', colSpan: '24', zodType: z.string().optional().nullable() }
])

function updateModelValue(newVal: Partial<Role>) {
  newValues.value = { id: 0, ...newVal }
}

onMounted(async () => {
  await onFetchMenus()
})
</script>

<template>
  <FormCreateModalTemplate
    title="角色信息"
    :on-close="ok => emit('close', ok)"
    :fields="fields"
    :model-value="newValues"
    @update-model-value="updateModelValue"
    @submit="onSubmit"
  />
</template>

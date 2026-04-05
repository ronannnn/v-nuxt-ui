<script setup lang="ts">
import type { Menu } from 'v-nuxt-ui/types'
import * as z from 'zod'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { useMenuApi, useFormSubmission, useFormValues } from '#v/composables'
import { toRef } from 'vue'
import { menuTypeOptions } from '#v/constants'

const props = defineProps<{
  model: Menu
}>()

const emit = defineEmits<{
  close: [boolean]
  save: [Menu]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0, disabled: false, isAdmin: false })

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  model => emit('save', model),
  useMenuApi,
  ['staticRouteKeys']
)
</script>

<template>
  <FormCreateModalTemplate
    title="菜单信息"
    :on-close="ok => emit('close', ok)"
    :fields="[
      { name: 'name', type: 'input', label: '菜单名称', colSpan: '12', zodType: z.string().min(2, '名称字数不足') },
      { name: 'type', type: 'radio-select', items: menuTypeOptions, orientation: 'horizontal', label: '菜单类型', colSpan: '12', zodType: z.string() },
      {
        name: 'parentId',
        label: '上级菜单',
        colSpan: '12',
        type: 'async-tree-select',
        labelField: 'name',
        valueField: 'id',
        searchFields: ['name'],
        listApi: useMenuApi().list,
        fetchAll: true,
        enableEmptyOption: true,
        initModelValues: newValues.parent,
        onUpdateInitModelValues: newInitModelValues => newValues.parent = newInitModelValues,
        extraQuery: {
          orderQuery: [
            { field: 'order', order: 'asc' }
          ]
        },
        zodType: z.number().min(0)
      },
      { name: 'order', type: 'input', label: '菜单排序', colSpan: '12', zodType: z.string() },
      { name: 'staticRouteKeys', type: 'dynamic-input', label: '菜单静态路由', colSpan: '24', zodType: z.array(z.string()), required: newValues.type !== 'button' },
      { name: 'permission', type: 'input', label: '菜单权限', colSpan: '24', zodType: z.string(), hidden: newValues.type !== 'button' },
      { name: 'disabled', type: 'button-switch', label: '是否禁用', colSpan: '12', zodType: z.boolean() },
      { name: 'isAdmin', type: 'button-switch', label: '是否是系统菜单', colSpan: '12', zodType: z.boolean() }
    ]"
    :model-value="newValues"
    @update-model-value="newVal => newValues = { id: 0, ...newVal }"
    @submit="onSubmit"
  />
</template>

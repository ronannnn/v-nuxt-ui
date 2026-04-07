<script setup lang="ts">
import { useFormValues, useFormSubmission, useUserApi, useRoleApi, useMenuApi, useDepartmentApi } from '#v/composables'
import { treeifyOptions } from '#v/utils'
import type { TreeItem } from '@nuxt/ui'
import type { Menu, Role, User, VFormFieldProps } from '#v/types'
import { toRef, ref, computed, onMounted } from 'vue'
import FormCreateModalTemplate from '#v/components/form/create-modal-template/index.vue'
import { loginTypeOptions, genderOptions, Gender } from '#v/constants'
import * as z from 'zod'

const props = defineProps<{
  model: User
}>()
const emit = defineEmits<{
  close: [boolean]
  save: [User]
}>()

const { oldValues, newValues } = useFormValues(toRef(props.model), { id: 0, needFillWh: false, isAdmin: false })

const { onSubmit } = useFormSubmission(
  toRef(oldValues),
  toRef(newValues),
  close => emit('close', close),
  model => emit('save', model),
  useUserApi,
  ['roles', 'menus']
)

// role related
const roles = ref<Role[]>([])
const onFetchRoles = async () => {
  const { data } = await useRoleApi().list({
    pagination: { pageNum: 0, pageSize: 0 }
  })
  if (data.value.data) {
    roles.value = data.value.data.list
  }
}
const roleSourceTreeItems = computed<TreeItem[]>(() => treeifyOptions(
  roles.value,
  () => {},
  'name',
  'id',
  'parentId' as keyof Role
))
const roleTargetTreeItems = computed<TreeItem[]>({
  get() {
    return treeifyOptions(
      newValues.value.roles || [],
      () => {},
      'name',
      'id',
      'parentId' as keyof Role
    )
  },
  set(newVal) {
    const newRoleIds = newVal.map(item => Number(item.value))
    newValues.value.roles = roles.value.filter(role => newRoleIds.includes(role.id))
  }
})

function updateRoleTargetTreeItems(newVal: TreeItem[]) {
  roleTargetTreeItems.value = newVal
}

// menu related
const menus = ref<Menu[]>([])
const onFetchMenus = async () => {
  const { data } = await useMenuApi().list({
    pagination: { pageNum: 0, pageSize: 0 }
  })
  if (data.value.data) {
    menus.value = data.value.data.list
  }
}
const menusFromRoles = computed<Menu[]>(() => {
  const dupMenusFromRoles = newValues.value.roles?.flatMap(role => role.menus ?? []) ?? []
  return Array.from(new Set(dupMenusFromRoles.map(menu => menu.id))).map(
    id => dupMenusFromRoles.find(menu => menu.id === id)!
  )
})
const menuIdsFromRoles = computed<number[]>(() => menusFromRoles.value.map(menu => menu.id))

const menuSourceTreeItems = computed<TreeItem[]>(() => treeifyOptions(
  menus.value,
  () => {},
  'name',
  'id',
  'parentId',
  0,
  menuIdsFromRoles.value // menu from roles cannot be selected
))
const menuTargetTreeItems = computed({
  get() {
    return treeifyOptions(
      menusFromRoles.value.concat(newValues.value.menus || []),
      () => {},
      'name',
      'id',
      'parentId',
      0,
      menuIdsFromRoles.value // menu from roles cannot be removed
    )
  },
  set(newVal) {
    const newMenuIds = newVal.map(item => Number(item.value))
    newValues.value.menus = menus.value.filter(menu => !menuIdsFromRoles.value.includes(menu.id)).filter(menu => newMenuIds.includes(menu.id))
  }
})

function updateMenuTargetTreeItems(newVal: TreeItem[]) {
  menuTargetTreeItems.value = newVal
}

function updateDepartment(newInitModelValues: any) {
  newValues.value.department = newInitModelValues
}

function updateSupervisor(newInitModelValues: any) {
  newValues.value.supervisor = newInitModelValues
}

const fields = computed<VFormFieldProps[]>(() => [
  { name: 'nickname', type: 'input', label: '名称', colSpan: '12', zodType: z.string().min(2, '名称字数不足') },
  {
    name: 'gender',
    icon: 'i-lucide-venus-and-mars',
    type: 'select',
    label: '性别',
    items: genderOptions,
    colSpan: '12',
    zodType: z.enum(Gender)
  },
  { name: 'username', type: 'input', label: '用户名', colSpan: '12', zodType: z.string().nullable().optional() },
  { name: 'loginType', type: 'multiple-select-string', items: loginTypeOptions, label: '登录方式', colSpan: '12', zodType: z.string() },
  {
    name: 'departmentId',
    label: '部门',
    colSpan: '12',
    type: 'async-tree-select',
    labelField: 'name',
    valueField: 'id',
    searchFields: ['name'],
    listApi: useDepartmentApi().list,
    fetchAll: true,
    initModelValues: newValues.value.department,
    onUpdateInitModelValues: updateDepartment,
    zodType: z.number().min(0)
  },
  {
    name: 'supervisorId',
    label: '直属领导',
    colSpan: '12',
    type: 'async-select',
    labelField: 'nickname',
    valueField: 'id',
    searchFields: ['nickname'],
    listApi: useUserApi().list,
    initModelValues: newValues.value.supervisor,
    onUpdateInitModelValues: updateSupervisor,
    enableEmptyOption: true,
    zodType: z.number().min(0).optional()
  },
  { name: 'email', type: 'input', label: '邮箱', colSpan: '24', zodType: z.string().optional().nullable() },
  { name: 'entryDate', type: 'date-picker', label: '入职时间', colSpan: '12', zodType: z.string().optional().nullable() },
  { name: 'resignDate', type: 'date-picker', label: '离职时间', colSpan: '12', zodType: z.string().optional().nullable() },
  { name: 'needFillWh', type: 'button-switch', label: '是否需要填写工时', colSpan: '12', zodType: z.boolean() },
  { name: 'isAdmin', type: 'button-switch', label: '是否是系统管理员', colSpan: '12', zodType: z.boolean() },
  {
    name: 'roles',
    label: '角色权限',
    colSpan: '24',
    zodType: z.array(z.object({ id: z.number() })).optional(),
    type: 'tree-select-transfer',
    sourceTreeItems: roleSourceTreeItems.value,
    targetTreeItems: roleTargetTreeItems.value,
    onUpdateTargetTreeItems: updateRoleTargetTreeItems
  },
  {
    name: 'menus',
    label: '菜单权限',
    colSpan: '24',
    zodType: z.array(z.object({ id: z.number() })).optional(),
    type: 'tree-select-transfer',
    sourceTreeItems: menuSourceTreeItems.value,
    targetTreeItems: menuTargetTreeItems.value,
    onUpdateTargetTreeItems: updateMenuTargetTreeItems
  }
])

function updateModelValue(newVal: Partial<User>) {
  newValues.value = { id: 0, ...newVal }
}

onMounted(async () => {
  await onFetchRoles()
  await onFetchMenus()
})
</script>

<template>
  <FormCreateModalTemplate
    title="用户信息"
    :on-close="ok => emit('close', ok)"
    :fields="fields"
    :model-value="newValues"
    @update-model-value="updateModelValue"
    @submit="onSubmit"
  />
</template>

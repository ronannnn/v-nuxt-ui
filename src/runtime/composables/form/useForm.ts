import { ref, watch, computed, toValue, type Ref, type MaybeRefOrGetter } from 'vue'
import type { ApiGroup, BaseModel, VFormFieldProps } from '#v/types'
import { defu } from 'defu'
import { getObjWithModifiedFields } from '#v/utils'
import { resolveDisplayValue, smartDiff } from '#v/composables'
import { useToast } from '@nuxt/ui/composables'
import type { ConfirmDiffItem } from '#v/components/form/save-model-template/ConfirmUpdateModal.vue'

export const useFormValues = <T>(
  raw: Ref<T>,
  defaultValues?: Partial<T>
): {
  oldValues: Ref<T>
  newValues: Ref<T>
} => {
  const oldValues = ref<T>({} as T) as Ref<T>
  const newValues = ref<T>({} as T) as Ref<T>
  watch(
    raw,
    (newRaw) => {
      oldValues.value = { ...newRaw }
      if (defaultValues) {
        oldValues.value = defu(oldValues.value as any, defaultValues as any) as T
      }
      newValues.value = JSON.parse(JSON.stringify(oldValues.value))
    },
    { immediate: true }
  )
  return { oldValues, newValues }
}

export const useFormSubmission = <T extends BaseModel>(
  oldValues: Ref<T>,
  newValues: Ref<T>,
  close: (ok: boolean) => void,
  save: (model: T) => void,
  apiGroup: () => ApiGroup<T>,
  arrayTypeFieldKeys: (keyof T)[] = [],
  rowKey: keyof T = 'id',
  versionKey: keyof T = 'version',
  getExtraFields?: () => Record<string, any>
) => {
  const apiFns = apiGroup()
  async function onSubmit() {
    if (oldValues.value[rowKey] === 0) {
      await onCreate()
    } else {
      await onUpdate()
    }
  }
  async function onCreate() {
    const extraFields = getExtraFields ? getExtraFields() : undefined
    const payload = extraFields
      ? { ...apiFns.prune(newValues.value), ...extraFields }
      : apiFns.prune(newValues.value)
    const { data } = await apiFns.create(payload)
    if (!data.value.error) {
      save(data.value.data)
      close(true)
    }
  }
  async function onUpdate() {
    const [objWithModifiedFields, modified] = getObjWithModifiedFields<T>(
      { id: oldValues.value[rowKey] as number, version: oldValues.value[versionKey] as number } as T,
      oldValues.value,
      newValues.value,
      arrayTypeFieldKeys
    )
    if (!modified) {
      useToast().add({
        title: 'Nothing changed',
        description: 'Please modify content before submitting',
        color: 'warning',
        icon: 'i-lucide-triangle-alert'
      })
      return
    }
    const extraFields = getExtraFields ? getExtraFields() : undefined
    const payload = extraFields
      ? { ...apiFns.prune(objWithModifiedFields), ...extraFields }
      : apiFns.prune(objWithModifiedFields)
    const { data } = await apiFns.update(payload)
    if (!data.value.error) {
      save(data.value.data)
      close(true)
    }
  }

  return { onSubmit }
}

export const useConfirmDiff = (
  fields: MaybeRefOrGetter<VFormFieldProps[]>,
  diffItems: MaybeRefOrGetter<ConfirmDiffItem[]>,
  oldModelValue: MaybeRefOrGetter<Record<string, unknown>>,
  newModelValue: MaybeRefOrGetter<Record<string, unknown>>
) => {
  const resolvedItems = computed(() =>
    toValue(diffItems)
      .map(item => ({
        ...item,
        field: toValue(fields).find(f => f.name === item.fieldName)
      }))
      .filter(item => item.field != null)
  )

  const diffedItems = computed(() =>
    resolvedItems.value.map((item) => {
      const oldDisplay = resolveDisplayValue(item.field!, item.oldValue, toValue(oldModelValue))
      const newDisplay = resolveDisplayValue(item.field!, item.newValue, toValue(newModelValue))
      return {
        ...item,
        oldDisplay,
        newDisplay,
        parts: smartDiff(oldDisplay, newDisplay)
      }
    })
  )

  return { diffedItems }
}

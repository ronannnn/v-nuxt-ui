import { ref, watch, type Ref } from 'vue'
import type { ApiGroup, BaseModel } from '#v/types'
import { defu } from 'defu'
import { getObjWithModifiedFields } from '#v/utils'
import { useToast } from '@nuxt/ui/composables'

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

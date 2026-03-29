import { ref, watch, type Ref } from 'vue'
import { useNuxtApp } from '#imports'
import type { ApiGroup } from '../types'
import { defu } from 'defu'
import { getObjWithModifiedFields } from '../utils/diff'

export const useFormValues = <T>(
  raw: Ref<T>,
  defaultValues?: Partial<T>
) => {
  const oldValues = ref<T>({} as T)
  const newValues = ref<T>({} as T)
  watch(
    raw,
    (newRaw) => {
      oldValues.value = { ...newRaw }
      if (defaultValues) {
        oldValues.value = defu(oldValues.value, defaultValues)
      }
      newValues.value = JSON.parse(JSON.stringify(oldValues.value))
    },
    { immediate: true }
  )
  return { oldValues, newValues }
}

export const useFormSubmission = <T extends Model.BaseModel>(
  oldValues: Ref<T>,
  newValues: Ref<T>,
  close: (ok: boolean) => void,
  save: (model: T) => void,
  apiGroup: () => ApiGroup<T>,
  arrayTypeFieldKeys: (keyof T)[] = [],
  rowKey: keyof T = 'id',
  versionKey: keyof T = 'version'
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
    const { data } = await apiFns.create(apiFns.prune(newValues.value))
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
      useNuxtApp().$toastNothingChanged()
      return
    }
    const { data } = await apiFns.update(apiFns.prune(objWithModifiedFields))
    if (!data.value.error) {
      save(data.value.data)
      close(true)
    }
  }

  return { onSubmit }
}

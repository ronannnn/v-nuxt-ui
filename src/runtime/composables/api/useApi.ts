import type { Ref } from 'vue'
import type { ApiGroup, BatchOprCommand, BatchSaveCommand, PageResult, RequestResult, QueryTemplate } from '#v/types'
import { uuid, cloneJson } from '#v/utils'
import { useFetch, useNuxtApp, type UseFetchOptions } from 'nuxt/app'

// 使用了带有auth的$fetch
export async function useApiFetch<T>(
  url: string | (() => string),
  options?: UseFetchOptions<T>
) {
  const result = await useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api as typeof $fetch,
    key: uuid()
  })
  return {
    ...result,
    data: result.data as Ref<RequestResult<T>>
  }
}

// 根据useApiFetch封装
export async function usePostFetch<T>(url: string, data?: any, customOptions: UseFetchOptions<T> = {}) {
  // 不clone的话，会导致data被修改，会出发请求，不知道为啥
  return await useApiFetch<T>(url, { method: 'POST', body: cloneJson(data), ...customOptions })
}
export async function usePutFetch<T>(url: string, data?: any, customOptions: UseFetchOptions<T> = {}) {
  // 不clone的话，会导致data被修改，会出发请求，不知道为啥
  return await useApiFetch<T>(url, { method: 'PUT', body: cloneJson(data), ...customOptions })
}
export async function useGetFetch<T>(url: string, customOptions: UseFetchOptions<T> = {}) {
  return await useApiFetch<T>(url, { method: 'GET', ...customOptions })
}
export async function useDeleteFetch<T>(url: string, customOptions: UseFetchOptions<T> = {}) {
  return await useApiFetch<T>(url, { method: 'DELETE', ...customOptions })
}

// 根据上述方法封装API调用函数
export function useApiCreate<M>(basePath: string) {
  return function (model: M, customOptions: UseFetchOptions<M> = {}) {
    return usePostFetch<M>(basePath, model, customOptions)
  }
}
export function useApiBatchCreate<M>(basePath: string) {
  return function (cmd: BatchSaveCommand<M>, customOptions: UseFetchOptions<M[]> = {}) {
    return usePostFetch<M[]>(`${basePath}/batch`, cmd, customOptions)
  }
}
export function useApiUpdate<M>(basePath: string) {
  return function (model: M, customOptions: UseFetchOptions<M> = {}) {
    return usePutFetch<M>(basePath, model, customOptions)
  }
}
export function useApiBatchUpdate<M>(basePath: string) {
  return function (cmd: BatchSaveCommand<M>, customOptions: UseFetchOptions<M[]> = {}) {
    return usePutFetch<M[]>(`${basePath}/batch`, cmd, customOptions)
  }
}
export function useApiGetById<M>(basePath: string) {
  return function (id: number, customOptions: UseFetchOptions<M> = {}) {
    return useGetFetch<M>(`${basePath}/${id}`, customOptions)
  }
}
export function useApiGetByString<M>(basePath: string) {
  return function (param: string, customOptions: UseFetchOptions<M> = {}) {
    return useGetFetch<M>(`${basePath}/${param}`, customOptions)
  }
}
export function useApiDeleteById(basePath: string) {
  return function (id: number, customOptions: UseFetchOptions<void> = {}) {
    return useDeleteFetch(`${basePath}/${id}`, customOptions)
  }
}
export function useApiBatchDelete(basePath: string) {
  return function (delReq: BatchOprCommand, customOptions: UseFetchOptions<void> = {}) {
    return usePostFetch(`${basePath}/batch-delete`, delReq, customOptions)
  }
}
export function useApiCount<M>(basePath: string) {
  return function (payload: Omit<QueryTemplate<M>, 'selectQuery'>, customOptions: UseFetchOptions<number> = {}) {
    return usePostFetch<number>(`${basePath}/count`, pruneQueryTemplate(payload), customOptions)
  }
}
export function useApiList<M>(basePath: string) {
  return function (payload: Omit<QueryTemplate<M>, 'selectQuery'>, customOptions: UseFetchOptions<PageResult<M>> = {}) {
    return usePostFetch<PageResult<M>>(`${basePath}/list`, pruneQueryTemplate(payload), customOptions)
  }
}
export function useApiCountAndList<M>(basePath: string) {
  return function (payload: Omit<QueryTemplate<M>, 'selectQuery'>, customOptions: UseFetchOptions<PageResult<M>> = {}) {
    return usePostFetch<PageResult<M>>(`${basePath}/countlist`, pruneQueryTemplate(payload), customOptions)
  }
}

export function pruneQueryTemplate<M>(payload: QueryTemplate<M>): QueryTemplate<M> {
  const newPayload = cloneJson(payload)
  newPayload.whereQuery?.items?.forEach((item) => {
    delete item.extraData
  })
  return newPayload
}

// 根据上述方法封装API调用函数
export const useApi = <M>(basePath: string): ApiGroup<M> => {
  return {
    create: useApiCreate<M>(basePath),
    batchCreate: useApiBatchCreate<M>(basePath),
    update: useApiUpdate<M>(basePath),
    batchUpdate: useApiBatchUpdate<M>(basePath),
    getById: useApiGetById<M>(basePath),
    deleteById: useApiDeleteById(basePath),
    batchDelete: useApiBatchDelete(basePath),
    count: useApiCount<M>(basePath),
    list: useApiList<M>(basePath),
    countAndList: useApiCountAndList<M>(basePath),
    prune: (model: M) => model,
    copy: (_model: M) => ({ id: 0 } as M)
  }
}

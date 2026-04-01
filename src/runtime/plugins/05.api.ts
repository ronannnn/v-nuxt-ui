import { useAuth } from '#v/composables'
import type { RequestResult, FailedResult, SuccessResult, FormErrorField } from '#v/types'
import { StorageKey, ErrorCode, noErrorMsgCodes, ShowType } from '#v/types'
import { useToast } from '@nuxt/ui/runtime/composables/useToast.js'
import { useLocalStorage } from '@vueuse/core'
import type { UseFetchOptions } from 'nuxt/app'
import { defineNuxtPlugin, useFetch } from 'nuxt/app'
import { useRoute } from 'vue-router'

function handleRequestResult<T = any>(data: any, error: Error | null | undefined): RequestResult<T> {
  if (error) {
    const fail: FailedResult = {
      error,
      data: null
    }
    return fail
  }
  const success: SuccessResult<T> = {
    error: null,
    data
  }
  return success
}

export default defineNuxtPlugin(() => {
  const toast = useToast()
  const route = useRoute()
  // 1. 创建带拦截器的fetch
  const api = $fetch.create({
    baseURL: '/api/v1',
    onRequest({ options }) {
      // Add Authorization header to the request
      const token = useLocalStorage(StorageKey.ACCESS_TOKEN, '')
      const Authorization = token.value ? `Bearer ${token.value}` : ''
      options.headers.set('Authorization', Authorization)
    },
    onRequestError: async ({ error }) => {
      toast.add({
        title: '请求错误',
        description: error.message,
        color: 'error'
      })
    },
    onResponse: async ({ response, options }) => {
      const { status } = response
      if (status === 200 || status < 300 || status === 304) {
        if (options.responseType === 'blob') {
          response._data = response.blob()
          return
        }

        if (response._data.code === ErrorCode.FIELD_VALIDATION_ERROR_CODE) {
          const errors: FormErrorField[] = response._data.data
          toast.add({
            title: '字段校验错误',
            description: errors.map(err => err.errorMsg).join('\n'),
            color: 'error'
          })
        } else if (noErrorMsgCodes.includes(response._data.code)) {
          console.error(response._data.message)
        } else {
          switch (response._data.showType) {
            case ShowType.Silent:
              break
            case ShowType.SuccessMessage:
              toast.add({
                title: '成功',
                description: response._data.message,
                color: 'success'
              })
              break
            case ShowType.InfoMessage:
              toast.add({
                title: '信息',
                description: response._data.message,
                color: 'info'
              })
              break
            case ShowType.WarnMessage:
              toast.add({
                title: '警告',
                description: response._data.message,
                color: 'warning'
              })
              break
            case ShowType.ErrorMessage:
              toast.add({
                title: '错误',
                description: response._data.message,
                color: 'error'
              })
              break
            case ShowType.SuccessNotification:
              toast.add({
                title: '成功',
                description: response._data.message,
                color: 'success'
              })
              break
            case ShowType.InfoNotification:
              toast.add({
                title: '信息',
                description: response._data.message,
                color: 'info'
              })
              break
            case ShowType.WarnNotification:
              toast.add({
                title: '警告',
                description: response._data.message,
                color: 'warning'
              })
              break
            case ShowType.ErrorNotification:
              toast.add({
                title: '错误',
                description: response._data.message,
                color: 'error'
              })
              break
            default:
              toast.add({
                title: '提示',
                description: response._data.message,
                color: 'info'
              })
          }
        }

        if (response._data.success) {
          response._data = handleRequestResult(response._data.data, null)
          return
        }

        // access token过期，尝试先刷新token，再重试请求
        if (response._data.code === ErrorCode.ACCESS_TOKEN_ERROR_CODE) {
          const newOptions = await useAuth().refreshToken(route, options as unknown as UseFetchOptions<unknown>)
          if (newOptions) {
            const { data: refetchedData } = await useFetch(response.url, newOptions)
            response._data = refetchedData.value
            return
          }
        }

        response._data = handleRequestResult(null, new Error(response._data.message))
      } else if (status === 500) {
        toast.add({
          title: '错误',
          description: '服务器不可用，请稍后重试',
          color: 'error'
        })
        response._data = handleRequestResult(null, new Error(response.statusText))
      } else {
        toast.add({
          title: '错误',
          description: response.statusText,
          color: 'error'
        })
        response._data = handleRequestResult(null, new Error(response.statusText))
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})

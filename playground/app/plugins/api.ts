import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: '/api/v1'
  })

  return {
    provide: {
      api
    }
  }
})

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  nuxtApp.provide('dayjs', dayjs)
})

declare module '#app' {
  interface NuxtApp {
    $dayjs: typeof dayjs
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $dayjs: typeof dayjs
  }
}

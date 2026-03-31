import { useToast } from '@nuxt/ui/composables'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const toast = useToast()
  return {
    provide: {
      defaultToast: (msg: string, desc?: string) => toast.add({
        title: msg,
        description: desc,
        color: 'neutral'
      }),
      primaryToast: (msg: string, desc?: string) => toast.add({
        title: msg,
        description: desc,
        color: 'primary'
      }),
      infoToast: (msg: string, desc?: string) => toast.add({
        title: msg,
        description: desc,
        color: 'info',
        icon: 'i-lucide-circle-alert'
      }),
      successToast: (msg: string, desc?: string) => toast.add({
        title: msg,
        description: desc,
        color: 'success',
        icon: 'i-lucide-circle-check'
      }),
      warningToast: (msg: string, desc?: string) => toast.add({
        title: msg,
        description: desc,
        color: 'warning',
        duration: 5000,
        icon: 'i-lucide-triangle-alert'
      }),
      errorToast: (msg: string, desc?: string) => toast.add({
        title: msg,
        description: desc,
        color: 'error',
        duration: 8000,
        icon: 'i-lucide-circle-x'
      }),
      toastNothingChanged: () => toast.add({
        title: 'Nothing changed',
        description: 'Please modify content before submitting',
        color: 'warning',
        duration: 3000,
        icon: 'i-lucide-triangle-alert'
      })
    }
  }
})

import { useTimeAgo } from '@vueuse/core'

export const useCnTimeAgo = (time: string | Date) => {
  return useTimeAgo(time, {
    messages: {
      justNow: '刚刚',
      past: (n: any) => `${n}前`,
      future: (n: any) => `${n}后`,
      month: n => `${n}个月`,
      year: n => `${n}年`,
      day: n => `${n}天`,
      week: n => `${n}周`,
      hour: n => `${n}小时`,
      minute: n => `${n}分钟`,
      second: n => `${n}秒`,
      invalid: '无效时间'
    },
    updateInterval: 1000 // 每秒更新一次
  })
}

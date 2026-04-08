import { useLocalStorage, createSharedComposable } from '@vueuse/core'
import { defu } from 'defu'
import { useApp } from './useApp'
import { StorageKey } from '#v/types'
import { triggerFileDownloadFromUrl } from '#v/utils'

const _useEChart = () => {
  const app = useApp()

  const rotateXAxisLabel = useLocalStorage<boolean>(StorageKey.ECHART_ROTATE_X_AXIS_LABEL, false)

  const parseCSSVariableColor = (colorStr: string): string => {
    if (!colorStr?.startsWith('var(')) {
      return colorStr
    }

    const varName = colorStr.match(/var\((--[^,)]+)/)?.[1]
    if (!varName) return colorStr

    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return value || colorStr
  }

  // 动态获取颜色值，每次调用时都重新读取 DOM
  const getNormedUiTextColor = () => parseCSSVariableColor('var(--ui-text-muted)')
  const getNormedUiBorderColor = () => parseCSSVariableColor('var(--ui-border)')
  const getNormedRadius = () => Math.round((app.appConfig.value.radius ?? 0.25) * 16)
  const getCommonGridOption = () => ({
    grid: {
      left: '0',
      right: '0',
      bottom: '32',
      top: '20',
      containLabel: true
    }
  })

  const getCommonLegendOption = () => ({
    legend: {
      show: true,
      bottom: '0',
      itemGap: 12,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: getNormedUiTextColor()
      },
      icon: 'circle'
    }
  })

  const getCommonXAxisOption = () => ({
    xAxis: {
      nameTextStyle: {
        color: getNormedUiTextColor()
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: getNormedUiBorderColor()
        }
      },
      axisLabel: {
        color: getNormedUiTextColor(),
        interval: () => true, // 始终显示所有标签,
        hideOverlap: true,
        rotate: rotateXAxisLabel.value ? 90 : 0
      },
      axisTick: {
        show: true,
        interval: () => true, // 始终显示所有刻度线
        lineStyle: {
          color: getNormedUiBorderColor()
        }
      }
    }
  })

  const getCommonYAxisOption = () => ({
    yAxis: {
      nameTextStyle: {
        color: getNormedUiTextColor()
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: getNormedUiBorderColor()
        }
      },
      axisLabel: {
        color: getNormedUiTextColor()
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: getNormedUiBorderColor(),
          type: 'dashed'
        }
      }
    }
  })

  const getCommonBarOption = () => ({
    itemStyle: {
      borderRadius: [getNormedRadius(), getNormedRadius(), 0, 0]
    },
    emphasis: {
      focus: 'series'
    },
    label: {
      distance: 2
    }
  })

  const getCommonBarOptionWithColor = (_idx: number) => {
    return defu(getCommonBarOption(), {
      emphasis: {
        itemStyle: {
        }
      }
    })
  }

  const getCommonLineOption = () => ({
    emphasis: {
      focus: 'series'
    },
    label: {
      distance: 2
    }
  })

  const getCommonLineOptionWithColor = (_idx: number) => {
    return defu(getCommonLineOption(), {
      emphasis: {
        lineStyle: {
        }
      },
      lineStyle: {
      }
    })
  }

  // 获取 chart 的 dataURL（用于预览或自定义下载）
  const getChartDataURL = (chart: any, options: { type?: string, backgroundColor?: string, pixelRatio?: number } = {}) => {
    if (!chart || typeof chart.getDataURL !== 'function') return null
    const { type = 'png', backgroundColor = '', pixelRatio = Math.max(1, window.devicePixelRatio || 1) } = options
    const echartsType = type === 'jpg' ? 'jpeg' : type
    try {
      return chart.getDataURL({ type: echartsType, backgroundColor, pixelRatio })
    } catch (e) {
      console.error('获取 EChart 图表 dataURL 失败：', e)
      return null
    }
  }

  // 触发浏览器下载（也返回 dataURL 以便预览）
  const exportChartAsImage = (chart: any, options: { type?: string, backgroundColor?: string, pixelRatio?: number, filename?: string } = {}) => {
    const { type = 'png', backgroundColor = '', pixelRatio = Math.max(1, window.devicePixelRatio || 1), filename = 'chart' } = options
    const dataURL = getChartDataURL(chart, { type, backgroundColor, pixelRatio })
    if (!dataURL) return
    triggerFileDownloadFromUrl(dataURL, `${filename}.${type}`)
  }

  const mergeSeries = (series: any[]): any[] => {
    if (!series?.length) return []

    // 辅助：获取数值
    const getDataValue = (item: any): number => {
      if (item == null) return 0
      if (typeof item === 'number') return item
      if (Array.isArray(item)) return Number(item[item.length - 1]) || 0
      if (typeof item === 'object') {
        const v = item.value
        return (Array.isArray(v) ? Number(v[v.length - 1]) : Number(v)) || 0
      }
      return Number(item) || 0
    }

    // 1. 收集 stack 信息
    const stackDetails = new Map<string, { indices: number[], maxLen: number }>()
    series.forEach((s, idx) => {
      if (s?.type === 'bar' && s?.stack) {
        if (!stackDetails.has(s.stack)) {
          stackDetails.set(s.stack, { indices: [], maxLen: 0 })
        }
        const group = stackDetails.get(s.stack)!
        group.indices.push(idx)
        const len = Array.isArray(s.data) ? s.data.length : 0
        if (len > group.maxLen) group.maxLen = len
      }
    })

    // 2. 计算每列的 Top Owner
    const stackRadiusOwners = new Map<string, number[]>()
    for (const [stack, { indices, maxLen }] of stackDetails) {
      const owners = new Array(maxLen).fill(-1)
      for (let i = 0; i < maxLen; i++) {
        // 倒序遍历（ECharts 默认后定义的 Series 在堆叠上方）
        for (let j = indices.length - 1; j >= 0; j--) {
          const sIdx = indices[j]!
          const val = getDataValue(series[sIdx]?.data?.[i])
          if (val !== 0) {
            owners[i] = sIdx
            break
          }
        }
      }
      stackRadiusOwners.set(stack, owners)
    }

    const radius = getNormedRadius()
    const radiusStyle = { borderRadius: [radius, radius, 0, 0] }
    const noRadiusStyle = { borderRadius: 0 }

    return series.map((s, idx) => {
      if (!s) return s
      if (s.type === 'line') {
        return defu(s, getCommonLineOptionWithColor(idx))
      }
      if (s.type !== 'bar') return s

      const isStack = !!s.stack
      // Stack 柱状图默认直角，普通柱状图默认圆角
      const baseOption = getCommonBarOptionWithColor(idx)
      if (isStack) {
        baseOption.itemStyle = { ...baseOption.itemStyle, ...noRadiusStyle } as any
      }

      const merged = defu(s, baseOption)

      // Stacked Bar 特殊处理：给 Top Item 加圆角
      if (isStack && Array.isArray(merged.data)) {
        const owners = stackRadiusOwners.get(s.stack)
        if (owners) {
          merged.data = merged.data.map((item: any, i: number) => {
            // 只有作为 Top Owner 时才特殊处理添加圆角
            // 其他情况直接使用 Series 级别的直角配置
            if (i < owners.length && owners[i] === idx) {
              const itemObj = (item !== null && typeof item === 'object' && !Array.isArray(item))
                ? item
                : { value: item }

              return {
                ...itemObj,
                itemStyle: { ...(itemObj.itemStyle), ...radiusStyle }
              }
            }
            return item
          })
        }
      }

      return merged
    })
  }

  const mergeOption = (option: any): any => {
    // 每次调用时获取最新的配置
    const commonOption = defu(getCommonGridOption(), getCommonLegendOption(), getCommonXAxisOption(), getCommonYAxisOption())
    const merged = defu(option, commonOption)

    // 如果用户传入的 yAxis 是数组，需要为每个元素合并默认配置
    if (merged.yAxis && Array.isArray(merged.yAxis) && merged.yAxis.length > 1) {
      const yAxisDefaults = getCommonYAxisOption().yAxis
      merged.yAxis = merged.yAxis.map((axis: any) => defu(axis, yAxisDefaults))
    }

    // 为 series 添加额外公共属性
    if (merged.series && Array.isArray(merged.series)) {
      merged.series = mergeSeries(merged.series)
    }

    return merged
  }

  return {
    getCommonGridOption,
    getCommonLegendOption,
    getCommonXAxisOption,
    getCommonYAxisOption,
    getCommonBarOption,
    getCommonLineOption,
    mergeSeries,
    mergeOption,
    parseCSSVariableColor,
    exportChartAsImage
  }
}

export const useEChart = createSharedComposable(_useEChart)

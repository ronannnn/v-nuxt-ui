import { createSharedComposable } from '@vueuse/core'
import { defu } from 'defu'
import { useApp } from './useApp'
import { useTheme } from './useTheme'
import { triggerFileDownloadFromUrl } from '../utils/download/tagA'

const _useEChart = () => {
  const app = useApp()
  const theme = useTheme()

  const parseCSSVariableColor = (colorStr: string): string => {
    if (!colorStr?.startsWith('var(')) return colorStr
    const varName = colorStr.match(/var\((--[^,)]+)/)?.[1]
    if (!varName) return colorStr
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
    return value || colorStr
  }

  const getNormedUiTextColor = () => parseCSSVariableColor('var(--ui-text-muted)')
  const getNormedUiBorderColor = () => parseCSSVariableColor('var(--ui-border)')
  const getNormedRadius = () => Math.round((app.appConfig.value.radius ?? 0.25) * 16)
  const getNormedChartColors = () => theme.chartColorVars.value.map((colorVar: string) => parseCSSVariableColor(colorVar))

  const getCommonGridOption = () => ({
    grid: { left: '0', right: '0', bottom: '32', top: '20', containLabel: true }
  })

  const getCommonLegendOption = () => ({
    legend: {
      show: true, bottom: '0', itemGap: 12, itemWidth: 12, itemHeight: 12,
      textStyle: { color: getNormedUiTextColor() }, icon: 'circle'
    }
  })

  const getCommonXAxisOption = () => ({
    color: getNormedChartColors(),
    xAxis: {
      nameTextStyle: { color: getNormedUiTextColor() },
      axisLine: { show: true, lineStyle: { color: getNormedUiBorderColor() } },
      axisLabel: { color: getNormedUiTextColor(), interval: () => true, hideOverlap: true },
      axisTick: { show: true, interval: () => true, lineStyle: { color: getNormedUiBorderColor() } }
    }
  })

  const getCommonYAxisOption = () => ({
    yAxis: {
      nameTextStyle: { color: getNormedUiTextColor() },
      axisLine: { show: true, lineStyle: { color: getNormedUiBorderColor() } },
      axisLabel: { color: getNormedUiTextColor() },
      splitLine: { show: false, lineStyle: { color: getNormedUiBorderColor(), type: 'dashed' } }
    }
  })

  const getCommonBarOption = () => ({
    itemStyle: { borderRadius: [getNormedRadius(), getNormedRadius(), 0, 0] },
    emphasis: { focus: 'series' },
    label: { color: getNormedUiTextColor(), distance: 2 }
  })

  const getCommonBarOptionWithColor = (idx: number) => {
    const colors = getNormedChartColors()
    return defu(getCommonBarOption(), { emphasis: { itemStyle: { color: colors[idx] } } })
  }

  const getCommonLineOption = () => ({
    emphasis: { focus: 'series' },
    label: { color: getNormedUiTextColor(), distance: 2 }
  })

  const getCommonLineOptionWithColor = (idx: number) => {
    const colors = getNormedChartColors()
    return defu(getCommonLineOption(), {
      emphasis: { lineStyle: { color: colors[idx] } },
      lineStyle: { color: colors[idx] }
    })
  }

  const getChartDataURL = (chart: any, options: { type?: string, backgroundColor?: string, pixelRatio?: number } = {}) => {
    if (!chart || typeof chart.getDataURL !== 'function') return null
    const { type = 'png', backgroundColor = '', pixelRatio = Math.max(1, window.devicePixelRatio || 1) } = options
    const echartsType = type === 'jpg' ? 'jpeg' : type
    try { return chart.getDataURL({ type: echartsType, backgroundColor, pixelRatio }) }
    catch (e) { console.error('Failed to get EChart dataURL:', e); return null }
  }

  const exportChartAsImage = (chart: any, options: { type?: string, backgroundColor?: string, pixelRatio?: number, filename?: string } = {}) => {
    const { type = 'png', backgroundColor = '', pixelRatio = Math.max(1, window.devicePixelRatio || 1), filename = 'chart' } = options
    const dataURL = getChartDataURL(chart, { type, backgroundColor, pixelRatio })
    if (!dataURL) return
    triggerFileDownloadFromUrl(dataURL, `${filename}.${type}`)
  }

  const mergeSeries = (series: any[]): any[] => {
    return series.map((s: any, seriesIndex: number) => {
      if (s?.type === 'bar') return defu(s, getCommonBarOptionWithColor(seriesIndex))
      if (s?.type === 'line') return defu(s, getCommonLineOptionWithColor(seriesIndex))
      return s
    })
  }

  const mergeOption = (option: any): any => {
    const commonOption = defu(getCommonGridOption(), getCommonLegendOption(), getCommonXAxisOption(), getCommonYAxisOption())
    const merged = defu(option, commonOption)
    if (merged.yAxis && Array.isArray(merged.yAxis) && merged.yAxis.length > 1) {
      const yAxisDefaults = getCommonYAxisOption().yAxis
      merged.yAxis = merged.yAxis.map((axis: any) => defu(axis, yAxisDefaults))
    }
    if (merged.series && Array.isArray(merged.series)) {
      merged.series = mergeSeries(merged.series)
    }
    return merged
  }

  return {
    getCommonGridOption, getCommonLegendOption, getCommonXAxisOption, getCommonYAxisOption,
    getCommonBarOption, getCommonLineOption, mergeSeries, mergeOption,
    parseCSSVariableColor, exportChartAsImage
  }
}

export const useEChart = createSharedComposable(_useEChart)

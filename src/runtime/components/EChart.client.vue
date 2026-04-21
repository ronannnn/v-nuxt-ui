<script setup lang="ts">
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  RadarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme, useApp, useEChart } from '#v/composables'
import { useColorMode, useLocalStorage } from '@vueuse/core'
import { ref, useTemplateRef, watch } from 'vue'
import { StorageKey } from '#v/types'

interface Props {
  option: any
  useBar?: boolean
  usePie?: boolean
  useLine?: boolean
  useGrid?: boolean
  useRadar?: boolean
  enableXAxis?: boolean
  enableYAxis?: boolean
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  useBar: false,
  usePie: false,
  useLine: false,
  useGrid: false,
  enableXAxis: true,
  enableYAxis: true,
  colors: () => []
})

// 构建动态组件数组
const chartsToUse: any[] = [CanvasRenderer]
const componentsToUse: any[] = [
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  LegendComponent
]

if (props.useGrid) {
  componentsToUse.push(GridComponent)
}
if (props.useRadar) {
  componentsToUse.push(RadarComponent)
}

if (props.useBar) {
  chartsToUse.push(BarChart)
}
if (props.usePie) {
  chartsToUse.push(PieChart)
}
if (props.useLine) {
  chartsToUse.push(LineChart)
}
if (props.useRadar) {
  chartsToUse.push(RadarChart)
}

use([...chartsToUse, ...componentsToUse])

const theme = useTheme()
const colorMode = useColorMode()
const app = useApp()
const echart = useEChart()

const rotateXAxisLabel = useLocalStorage<boolean>(StorageKey.ECHART_ROTATE_X_AXIS_LABEL, false)

// 合并颜色配置到 option
const finalOption = ref({})

const updateOption = () => {
  finalOption.value = echart.mergeOption(props.option, {
    enableXAxis: props.enableXAxis,
    enableYAxis: props.enableYAxis
  })
}

const devicePixelRatio = window.devicePixelRatio || 1
const chartRef = useTemplateRef('v-chart')

// 监听所有依赖变化
watch(
  [
    () => props.option, colorMode,
    () => props.enableXAxis,
    () => props.enableYAxis,
    () => theme.primary.value,
    () => theme.neutral.value,
    () => app.appConfig.value.radius,
    () => rotateXAxisLabel.value
  ],
  () => setTimeout(() => {
    updateOption() // TODO: 通过更好的方式实现
  }, 1),
  { immediate: true, deep: true }
)

defineExpose({
  downloadImage: (filenamePrefix?: string) => {
    if (!chartRef.value) return
    echart.exportChartAsImage(chartRef.value, { filename: filenamePrefix })
  }
})
</script>

<template>
  <v-chart
    ref="v-chart"
    :option="finalOption"
    :init-options="{ devicePixelRatio }"
    autoresize
  />
</template>

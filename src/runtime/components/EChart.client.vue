<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { useTheme } from '#v/composables/useTheme'
import { useApp } from '#v/composables/useApp'
import { useEChart } from '#v/composables/useEChart'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useColorMode } from '@vueuse/core'

interface Props {
  option: any
  useBar?: boolean
  usePie?: boolean
  useLine?: boolean
  useGrid?: boolean
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  useBar: false,
  usePie: false,
  useLine: false,
  useGrid: false,
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

if (props.useBar) {
  chartsToUse.push(BarChart)
}
if (props.usePie) {
  chartsToUse.push(PieChart)
}
if (props.useLine) {
  chartsToUse.push(LineChart)
}

use([...chartsToUse, ...componentsToUse])

const theme = useTheme()
const colorMode = useColorMode()
const app = useApp()
const echart = useEChart()

// 合并颜色配置到 option
const finalOption = ref({})

const updateOption = () => {
  finalOption.value = echart.mergeOption(props.option)
}

const chartRef = useTemplateRef('v-chart')

// 监听所有依赖变化
watch(
  [() => props.option, colorMode, () => theme.primary.value, () => theme.neutral.value, () => app.appConfig.value.radius],
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
  <v-chart ref="v-chart" :option="finalOption" autoresize />
</template>

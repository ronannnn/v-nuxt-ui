<script setup lang="ts">
definePageMeta({
  layout: 'examples'
})

const monthlySalesOption = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['签约额', '回款额']
  },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月']
  },
  yAxis: {
    type: 'value',
    name: '万元'
  },
  series: [
    {
      name: '签约额',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110]
    },
    {
      name: '回款额',
      type: 'bar',
      data: [90, 160, 130, 60, 55, 98]
    }
  ]
}

const trendOption = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['访问量', '转化量']
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [820, 932, 901, 934, 1290, 1330, 1220],
      areaStyle: {
        opacity: 0.12
      }
    },
    {
      name: '转化量',
      type: 'line',
      smooth: true,
      data: [120, 132, 141, 154, 190, 210, 198]
    }
  ]
}

const radarOption = {
  tooltip: {},
  legend: {
    data: ['当前团队', '目标团队']
  },
  radar: {
    indicator: [
      { name: '执行效率', max: 100 },
      { name: '交付质量', max: 100 },
      { name: '沟通协作', max: 100 },
      { name: '稳定性', max: 100 },
      { name: '创新能力', max: 100 },
      { name: '响应速度', max: 100 }
    ]
  },
  series: [
    {
      name: '能力评估',
      type: 'radar',
      data: [
        {
          value: [78, 85, 72, 88, 69, 91],
          name: '当前团队'
        },
        {
          value: [90, 92, 86, 93, 82, 95],
          name: '目标团队'
        }
      ]
    }
  ]
}

const mixedOption = {
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['新增客户', '跟进次数', '成交率']
  },
  xAxis: {
    type: 'category',
    data: ['Q1', 'Q2', 'Q3', 'Q4']
  },
  yAxis: [
    {
      type: 'value',
      name: '数量'
    },
    {
      type: 'value',
      name: '百分比',
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
  series: [
    {
      name: '新增客户',
      type: 'bar',
      data: [48, 62, 75, 89]
    },
    {
      name: '跟进次数',
      type: 'bar',
      data: [180, 210, 246, 280]
    },
    {
      name: '成交率',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      data: [18, 24, 29, 35]
    }
  ]
}

const pieOption = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    right: 0,
    top: 'center'
  },
  series: [
    {
      name: '工单来源',
      type: 'pie',
      radius: ['44%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: {
        formatter: '{b}\n{d}%'
      },
      data: [
        { value: 1048, name: '系统告警' },
        { value: 735, name: '人工上报' },
        { value: 580, name: '接口同步' },
        { value: 484, name: '巡检发现' }
      ]
    }
  ]
}

const chartCards = [
  {
    title: '柱状图',
    description: '适合展示分类对比、月度指标和分组统计。',
    badge: 'Bar',
    option: monthlySalesOption,
    props: {
      useBar: true,
      useGrid: true
    }
  },
  {
    title: '折线图',
    description: '适合展示趋势变化、转化路径和连续时间序列。',
    badge: 'Line',
    option: trendOption,
    props: {
      useLine: true,
      useGrid: true
    }
  },
  {
    title: '雷达图',
    description: '适合展示多维度能力评估、评分对比。',
    badge: 'Radar',
    option: radarOption,
    props: {
      useRadar: true
    }
  },
  {
    title: '组合图',
    description: '柱状图与折线图组合，适合展示业务量和转化率。',
    badge: 'Mixed',
    option: mixedOption,
    props: {
      useBar: true,
      useLine: true,
      useGrid: true
    }
  },
  {
    title: '环形图',
    description: '适合展示构成占比、来源分布和结构性信息。',
    badge: 'Pie',
    option: pieOption,
    props: {
      usePie: true
    }
  }
] as const
</script>

<template>
  <div class="size-full overflow-auto">
    <div class="p-6 grid grid-cols-24 gap-6">
      <UCard
        v-for="card in chartCards"
        :key="card.title"
        :ui="{
          root: 'col-span-24 lg:col-span-12'
        }"
      >
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="text-lg font-semibold text-highlighted">
                {{ card.title }}
              </div>
              <p class="text-sm leading-6 text-toned">
                {{ card.description }}
              </p>
            </div>

            <UBadge
              color="neutral"
              variant="subtle"
              class="rounded-full px-3 py-1"
            >
              {{ card.badge }}
            </UBadge>
          </div>
        </template>

        <div class="h-90">
          <ProEChart
            :option="card.option"
            class="size-full"
            v-bind="card.props"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>

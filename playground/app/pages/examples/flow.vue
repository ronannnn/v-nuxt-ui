<script setup lang="ts">
import type { Flow, FlowNode } from '#v/types'

definePageMeta({
  layout: 'examples'
})

// Mock API
const flowApi = useFlowMockApi()

// 风险等级类型
type RiskLevel = 'high' | 'medium' | 'low' | 'none'

// 各阶段风险预警数据
interface RiskNodeMeta {
  /** 阶段名称 */
  label: string
  /** 阶段编号 */
  code: string
  /** 负责部门 */
  department: string
  /** 阶段状态 */
  status: '已完成' | '进行中' | '待开始' | '预警中'
  /** 风险等级 */
  riskLevel: RiskLevel
  /** 风险预警指标数量 */
  indicatorCount: number
  /** 当前预警数量 */
  warningCount: number
  /** 已处理预警 */
  resolvedCount: number
  /** 预计完成天数 */
  estimatedDays: number
  /** 已耗天数 */
  elapsedDays: number
  /** 涉及金额（万元） */
  amount: number
  /** 关键指标列表 */
  indicators: string[]
}

const riskData = reactive<Record<number, RiskNodeMeta>>({
  1: {
    label: '项目立项',
    code: 'FA-01',
    department: '资产管理部',
    status: '已完成',
    riskLevel: 'low',
    indicatorCount: 6,
    warningCount: 1,
    resolvedCount: 1,
    estimatedDays: 15,
    elapsedDays: 14,
    amount: 2800,
    indicators: ['立项审批时效', '预算合理性', '需求论证充分性', '重复采购检查', '预算额度校验', '审批流程合规']
  },
  2: {
    label: '可行性分析',
    code: 'FA-02',
    department: '技术评估中心',
    status: '已完成',
    riskLevel: 'medium',
    indicatorCount: 8,
    warningCount: 3,
    resolvedCount: 2,
    estimatedDays: 20,
    elapsedDays: 22,
    amount: 2800,
    indicators: ['技术方案可行性', '投资回报率', '市场调研完整性', '风险评估覆盖率', '替代方案分析', '成本效益分析', '环境影响评估', '资质要求匹配度']
  },
  3: {
    label: '招投标',
    code: 'FA-03',
    department: '采购管理部',
    status: '预警中',
    riskLevel: 'high',
    indicatorCount: 10,
    warningCount: 5,
    resolvedCount: 1,
    estimatedDays: 30,
    elapsedDays: 28,
    amount: 2650,
    indicators: ['投标人资质审查', '围标串标检测', '报价偏离度', '评标专家合规性', '招标文件完整性', '开标程序合规', '中标价格合理性', '供应商信用评估', '保证金管理', '公告发布合规']
  },
  4: {
    label: '合同签订',
    code: 'FA-04',
    department: '法务合规部',
    status: '进行中',
    riskLevel: 'medium',
    indicatorCount: 9,
    warningCount: 2,
    resolvedCount: 0,
    estimatedDays: 10,
    elapsedDays: 6,
    amount: 2650,
    indicators: ['合同条款合规性', '付款条件合理性', '违约责任明确性', '质保条款完整性', '知识产权约定', '验收标准明确性', '变更条款约定', '保密协议', '争议解决机制']
  },
  5: {
    label: '到货验收',
    code: 'FA-05',
    department: '质量检验部',
    status: '待开始',
    riskLevel: 'none',
    indicatorCount: 7,
    warningCount: 0,
    resolvedCount: 0,
    estimatedDays: 15,
    elapsedDays: 0,
    amount: 2650,
    indicators: ['到货及时性', '数量清点准确性', '质量检测达标率', '规格参数符合度', '包装完整性', '随附文件齐全性', '安装调试合格率']
  },
  6: {
    label: '资产入账',
    code: 'FA-06',
    department: '财务管理部',
    status: '待开始',
    riskLevel: 'none',
    indicatorCount: 6,
    warningCount: 0,
    resolvedCount: 0,
    estimatedDays: 5,
    elapsedDays: 0,
    amount: 2650,
    indicators: ['入账及时性', '资产分类准确性', '折旧方案合理性', '资产标签管理', '台账登记完整性', '权属登记合规']
  },
  7: {
    label: '付款结算',
    code: 'FA-07',
    department: '财务管理部',
    status: '待开始',
    riskLevel: 'none',
    indicatorCount: 8,
    warningCount: 0,
    resolvedCount: 0,
    estimatedDays: 10,
    elapsedDays: 0,
    amount: 2650,
    indicators: ['付款审批合规性', '发票校验', '付款进度监控', '预算执行率', '付款金额核对', '尾款支付条件', '质保金预留', '税务合规性']
  }
})

// 风险等级颜色映射
const riskLevelConfig: Record<RiskLevel, { color: string, bg: string, text: string, label: string }> = {
  high: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', text: '高风险', label: 'error' },
  medium: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', text: '中风险', label: 'warning' },
  low: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: '低风险', label: 'success' },
  none: { color: 'text-neutral-400 dark:text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-900/40', text: '无风险', label: 'neutral' }
}

// 状态颜色映射
const statusConfig: Record<string, { icon: string, color: string }> = {
  已完成: { icon: 'i-lucide-circle-check-big', color: 'text-emerald-500' },
  进行中: { icon: 'i-lucide-loader', color: 'text-blue-500' },
  待开始: { icon: 'i-lucide-circle-dashed', color: 'text-neutral-400' },
  预警中: { icon: 'i-lucide-triangle-alert', color: 'text-red-500' }
}

// 获取风险等级的 Badge 颜色
function getBadgeColor(level: RiskLevel): 'error' | 'warning' | 'success' | 'neutral' {
  const map: Record<RiskLevel, 'error' | 'warning' | 'success' | 'neutral'> = {
    high: 'error',
    medium: 'warning',
    low: 'success',
    none: 'neutral'
  }
  return map[level]
}

// 流程图数据
const flowData = ref<Flow>({
  id: 1,
  nodes: [
    // 第一行：立项 -> 可行性分析 -> 招投标
    { id: 1, name: '项目立项', positionX: 60, positionY: 80, width: 280, height: 220 },
    { id: 2, name: '可行性分析', positionX: 420, positionY: 80, width: 280, height: 220 },
    { id: 3, name: '招投标', positionX: 780, positionY: 80, width: 280, height: 220 },
    // 第二行：付款 <- 资产入账 <- 验收 <- 合同签订
    { id: 4, name: '合同签订', positionX: 780, positionY: 380, width: 280, height: 220 },
    { id: 5, name: '到货验收', positionX: 420, positionY: 380, width: 280, height: 220 },
    { id: 6, name: '资产入账', positionX: 60, positionY: 380, width: 280, height: 220 },
    // 第三行：付款结算
    { id: 7, name: '付款结算', positionX: 60, positionY: 680, width: 280, height: 220 }
  ],
  edges: [
    // 第一行从左到右
    { id: 1, sourceNodeId: 1, targetNodeId: 2, sourceNodeHandlePos: 'r2', targetNodeHandlePos: 'l2', label: '立项批复' },
    { id: 2, sourceNodeId: 2, targetNodeId: 3, sourceNodeHandlePos: 'r2', targetNodeHandlePos: 'l2', label: '可行性报告' },
    // 从第一行右侧转到第二行右侧
    { id: 3, sourceNodeId: 3, targetNodeId: 4, sourceNodeHandlePos: 'b2', targetNodeHandlePos: 't2', label: '中标通知' },
    // 第二行从右到左
    { id: 4, sourceNodeId: 4, targetNodeId: 5, sourceNodeHandlePos: 'l2', targetNodeHandlePos: 'r2', label: '合同签署' },
    { id: 5, sourceNodeId: 5, targetNodeId: 6, sourceNodeHandlePos: 'l2', targetNodeHandlePos: 'r2', label: '验收合格' },
    // 从第二行左侧转到第三行
    { id: 6, sourceNodeId: 6, targetNodeId: 7, sourceNodeHandlePos: 'b2', targetNodeHandlePos: 't2', label: '入账完成' }
  ]
})

// 双击节点编辑
const handleEditNode = (node: FlowNode) => {
  const meta = riskData[node.id]
  if (meta) {
    console.log('编辑节点:', meta.label, meta)
  }
}

// 统计汇总
const summary = computed(() => {
  const values = Object.values(riskData)
  return {
    totalIndicators: values.reduce((s, n) => s + n.indicatorCount, 0),
    totalWarnings: values.reduce((s, n) => s + n.warningCount, 0),
    totalResolved: values.reduce((s, n) => s + n.resolvedCount, 0),
    highRiskCount: values.filter(n => n.riskLevel === 'high').length,
    mediumRiskCount: values.filter(n => n.riskLevel === 'medium').length
  }
})
</script>

<template>
  <div class="p-4 w-full flex flex-col overflow-auto">
    <div class="mb-4">
      <div class="flex items-center gap-1">
        <ProLayoutButtonCollapse class="-ml-2" />
        <h1 class="text-xl font-semibold">
          固定资产风险预警流程图
        </h1>
      </div>
      <p class="text-sm text-muted mt-1">
        全流程覆盖固定资产从立项到付款的风险预警管控，实时监测各阶段风险指标状态。
      </p>

      <!-- 统计卡片 -->
      <div class="flex items-center gap-4 mt-3 flex-wrap">
        <div class="flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-gauge" class="text-blue-500 size-4" />
          <span class="text-muted">预警指标总数</span>
          <span class="font-semibold">{{ summary.totalIndicators }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-triangle-alert" class="text-red-500 size-4" />
          <span class="text-muted">当前预警</span>
          <span class="font-semibold text-red-600 dark:text-red-400">{{ summary.totalWarnings }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-circle-check-big" class="text-emerald-500 size-4" />
          <span class="text-muted">已处理</span>
          <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ summary.totalResolved }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-flame" class="text-red-500 size-4" />
          <span class="text-muted">高风险阶段</span>
          <span class="font-semibold text-red-600 dark:text-red-400">{{ summary.highRiskCount }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-alert-circle" class="text-amber-500 size-4" />
          <span class="text-muted">中风险阶段</span>
          <span class="font-semibold text-amber-600 dark:text-amber-400">{{ summary.mediumRiskCount }}</span>
        </div>
      </div>
    </div>

    <div class="h-250 w-full rounded-lg shrink-0">
      <ProFlowEditor
        v-model="flowData"
        :api="flowApi"
        fit-view
        :editable="false"
        :draggable="false"
        :zoomable="false"
        :show-background="false"
        :show-stats="false"
        @edit-node="handleEditNode"
      >
        <template #node="{ data }">
          <div
            v-if="riskData[data.id]"
            class="size-full flex flex-col px-3 py-2.5 text-xs select-none overflow-hidden rounded-lg bg-default border border-default"
          >
            <!-- 顶部：阶段名 + 编号 + 风险等级 -->
            <div class="flex items-center justify-between gap-1 mb-1.5 shrink-0">
              <div class="flex items-center gap-1.5 min-w-0">
                <UIcon
                  :name="statusConfig[riskData[data.id]!.status]!.icon"
                  class="size-3.5 shrink-0"
                  :class="statusConfig[riskData[data.id]!.status]!.color"
                />
                <span class="font-semibold text-sm truncate">{{ riskData[data.id]!.label }}</span>
                <span class="text-muted text-[10px]">{{ riskData[data.id]!.code }}</span>
              </div>
              <UBadge
                :color="getBadgeColor(riskData[data.id]!.riskLevel)"
                variant="subtle"
                size="xs"
                class="shrink-0"
              >
                {{ riskLevelConfig[riskData[data.id]!.riskLevel].text }}
              </UBadge>
            </div>

            <!-- 负责部门 + 状态 -->
            <div class="flex items-center justify-between text-[11px] text-muted mb-2 shrink-0">
              <div class="flex items-center gap-1">
                <UIcon name="i-lucide-building-2" class="size-3" />
                <span>{{ riskData[data.id]!.department }}</span>
              </div>
              <span
                class="font-medium"
                :class="statusConfig[riskData[data.id]!.status]!.color"
              >
                {{ riskData[data.id]!.status }}
              </span>
            </div>

            <!-- 核心指标网格 -->
            <div class="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 shrink-0">
              <!-- 预警指标数 -->
              <div class="flex items-center justify-between">
                <span class="text-muted text-[10px]">预警指标</span>
                <span class="font-semibold text-[11px]">{{ riskData[data.id]!.indicatorCount }} 项</span>
              </div>
              <!-- 当前预警 -->
              <div class="flex items-center justify-between">
                <span class="text-muted text-[10px]">当前预警</span>
                <span
                  class="font-semibold text-[11px]"
                  :class="riskData[data.id]!.warningCount > 0 ? 'text-red-600 dark:text-red-400' : ''"
                >
                  {{ riskData[data.id]!.warningCount }} 条
                </span>
              </div>
              <!-- 已处理 -->
              <div class="flex items-center justify-between">
                <span class="text-muted text-[10px]">已处理</span>
                <span class="font-semibold text-[11px] text-emerald-600 dark:text-emerald-400">
                  {{ riskData[data.id]!.resolvedCount }} 条
                </span>
              </div>
              <!-- 涉及金额 -->
              <div class="flex items-center justify-between">
                <span class="text-muted text-[10px]">涉及金额</span>
                <span class="font-semibold text-[11px]">{{ riskData[data.id]!.amount }} 万</span>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="mb-1.5 shrink-0">
              <div class="flex items-center justify-between text-[10px] mb-0.5">
                <span class="text-muted">时间进度</span>
                <span class="text-muted">
                  {{ riskData[data.id]!.elapsedDays }}/{{ riskData[data.id]!.estimatedDays }} 天
                </span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="[
                    riskData[data.id]!.elapsedDays > riskData[data.id]!.estimatedDays
                      ? 'bg-red-500'
                      : riskData[data.id]!.elapsedDays / riskData[data.id]!.estimatedDays > 0.8
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                  ]"
                  :style="{
                    width: `${Math.min(100, (riskData[data.id]!.elapsedDays / riskData[data.id]!.estimatedDays) * 100)}%`
                  }"
                />
              </div>
            </div>

            <!-- 底部关键指标标签 -->
            <div class="flex flex-wrap gap-0.5 mt-auto overflow-hidden">
              <span
                v-for="(indicator, idx) in riskData[data.id]!.indicators.slice(0, 4)"
                :key="idx"
                class="inline-flex items-center px-1 py-0.5 rounded text-[9px] bg-neutral-100 dark:bg-neutral-800 text-muted truncate max-w-15"
                :title="indicator"
              >
                {{ indicator }}
              </span>
              <span
                v-if="riskData[data.id]!.indicators.length > 4"
                class="inline-flex items-center px-1 py-0.5 rounded text-[9px] bg-neutral-100 dark:bg-neutral-800 text-muted"
              >
                +{{ riskData[data.id]!.indicators.length - 4 }}
              </span>
            </div>
          </div>

          <!-- 没有风险数据的节点回退默认显示 -->
          <span v-else class="font-medium">{{ data.name }}</span>
        </template>
      </ProFlowEditor>
    </div>
  </div>
</template>

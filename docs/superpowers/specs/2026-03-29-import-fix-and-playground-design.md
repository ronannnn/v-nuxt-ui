# v-nuxt-ui：Import 修复 + Playground 组件文档系统设计

## 背景

v-nuxt-ui 是从 veloom 项目提取的企业级 Nuxt UI 组件库（Nuxt Module），包含 66 个组件、20 个 composables、11 个 utils。当前存在两个问题：

1. **src import 缺失**：组件库从有 auto-import 的 Nuxt 项目复制而来，composables/utils 之间缺少显式 import，导致 TypeScript 报错
2. **Playground 组件展示不完整**：现有文档系统基于 Nuxt Content MDC，但缺少 Nuxt UI 官网风格的交互式代码展示

## 范围

两个独立阶段，按顺序执行：

- **阶段一**：修复 src 的 import 问题，确保库可被消费者正常使用
- **阶段二**：完善 playground 组件文档系统，实现交互式 prop 控制 + 场景示例展示

---

## 阶段一：修复 src Import 问题

### 问题分析

组件库内部文件引用了以下几类未导入的标识符：

| 类别 | 示例 | 来源 |
|------|------|------|
| Nuxt 运行时 API | `useAppConfig`, `useColorMode`, `useRoute`, `navigateTo` | `#imports` |
| Vue API | `ref`, `computed`, `watch`, `defineProps` | `vue` |
| 库内部 composables | `useApp`, `useBoolean`, `useTable` | `#v/composables/*` |
| 库内部 utils | `formatDate`, `downloadByTagA` | `#v/utils/*` |
| 库内部 types | `TableColumn`, `FormField` | `#v/types/*` |
| 第三方库 | `createSharedComposable` | `@vueuse/core` |

### 修复策略

1. **库内部文件之间**：使用 `#v/*` 路径别名进行显式 import
2. **Nuxt 运行时 API**：从 `#imports` 显式 import
3. **Vue API**：从 `vue` 显式 import
4. **第三方库**：从对应包显式 import
5. **module.ts 中注册 auto-import**：通过 `addImportsDir` 注册 composables 和 utils 目录，使消费者项目自动获得 auto-import

### 验证标准

- `pnpm build` 无 TypeScript 错误
- playground `pnpm dev` 正常启动且组件可用

---

## 阶段二：Playground 组件文档系统

### 架构概述

```
Markdown (MDC) → Nuxt Content → ContentRenderer → Vue 组件
                                                    ├── ComponentCode（交互式）
                                                    ├── ComponentExample（场景示例）
                                                    ├── ComponentProps/Emits/Slots（API 表格）
                                                    └── ComponentTheme（主题配置）
```

### 组件文档页结构

每个组件文档页包含 4 个 section：

#### 1. Usage（交互式 ComponentCode）

- 复用现有 `ComponentCode.vue`，修复并完善
- 用户可通过 UI 控件修改 props，实时预览组件效果
- 代码块根据当前 props 值动态生成
- 支持 Nuxt / Vue 双模式代码展示

#### 2. Examples（场景示例 ComponentExample）

- 修复 `ComponentExample.vue`，创建 `examples/` 目录
- 每个示例是独立的 `.vue` 文件，可运行可复制
- 展示复杂场景：组件组合、业务场景、边界情况
- 预览区 + 可折叠源码

#### 3. API（Props / Emits / Slots 表格）

- 复用现有 `ComponentProps.vue`、`ComponentEmits.vue`、`ComponentSlots.vue`
- 数据来源：`/api/component-meta/[name]` 静态注册表
- 需补全缺失组件的 meta 数据

#### 4. Theme（主题配置）

- 复用现有 `ComponentTheme.vue`（当前未使用）
- 展示 `app.config.ts` 中的组件主题配置方式

### Markdown 文件模板

```markdown
---
title: ProDeleteModal
description: 确认删除操作的模态框
category: overlay
---

## Usage

通过 `component-code` 展示交互式 prop 控制。`props` 属性传入一个对象，key 为 prop 名称，value 为该 prop 的可选值数组（第一个值为默认选中值）。ComponentCode 根据 prop 类型自动生成对应的 UI 控件（Select/Input/Switch）。

::component-code{slug="delete-modal" :props='{ title: "确认删除", loading: false }'}
::

## Examples

通过 `component-example` 展示场景示例。`name` 对应 `examples/` 目录下的 .vue 文件名（不含扩展名）。

::component-example{name="delete-modal-batch"}
::
::component-example{name="delete-modal-custom"}
::

## API
### Props
:component-props{slug="delete-modal"}
### Emits
:component-emits{slug="delete-modal"}
### Slots
:component-slots{slug="delete-modal"}

## Theme
:component-theme{slug="delete-modal"}
```

### 需要修复/创建的文件

| 文件 | 状态 | 工作内容 |
|------|------|----------|
| `ComponentCode.vue` | 已有，未使用 | 修复 bug，集成到文档 |
| `ComponentExample.vue` | 已有，不工作 | 修复 glob 路径，创建 examples 目录 |
| `ComponentTheme.vue` | 已有，未使用 | 集成到文档 |
| `ComponentProps/Emits/Slots.vue` | 已有，工作正常 | 保持现状 |
| `examples/*.vue` | 不存在 | 为每个组件创建场景示例文件 |
| `component-meta API` | 已有 | 补全缺失组件的 meta 数据 |
| 15 个组件 markdown 文件 | 已有 | 更新为新的 4-section 结构 |

### 实施顺序

1. 修复 `ComponentCode.vue` 并集成到 1-2 个组件文档验证
2. 修复 `ComponentExample.vue`，创建 `examples/` 目录结构
3. 为简单组件创建示例文件（Empty、Spin、Watermark 等）
4. 启用 `ComponentTheme.vue`
5. 补全 component-meta 数据
6. 更新所有 15 个组件 markdown 文件为新结构
7. 为复杂组件（Table、Form）创建场景示例

---

## 不在范围内

- 测试框架搭建
- CI/CD 配置
- 新组件开发
- 组件 API 变更

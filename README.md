# V Nuxt UI

A reusable Nuxt module providing enterprise-grade components, composables, and utilities built on top of [@nuxt/ui](https://ui.nuxt.com/).

## Features

- **ProTable** — Sophisticated data table with CRUD, pagination, column management, where/order query filters (persisted to localStorage), row selection, context menu actions, Excel export, tree data, row expansion, and column pinning with shadow effects
- **ProForm** — Declarative form builder with 18+ field types and Zod validation
- **ProDeleteModal** — Generic delete confirmation modal with batch support
- **ProPermissionWrapper** — Permission-based UI wrapper with hide/disable modes
- **ProDatePicker** — Enhanced date picker with shortcut presets
- **ProDnd** — Drag-and-drop list via vue-draggable-plus
- **30+ composables** — useApi, useModel, useBoolean, useForm, useDate, useEChart, useApp, useTheme, and 9 table composables
- **Utility functions** — String, array, tree, diff, form, excel, type, emoji, request, download helpers
- **i18n** — English and Chinese locale files
- **Plugins** — NuxtUI toast enhancements, dayjs integration

## Installation

```bash
pnpm add @anthropic-test/v-nuxt-ui
```

### Peer dependencies

```bash
pnpm add @nuxt/ui @nuxtjs/i18n @vueuse/nuxt nuxt
```

### Optional dependencies

```bash
# For charts
pnpm add echarts vue-echarts

# For Excel export
pnpm add exceljs

# For drag-and-drop
pnpm add vue-draggable-plus

# For cron expression display
pnpm add cronstrue
```

## Usage

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@anthropic-test/v-nuxt-ui']
})
```

### Module Options

```ts
export default defineNuxtConfig({
  modules: ['@anthropic-test/v-nuxt-ui'],
  vNuxtUI: {
    prefix: 'Pro' // Component prefix (default: 'V')
  }
})
```

## Components

### ProTable

```vue
<ProTable
  name="users"
  cn-name="Users"
  :biz-columns="bizColumns"
  :use-api-group="useUserApi"
  :on-edit-row-from-modal="openEditModal"
  :export-excel="{ filename: 'users' }"
/>
```

### ProForm

```vue
<ProForm
  :fields="[
    { key: 'name', label: 'Name', type: 'input', required: true },
    { key: 'email', label: 'Email', type: 'input' },
    { key: 'role', label: 'Role', type: 'select', items: roleOptions }
  ]"
  :model="formData"
  @submit="handleSubmit"
/>
```

### ProPermissionWrapper

The permission wrapper uses provide/inject. Your app must provide the permission checker:

```ts
// In your app's plugin or root component
const { hasPermissions } = usePermission()
provide('vui:hasPermissions', hasPermissions)
```

```vue
<ProPermissionWrapper permission="users:delete" mode="disable">
  <UButton color="error">Delete</UButton>
</ProPermissionWrapper>
```

## API Composables

Create standard CRUD API composables using the factory pattern:

```ts
// composables/api/useUserApi.ts
export const useUserApi = () => useApi<User>('/api/users')
```

This provides: `create`, `batchCreate`, `update`, `batchUpdate`, `getById`, `deleteById`, `batchDelete`, `count`, `list`, `countAndList`, `prune`, `copy`.

## Development

```bash
# Install dependencies
make install

# Start playground dev server
make dev

# Build the module
make build

# Run linter
make lint

# Type check
make typecheck
```

## Publishing

```bash
# Dry-run
make publish-dry

# Publish
make publish
```

## License

MIT

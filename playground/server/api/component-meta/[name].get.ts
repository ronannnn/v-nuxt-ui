/**
 * Static component meta registry for Pro components.
 * This provides the same shape as nuxt-component-meta's API output,
 * manually defined since we don't use the nuxt-component-meta module.
 *
 * Shape matches vue-component-meta's ComponentMeta interface:
 * { props: PropertyMeta[], slots: SlotMeta[], events: EventMeta[] }
 */

interface PropMeta {
  name: string
  type: string
  required?: boolean
  default?: string
  description?: string
  tags?: Array<{ name: string, text?: string }>
  schema?: any
}

interface SlotMeta {
  name: string
  type?: string
  description?: string
}

interface EventMeta {
  name: string
  type?: string
  description?: string
}

interface ComponentMetaEntry {
  props: PropMeta[]
  slots: SlotMeta[]
  events: EventMeta[]
}

const componentMeta: Record<string, ComponentMetaEntry> = {
  ProEmpty: {
    props: [
      { name: 'variant', type: `'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'naked'`, default: `'naked'`, description: 'Visual variant of the empty state' },
      { name: 'icon', type: 'string', default: `'i-lucide-inbox'`, description: 'Icon to display' },
      { name: 'title', type: 'string', default: `'暂无数据'`, description: 'Title text' },
      { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`, default: `'xs'`, description: 'Size of the empty state' },
      { name: 'extraClass', type: 'string | undefined', required: false, description: 'Additional CSS class' }
    ],
    slots: [],
    events: []
  },

  ProSpin: {
    props: [
      { name: 'loading', type: 'boolean | undefined', required: true, description: 'Whether to show the loading overlay' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Content wrapped by the spin overlay' }
    ],
    events: []
  },

  ProWatermark: {
    props: [
      { name: 'text', type: `string | string[]`, default: `'Watermark'`, description: 'Watermark text content' },
      { name: 'fontSize', type: 'number', default: '13', description: 'Font size in pixels' },
      { name: 'fontWeight', type: 'string | number', default: '300', description: 'Font weight' },
      { name: 'fontFamily', type: 'string | undefined', required: false, description: 'Font family' },
      { name: 'fontColor', type: 'string', default: `'text-neutral-200 dark:text-neutral-700'`, description: 'Font color class or value' },
      { name: 'lineHeight', type: 'number', default: '16', description: 'Line height in pixels' },
      { name: 'rotate', type: 'number', default: '-16', description: 'Rotation angle in degrees' },
      { name: 'gap', type: 'number', default: '128', description: 'Gap between watermarks in pixels' },
      { name: 'opacity', type: 'number', default: '0.6', description: 'Watermark opacity (0-1)' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the watermark' },
      { name: 'debug', type: 'boolean', default: 'false', description: 'Enable debug mode' },
      { name: 'textAlign', type: `'left' | 'center' | 'right'`, default: `'center'`, description: 'Text alignment' },
      { name: 'xOffset', type: 'number', default: '0', description: 'Horizontal offset' },
      { name: 'yOffset', type: 'number', default: '0', description: 'Vertical offset' },
      { name: 'zIndex', type: 'number | undefined', required: false, description: 'CSS z-index' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Content rendered underneath the watermark' }
    ],
    events: []
  },

  ProCircleProgress: {
    props: [
      { name: 'text', type: 'string | undefined', required: false, description: 'Center text' },
      { name: 'textColor', type: `'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'`, default: `'neutral'`, description: 'Text color' },
      { name: 'textClass', type: 'string | undefined', required: false, description: 'Additional CSS class for text' },
      { name: 'strokeWidth', type: 'number', default: '2', description: 'Width of the progress arc stroke' },
      { name: 'arcs', type: `{ percent?: number; color?: string }[]`, required: false, description: 'Array of arc segments with percent and color' }
    ],
    slots: [],
    events: []
  },

  ProButtons: {
    props: [
      { name: 'items', type: 'ButtonProps[]', required: true, description: 'Array of button configurations' }
    ],
    slots: [],
    events: []
  },

  ProBadges: {
    props: [
      { name: 'items', type: 'BadgeProps[]', required: true, description: 'Array of badge configurations' }
    ],
    slots: [],
    events: []
  },

  ProBadgeCodeModal: {
    props: [
      { name: 'data', type: `string | Record<string, any> | null`, required: false, description: 'Data to display (objects are auto-serialized to JSON)' },
      { name: 'lang', type: `'json' | 'sql' | 'text'`, default: `'text'`, description: 'Syntax highlighting language' },
      { name: 'title', type: 'string', default: `'查看'`, description: 'Modal title' }
    ],
    slots: [],
    events: []
  },

  ProBadgeCodeTooltip: {
    props: [
      { name: 'data', type: `string | Record<string, any> | null`, required: false, description: 'Data to display' },
      { name: 'lang', type: `'json' | 'sql' | 'text'`, default: `'text'`, description: 'Syntax highlighting language' }
    ],
    slots: [],
    events: []
  },

  ProButtonDropdown: {
    props: [
      { name: 'groups', type: 'CommandPaletteGroup[]', required: true, description: 'Dropdown item groups' },
      { name: 'multiple', type: 'boolean', default: 'false', description: 'Enable multi-select' },
      { name: 'enableFooterToolbar', type: 'boolean', default: 'false', description: 'Show footer toolbar (select all/invert/clear)' },
      { name: 'onOpen', type: '() => Promise<void>', required: false, description: 'Async callback when popover opens' },
      { name: 'onSearch', type: '(term: string) => Promise<void>', required: false, description: 'Search handler callback' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Trigger button content' }
    ],
    events: []
  },

  ProButtonTheme: {
    props: [
      { name: 'label', type: 'string', required: true, description: 'Button label' },
      { name: 'icon', type: 'string', required: false, description: 'Icon name' },
      { name: 'chip', type: 'string', required: false, description: 'Color name for the indicator dot' },
      { name: 'locale', type: 'string', required: false, description: 'Locale code for flag emoji rendering' },
      { name: 'selected', type: 'boolean', default: 'false', description: 'Selected state highlight' }
    ],
    slots: [],
    events: []
  },

  ProDeleteModal: {
    props: [
      { name: 'ids', type: 'number[]', required: true, description: 'IDs of items to delete' },
      { name: 'onDelete', type: '(ids: number[]) => Promise<any>', required: true, description: 'Delete handler function' }
    ],
    slots: [],
    events: [
      { name: 'close', type: '[ok: boolean]', description: 'Emitted when the modal is closed' }
    ]
  },

  ProScrollArea: {
    props: [
      { name: 'enableTopTransparent', type: 'boolean | undefined', required: false, description: 'Enable top edge fade effect' },
      { name: 'enableBottomTransparent', type: 'boolean | undefined', required: false, description: 'Enable bottom edge fade effect' },
      { name: 'enableLeftTransparent', type: 'boolean | undefined', required: false, description: 'Enable left edge fade effect' },
      { name: 'enableRightTransparent', type: 'boolean | undefined', required: false, description: 'Enable right edge fade effect' },
      { name: 'enableHorizontalTooltip', type: 'boolean | undefined', required: false, description: 'Enable horizontal scroll tooltip' },
      { name: 'onScrollEvent', type: '(ele: HTMLElement) => void', required: false, description: 'Callback when scrolling occurs' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Scrollable content' }
    ],
    events: []
  },

  ProDnd: {
    props: [
      { name: 'modelValue', type: 'T[]', default: '() => []', description: 'Array of items to sort' },
      { name: 'handle', type: 'string | undefined', required: false, description: 'CSS selector for drag handle' },
      { name: 'group', type: 'object | string', required: false, description: 'Sortable group configuration' },
      { name: 'sort', type: 'boolean', default: 'true', description: 'Whether sorting is enabled' },
      { name: 'chosenClass', type: 'string | undefined', required: false, description: 'CSS class for chosen item' },
      { name: 'dragClass', type: 'string | undefined', required: false, description: 'CSS class for dragged item' },
      { name: 'ghostClass', type: 'string | undefined', required: false, description: 'CSS class for ghost element' },
      { name: 'forceFallback', type: 'boolean', default: 'true', description: 'Force fallback drag implementation' },
      { name: 'clone', type: '(model: T) => T', required: false, description: 'Clone function for drag copies' },
      { name: 'onAdd', type: '(event: SortableEvent) => void', required: false, description: 'Callback when item is added' },
      { name: 'onEnd', type: '(event: SortableEvent) => void', required: false, description: 'Callback when drag ends' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Draggable items' }
    ],
    events: []
  },

  ProPermissionWrapper: {
    props: [
      { name: 'permission', type: 'string | string[]', required: true, description: 'Required permission(s)' },
      { name: 'mode', type: `'hide' | 'disable'`, default: `'disable'`, description: 'How to handle missing permissions' },
      { name: 'fallback', type: 'boolean', default: 'false', description: 'Show fallback slot content when hidden' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Content to wrap with permission check' },
      { name: 'fallback', type: '{}', description: 'Content shown when permission denied' }
    ],
    events: []
  },

  ProSimpleTable: {
    props: [
      { name: 'data', type: 'T[]', required: true, description: 'Table data rows' },
      { name: 'bizColumns', type: 'VColumn<T>[]', required: true, description: 'Column definitions' },
      { name: 'singleRow', type: 'boolean', default: 'true', description: 'Single row mode' },
      { name: 'singleColumn', type: 'boolean', default: 'false', description: 'Single column mode' },
      { name: 'hideLastRowBorder', type: 'boolean | undefined', required: false, description: 'Hide the last row border' }
    ],
    slots: [],
    events: []
  },

  ProDatePicker: {
    props: [
      { name: 'modelValue', type: 'DateValue | DateValue[] | DateRange | null | undefined', required: true, description: 'Selected date value' },
      { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`, required: false, description: 'Button size' },
      { name: 'loading', type: 'boolean', required: false, description: 'Loading state' },
      { name: 'range', type: 'boolean | undefined', required: false, description: 'Enable date range selection' },
      { name: 'placeholder', type: 'string | undefined', required: false, description: 'Placeholder text' },
      { name: 'timeUnit', type: `'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'`, required: false, description: 'Time precision unit' },
      { name: 'leadingIcon', type: 'string', required: false, description: 'Leading icon' },
      { name: 'shortcuts', type: '{ label: string, dateFn: () => any }[]', required: false, description: 'Date shortcut presets' },
      { name: 'peerButtons', type: 'ButtonProps[]', required: false, description: 'Additional peer buttons' }
    ],
    slots: [],
    events: []
  },

  ProDatePickerInput: {
    props: [
      { name: 'modelValue', type: 'string | null | undefined', required: true, description: 'Date string value' },
      { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`, required: false, description: 'Input size' },
      { name: 'placeholder', type: 'string | undefined', required: false, description: 'Placeholder text' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Disabled state' }
    ],
    slots: [],
    events: [
      { name: 'update:modelValue', type: '[value: string | null]', description: 'Emitted when the date value changes' }
    ]
  },

  ProForm: {
    props: [
      { name: 'fields', type: 'VFormFieldProps<T>[]', required: true, description: 'Form field configurations' },
      { name: 'model', type: 'T', required: true, description: 'Form data model' },
      { name: 'rules', type: 'Record<string, any>', required: false, description: 'Validation rules' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Disable all fields' },
      { name: 'readonly', type: 'boolean', required: false, description: 'Make all fields readonly' }
    ],
    slots: [
      { name: 'default', type: '{}', description: 'Additional form content' }
    ],
    events: [
      { name: 'submit', type: '[]', description: 'Form submitted' }
    ]
  },

  ProTable: {
    props: [
      { name: 'bizColumns', type: 'VColumn<T>[]', required: true, description: 'Column definitions with filtering and sorting options' },
      { name: 'apiGroup', type: 'ApiGroup<T>', required: true, description: 'API group for CRUD operations' },
      { name: 'queryItems', type: 'WhereQueryItem[]', required: false, description: 'Query filter items' },
      { name: 'orderQuery', type: 'OrderQuery[]', required: false, description: 'Sort order configuration' },
      { name: 'enableSelection', type: 'boolean', required: false, description: 'Enable row selection' },
      { name: 'enableExport', type: 'boolean', required: false, description: 'Enable data export' }
    ],
    slots: [
      { name: 'toolbar', type: '{}', description: 'Toolbar area above the table' },
      { name: 'default', type: '{}', description: 'Additional content' }
    ],
    events: []
  },

  ProTablePage: {
    props: [
      { name: 'bizColumns', type: 'VColumn<T>[]', required: true, description: 'Column definitions' },
      { name: 'apiGroup', type: 'ApiGroup<T>', required: true, description: 'API group for CRUD operations' },
      { name: 'title', type: 'string', required: false, description: 'Page title' },
      { name: 'description', type: 'string', required: false, description: 'Page description' }
    ],
    slots: [
      { name: 'toolbar', type: '{}', description: 'Toolbar area' },
      { name: 'default', type: '{}', description: 'Additional content' }
    ],
    events: []
  }
}

export default defineEventHandler((event) => {
  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({ statusCode: 400, message: 'Component name is required' })
  }

  // Strip .json extension if present
  const componentName = name.replace(/\.json$/, '')

  const meta = componentMeta[componentName]
  if (!meta) {
    // Return empty meta rather than 404 to avoid breaking the UI
    return { meta: { props: [], slots: [], events: [] } }
  }

  return { meta }
})

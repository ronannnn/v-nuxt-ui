/**
 * Auto-import type declarations for IDE support.
 * Nuxt auto-imports these at runtime, but the module's own source files
 * need explicit declarations for IDE auto-complete and ctrl+click navigation.
 */

// --- Nuxt UI Components ---
declare module 'vue' {
  export interface GlobalComponents {
    UBadge: typeof import('@nuxt/ui/components/Badge.vue')['default']
    UButton: typeof import('@nuxt/ui/components/Button.vue')['default']
    UCalendar: typeof import('@nuxt/ui/components/Calendar.vue')['default']
    UCheckbox: typeof import('@nuxt/ui/components/Checkbox.vue')['default']
    UChip: typeof import('@nuxt/ui/components/Chip.vue')['default']
    UCollapsible: typeof import('@nuxt/ui/components/Collapsible.vue')['default']
    UCommandPalette: typeof import('@nuxt/ui/components/CommandPalette.vue')['default']
    UContextMenu: typeof import('@nuxt/ui/components/ContextMenu.vue')['default']
    UDashboardNavbar: typeof import('@nuxt/ui/components/DashboardNavbar.vue')['default']
    UDashboardPanel: typeof import('@nuxt/ui/components/DashboardPanel.vue')['default']
    UDashboardSidebarCollapse: typeof import('@nuxt/ui/components/DashboardSidebarCollapse.vue')['default']
    UDropdownMenu: typeof import('@nuxt/ui/components/DropdownMenu.vue')['default']
    UEmpty: typeof import('@nuxt/ui/components/Empty.vue')['default']
    UFieldGroup: typeof import('@nuxt/ui/components/FieldGroup.vue')['default']
    UForm: typeof import('@nuxt/ui/components/Form.vue')['default']
    UFormField: typeof import('@nuxt/ui/components/FormField.vue')['default']
    UIcon: typeof import('@nuxt/ui/components/Icon.vue')['default']
    UInput: typeof import('@nuxt/ui/components/Input.vue')['default']
    UInputNumber: typeof import('@nuxt/ui/components/InputNumber.vue')['default']
    UKbd: typeof import('@nuxt/ui/components/Kbd.vue')['default']
    UModal: typeof import('@nuxt/ui/components/Modal.vue')['default']
    UPagination: typeof import('@nuxt/ui/components/Pagination.vue')['default']
    UPopover: typeof import('@nuxt/ui/components/Popover.vue')['default']
    URadioGroup: typeof import('@nuxt/ui/components/RadioGroup.vue')['default']
    USelectMenu: typeof import('@nuxt/ui/components/SelectMenu.vue')['default']
    USeparator: typeof import('@nuxt/ui/components/Separator.vue')['default']
    USlideover: typeof import('@nuxt/ui/components/Slideover.vue')['default']
    USwitch: typeof import('@nuxt/ui/components/Switch.vue')['default']
    UTable: typeof import('@nuxt/ui/components/Table.vue')['default']
    UTextarea: typeof import('@nuxt/ui/components/Textarea.vue')['default']
    UTooltip: typeof import('@nuxt/ui/components/Tooltip.vue')['default']
    UTree: typeof import('@nuxt/ui/components/Tree.vue')['default']
  }
}

export {}

export default defineAppConfig({
  theme: {
    radius: 0.25,
    blackAsPrimary: false
  },
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'zinc'
    },
    modal: {
      slots: {
        footer: 'justify-end'
      }
    },
    collapsible: {
      slots: {
        content: 'data-[state=open]:animate-[collapsible-down_256ms_ease-in-out] data-[state=closed]:animate-[collapsible-up_256ms_ease-in-out]'
      }
    },
    button: {
      slots: {
        base: 'cursor-pointer'
      }
    },
    navigationMenu: {
      variants: {
        orientation: {
          vertical: {
            link: 'py-2.5'
          }
        }
      }
    },
    table: {
      slots: {
        base: 'border-separate border-spacing-0',
        thead: '[&>tr]:bg-transparent',
        tr: 'group transition-all',
        th: 'py-0 px-0 border-default [&:has([role=expand])]:pe-0',
        // tr group中只要有不为empty的td，就应用border-b
        td: 'py-2.5 border-default empty:p-0 [&:has([role=expand-col])]:pe-0 transition-all group-hover:bg-muted'
      },
      variants: {
        pinned: {
          true: {
            th: 'bg-default',
            td: 'bg-default group-hover:bg-muted data-[selected=true]:bg-muted'
          }
        }
      }
    },
    select: {
      slots: {
        content: 'min-w-fit',
        item: 'items-center'
      }
    },
    selectMenu: {
      slots: {
        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
      }
    },
    slideover: {
      variants: {
        side: {
          right: {
            content: 'w-fit'
          }
        }
      }
    },
    dashboardSidebar: {
      slots: {
        footer: 'h-(--ui-footer-height)'
      }
    }
  }
})

<script setup lang="ts">
import { useTheme } from '#v/composables'
import ButtonTheme from '#v/components/button/Theme.vue'

const theme = useTheme()
</script>

<template>
  <UPopover :ui="{ content: 'px-6 py-4 flex flex-col gap-4' }">
    <template #default="{ open }">
      <UButton
        icon="i-lucide-swatch-book"
        color="neutral"
        :variant="open ? 'soft' : 'ghost'"
        square
        aria-label="Color picker"
        :ui="{ leadingIcon: 'text-primary' }"
      />
    </template>

    <template #content>
      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          主色调
        </legend>

        <div class="grid grid-cols-3 gap-2 -mx-2">
          <ButtonTheme
            label="Black"
            chip="black"
            :selected="theme.blackAsPrimary.value"
            @click="theme.blackAsPrimary.value = true"
          >
            <template #leading>
              <span class="inline-block w-2 h-2 rounded-full bg-black dark:bg-white" />
            </template>
          </ButtonTheme>

          <ButtonTheme
            v-for="color in theme.primaryColors"
            :key="color"
            :label="color"
            :chip="color"
            :selected="!theme.blackAsPrimary.value && theme.primary.value === color"
            @click="theme.primary.value = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          中性色调
        </legend>

        <div class="grid grid-cols-3 gap-2 -mx-2">
          <ButtonTheme
            v-for="color in theme.neutralColors"
            :key="color"
            :label="color"
            :chip="color === 'neutral' ? 'old-neutral' : color"
            :selected="theme.neutral.value === color"
            @click="theme.neutral.value = color"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          圆角
        </legend>

        <div class="grid grid-cols-5 gap-2 -mx-2">
          <ButtonTheme
            v-for="r in theme.radiuses"
            :key="r"
            :label="String(r)"
            class="justify-center"
            :selected="theme.radius.value === r"
            @click="theme.radius.value = r"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-[11px] leading-none font-semibold mb-2">
          明暗模式
        </legend>

        <div class="grid grid-cols-3 gap-2 -mx-2">
          <ButtonTheme
            v-for="m in theme.modes.value"
            :key="m.label"
            v-bind="m"
            :selected="theme.mode.value === m.label"
            @click="theme.mode.value = m.value"
          />
        </div>
      </fieldset>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config-store'
import { PRESET_THEMES } from '@/constants/preset-themes'
import ThemeCard from './theme-card.vue'
import type { PresetTheme } from '@/models/types'

const props = defineProps<{
  tier: 'T1' | 'T2' | 'T3'
}>()

const configStore = useConfigStore()

const filteredThemes = computed(() =>
  (PRESET_THEMES as PresetTheme[]).filter((t) => t.tier === props.tier),
)

const tierLabels: Record<string, string> = {
  T1: 'T1 高热',
  T2: 'T2 中热',
  T3: 'T3 常青',
}

function isSelected(id: string) {
  return configStore.config.selectedThemes.includes(id)
}

function toggleTheme(id: string) {
  configStore.toggleTheme(id)
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-sm font-medium text-muted-foreground">
      {{ tierLabels[tier] }}
    </h3>
    <div class="grid gap-2">
      <ThemeCard
        v-for="theme in filteredThemes"
        :key="theme.id"
        :theme="theme"
        :selected="isSelected(theme.id)"
        @toggle="toggleTheme(theme.id)"
      />
    </div>
  </div>
</template>

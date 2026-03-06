<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useConfigStore } from '@/stores/config-store'
import { PRESET_THEMES } from '@/constants/preset-themes'
import type { PresetTheme } from '@/models/types'

const props = defineProps<{
  tier: 'T1' | 'T2' | 'T3'
}>()

const configStore = useConfigStore()

const expanded = ref(props.tier === 'T1')

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
  <div>
    <button
      type="button"
      class="flex w-full items-center gap-1.5 py-1 text-left"
      @click="expanded = !expanded"
    >
      <ChevronDown
        :size="14"
        class="shrink-0 text-muted-foreground transition-transform"
        :class="{ '-rotate-90': !expanded }"
      />
      <span class="text-xs font-medium text-muted-foreground">
        {{ tierLabels[tier] }}
      </span>
      <span class="text-[10px] text-muted-foreground/60">
        ({{ filteredThemes.length }})
      </span>
    </button>
    <div v-show="expanded" class="mt-1.5 flex flex-wrap gap-1.5">
      <span
        v-for="theme in filteredThemes"
        :key="theme.id"
        class="preset-chip group relative"
      >
        <button
          type="button"
          :class="[
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isSelected(theme.id)
              ? 'border border-brand/30 bg-brand/10 text-brand'
              : 'border border-transparent bg-secondary text-secondary-foreground hover:border-border',
          ]"
          @click="toggleTheme(theme.id)"
        >
          <span
            v-if="theme.source"
            class="shrink-0 rounded px-1 text-[9px] font-normal opacity-80"
            :class="theme.source === 'ai' ? 'bg-ai/20 text-ai' : 'bg-info/20 text-info'"
          >
            {{ theme.source === 'ai' ? 'AI' : '数据' }}
          </span>
          {{ theme.name }}
        </button>
        <div class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg opacity-0 transition-opacity group-hover:opacity-100 w-48">
          <p class="font-medium text-popover-foreground">{{ theme.name }}</p>
          <p class="mt-1 text-muted-foreground">{{ theme.description }}</p>
        </div>
      </span>
    </div>
  </div>
</template>

<style scoped>
.preset-chip:hover {
  z-index: 10;
}
</style>

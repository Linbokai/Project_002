<script setup lang="ts">
import { computed } from 'vue'
import { Search, Flame, Star, Leaf, Plus } from 'lucide-vue-next'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { useConfigStore } from '@/stores/config-store'
import { ProductionDirection } from '@/models/enums'

const emit = defineEmits<{
  'open-panel': [type: 'search' | 't1' | 't2' | 't3' | 'add']
}>()

const themeRadarStore = useThemeRadarStore()
const gameplayRadarStore = useGameplayRadarStore()
const configStore = useConfigStore()

const isUeDirection = computed(() => configStore.config.direction === ProductionDirection.UeGameplay)

const badgeCount = computed(() =>
  isUeDirection.value ? gameplayRadarStore.totalSelected : themeRadarStore.totalSelected,
)

const searchLabel = computed(() => isUeDirection.value ? '搜索玩法' : '搜索热点')
const t1Label = computed(() => isUeDirection.value ? 'T1 爆热玩法' : 'T1 高热主题')
const t2Label = computed(() => isUeDirection.value ? 'T2 中热玩法' : 'T2 中热主题')
const t3Label = computed(() => isUeDirection.value ? 'T3 常青玩法' : 'T3 常青主题')
const addLabel = computed(() => isUeDirection.value ? '添加自定义玩法' : '添加自定义主题')

function emitPanel(type: 'search' | 't1' | 't2' | 't3' | 'add') {
  emit('open-panel', type)
}
</script>

<template>
  <aside
    class="flex h-screen w-12 shrink-0 flex-col items-center border-r border-border bg-card py-3"
  >
    <div class="flex flex-col items-center gap-1">
      <div class="relative">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
          :title="searchLabel"
          :aria-label="searchLabel"
          @click="emitPanel('search')"
        >
          <Search :size="18" />
        </button>
        <span
          v-if="badgeCount > 0"
          class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-brand-foreground"
        >
          {{ badgeCount > 99 ? '99+' : badgeCount }}
        </span>
      </div>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        :title="t1Label"
        :aria-label="t1Label"
        @click="emitPanel('t1')"
      >
        <Flame :size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        :title="t2Label"
        :aria-label="t2Label"
        @click="emitPanel('t2')"
      >
        <Star :size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        :title="t3Label"
        :aria-label="t3Label"
        @click="emitPanel('t3')"
      >
        <Leaf :size="18" />
      </button>
      <div class="my-1 h-px w-6 bg-border" />
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        :title="addLabel"
        :aria-label="addLabel"
        @click="emitPanel('add')"
      >
        <Plus :size="18" />
      </button>
    </div>
    <div class="mt-auto" />
  </aside>
</template>

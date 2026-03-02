<script setup lang="ts">
import { Search, Flame, Star, Leaf, Plus } from 'lucide-vue-next'
import { useThemeRadarStore } from '@/stores/theme-radar-store'

const emit = defineEmits<{
  'open-panel': [type: 'search' | 't1' | 't2' | 't3' | 'add']
}>()

const themeRadarStore = useThemeRadarStore()

function emitPanel(type: 'search' | 't1' | 't2' | 't3' | 'add') {
  emit('open-panel', type)
}
</script>

<template>
  <aside
    class="flex h-screen w-12 shrink-0 flex-col items-center border-r border-border bg-card py-3"
  >
    <!-- Top section: theme panel icons -->
    <div class="flex flex-col items-center gap-1">
      <div class="relative">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
          title="搜索热点"
          aria-label="搜索热点"
          @click="emitPanel('search')"
        >
          <Search :size="18" />
        </button>
        <span
          v-if="themeRadarStore.totalSelected > 0"
          class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-brand-foreground"
        >
          {{ themeRadarStore.totalSelected > 99 ? '99+' : themeRadarStore.totalSelected }}
        </span>
      </div>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        title="T1 高热主题"
        aria-label="T1 高热主题"
        @click="emitPanel('t1')"
      >
        <Flame :size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        title="T2 中热主题"
        aria-label="T2 中热主题"
        @click="emitPanel('t2')"
      >
        <Star :size="18" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        title="T3 常青主题"
        aria-label="T3 常青主题"
        @click="emitPanel('t3')"
      >
        <Leaf :size="18" />
      </button>
      <div class="my-1 h-px w-6 bg-border" />
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color] hover:bg-accent hover:text-foreground"
        title="添加自定义主题"
        aria-label="添加自定义主题"
        @click="emitPanel('add')"
      >
        <Plus :size="18" />
      </button>
    </div>
    <!-- Bottom section: reserved for future -->
    <div class="mt-auto" />
  </aside>
</template>

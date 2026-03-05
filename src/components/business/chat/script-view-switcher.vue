<script setup lang="ts">
import { LayoutList, Table, Clock } from 'lucide-vue-next'

type ViewMode = 'cards' | 'table' | 'timeline'

defineProps<{
  activeView: ViewMode
}>()

const emit = defineEmits<{
  'update:activeView': [value: ViewMode]
}>()

const views: { mode: ViewMode; icon: typeof LayoutList; label: string }[] = [
  { mode: 'cards', icon: LayoutList, label: '卡片视图' },
  { mode: 'table', icon: Table, label: '表格视图' },
  { mode: 'timeline', icon: Clock, label: '时间轴视图' },
]
</script>

<template>
  <div class="inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-muted/30 p-0.5">
    <button
      v-for="v in views"
      :key="v.mode"
      :title="v.label"
      class="flex items-center justify-center rounded p-1 transition-colors"
      :class="
        activeView === v.mode
          ? 'bg-background text-brand shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      "
      @click="emit('update:activeView', v.mode)"
    >
      <component :is="v.icon" :size="14" />
    </button>
  </div>
</template>

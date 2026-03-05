<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Monitor, Eye, Flame } from 'lucide-vue-next'
import type { ScriptTemplate, UserTemplate } from '@/models/types'
import { GAME_CATEGORY_LABELS } from '@/models/types'

const props = defineProps<{
  template: ScriptTemplate | UserTemplate
  compact?: boolean
  usageCount?: number
}>()

defineEmits<{
  apply: []
  preview: []
}>()

const isBuiltIn = computed(() => 'category' in props.template)
const hasPreview = computed(() => isBuiltIn.value && 'preview' in props.template && (props.template as ScriptTemplate).preview)

const icon = computed(() => {
  if ('icon' in props.template) return props.template.icon
  return '📄'
})

const gameCategoryLabel = computed(() => {
  if ('gameCategory' in props.template && props.template.gameCategory) {
    return GAME_CATEGORY_LABELS[props.template.gameCategory as keyof typeof GAME_CATEGORY_LABELS]
  }
  return null
})

const durationLabel = computed(() => `${props.template.config.duration}s`)

const ratioLabel = computed(() => {
  const map: Record<string, string> = { '9:16': '竖屏', '16:9': '横屏', '1:1': '方屏' }
  return map[props.template.config.aspectRatio] ?? props.template.config.aspectRatio
})
</script>

<template>
  <div class="group relative flex text-left rounded-xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md hover:shadow-brand/5"
    :class="compact ? 'gap-3 p-3' : 'flex-col gap-2 p-4'"
  >
    <button
      type="button"
      class="flex flex-1 text-left"
      :class="compact ? 'gap-3 items-center' : 'flex-col gap-2'"
      @click="$emit('apply')"
    >
      <div v-if="compact" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
        {{ icon }}
      </div>
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <div class="flex items-center gap-2">
          <span v-if="!compact" class="text-lg">{{ icon }}</span>
          <span class="text-sm font-medium truncate group-hover:text-brand transition-colors">
            {{ template.name }}
          </span>
        </div>
        <p v-if="!compact" class="text-xs text-muted-foreground line-clamp-2">
          {{ template.description }}
        </p>
        <div class="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
          <span class="inline-flex items-center gap-0.5">
            <Clock :size="10" />
            {{ durationLabel }}
          </span>
          <span class="inline-flex items-center gap-0.5">
            <Monitor :size="10" />
            {{ ratioLabel }}
          </span>
          <span
            v-if="gameCategoryLabel"
            class="rounded bg-brand/10 px-1 py-px text-[10px] text-brand"
          >
            {{ gameCategoryLabel }}
          </span>
          <span
            v-if="!isBuiltIn"
            class="rounded bg-muted px-1 py-px text-[10px]"
          >
            自定义
          </span>
          <span
            v-if="usageCount && usageCount > 0"
            class="inline-flex items-center gap-0.5 text-orange-500"
          >
            <Flame :size="9" />
            {{ usageCount }}
          </span>
        </div>
      </div>
    </button>

    <!-- Preview Button -->
    <button
      v-if="hasPreview && !compact"
      type="button"
      class="absolute top-2 right-2 rounded-md p-1 bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-brand transition-all"
      title="预览脚本示例"
      @click.stop="$emit('preview')"
    >
      <Eye :size="14" />
    </button>
  </div>
</template>

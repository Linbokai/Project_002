<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Monitor } from 'lucide-vue-next'
import type { ScriptTemplate, UserTemplate } from '@/models/types'

const props = defineProps<{
  template: ScriptTemplate | UserTemplate
  compact?: boolean
}>()

defineEmits<{
  apply: []
}>()

const isUserTemplate = computed(() => 'createdAt' in props.template)

const icon = computed(() => {
  if ('icon' in props.template) return props.template.icon
  return '📄'
})

const durationLabel = computed(() => `${props.template.config.duration}s`)

const ratioLabel = computed(() => {
  const map: Record<string, string> = { '9:16': '竖屏', '16:9': '横屏', '1:1': '方屏' }
  return map[props.template.config.aspectRatio] ?? props.template.config.aspectRatio
})
</script>

<template>
  <button
    type="button"
    class="group flex text-left rounded-xl border border-border bg-card transition-all hover:border-brand/40 hover:shadow-md hover:shadow-brand/5"
    :class="compact ? 'gap-3 p-3' : 'flex-col gap-2 p-4'"
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
      <div class="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span class="inline-flex items-center gap-0.5">
          <Clock :size="10" />
          {{ durationLabel }}
        </span>
        <span class="inline-flex items-center gap-0.5">
          <Monitor :size="10" />
          {{ ratioLabel }}
        </span>
        <span
          v-if="isUserTemplate"
          class="rounded bg-muted px-1 py-px text-[10px]"
        >
          自定义
        </span>
      </div>
    </div>
  </button>
</template>

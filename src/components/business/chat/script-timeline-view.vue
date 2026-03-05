<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { Shot } from '@/models/types'

defineProps<{
  shots: Shot[]
}>()

const expandedIds = ref<Set<number>>(new Set())

function toggle(id: number) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

const detailFields: { key: keyof Shot; label: string }[] = [
  { key: 'scale', label: '景别' },
  { key: 'camera', label: '镜头' },
  { key: 'textOverlay', label: '字幕' },
  { key: 'vfx', label: '特效' },
  { key: 'transition', label: '转场' },
  { key: 'sfx', label: '音效' },
  { key: 'notes', label: '备注' },
]
</script>

<template>
  <div class="relative pl-6">
    <!-- 时间轴竖线 -->
    <div class="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />

    <div
      v-for="(shot, idx) in shots"
      :key="shot.id"
      class="relative pb-4 last:pb-0"
    >
      <!-- 节点圆点 -->
      <div
        class="absolute -left-6 top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-colors"
        :class="
          expandedIds.has(shot.id)
            ? 'border-brand bg-brand'
            : 'border-brand/60 bg-background'
        "
      >
        <span
          class="text-[8px] font-bold leading-none"
          :class="expandedIds.has(shot.id) ? 'text-brand-foreground' : 'text-brand'"
        >
          {{ idx + 1 }}
        </span>
      </div>

      <!-- 节点内容 -->
      <div
        class="rounded-md border border-border/40 bg-card/50 transition-colors hover:border-border/70"
      >
        <!-- 头部：可点击展开 -->
        <button
          class="flex w-full items-start gap-2 px-3 py-2 text-left"
          @click="toggle(shot.id)"
        >
          <div class="mt-0.5 shrink-0 text-muted-foreground">
            <ChevronDown v-if="expandedIds.has(shot.id)" :size="12" />
            <ChevronRight v-else :size="12" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-baseline gap-2">
              <span
                v-if="shot.timeRange"
                class="shrink-0 font-mono text-xs font-semibold text-brand"
              >
                {{ shot.timeRange }}
              </span>
              <span class="text-xs font-medium text-foreground">
                {{ shot.segment }}
              </span>
            </div>

            <p class="mt-1 text-xs leading-relaxed text-foreground/80" :class="!expandedIds.has(shot.id) && 'line-clamp-2'">
              {{ shot.scene }}
            </p>

            <p v-if="shot.voiceover" class="mt-0.5 text-xs italic leading-relaxed text-muted-foreground" :class="!expandedIds.has(shot.id) && 'line-clamp-1'">
              「{{ shot.voiceover }}」
            </p>
          </div>
        </button>

        <!-- 展开的详细信息 -->
        <div
          v-if="expandedIds.has(shot.id)"
          class="border-t border-border/30 px-3 py-2"
        >
          <div class="flex flex-wrap gap-x-4 gap-y-1">
            <template v-for="field in detailFields" :key="field.key">
              <div v-if="shot[field.key]" class="flex items-baseline gap-1">
                <span class="text-[11px] font-medium text-muted-foreground">{{ field.label }}:</span>
                <span class="text-[11px] text-foreground">{{ shot[field.key] }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

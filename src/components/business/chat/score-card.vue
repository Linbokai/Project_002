<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronUp, Copy, Check, Lightbulb, Award } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/base-badge.vue'
import BaseButton from '@/components/ui/base-button.vue'
import ScoreRadarChart from './score-radar-chart.vue'
import type { ScriptScore } from '@/models/types/score'

const props = defineProps<{
  score: ScriptScore | null
  loading: boolean
}>()

const expanded = ref(true)
const copied = ref(false)

const ratingConfig = computed(() => {
  const s = props.score?.overall ?? 0
  if (s >= 90) return { label: '优秀', variant: 'brand' as const }
  if (s >= 75) return { label: '良好', variant: 'default' as const }
  if (s >= 60) return { label: '一般', variant: 'secondary' as const }
  return { label: '待优化', variant: 'outline' as const }
})

function buildReport(): string {
  if (!props.score) return ''
  const { overall, summary, dimensions, suggestions } = props.score
  const dimLines = dimensions.map((d) => `  ${d.label}: ${d.score}分 — ${d.comment}`).join('\n')
  const sugLines = suggestions.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
  return `脚本评分报告\n综合评分: ${overall}分\n\n${summary}\n\n各维度:\n${dimLines}\n\n优化建议:\n${sugLines}`
}

async function copyReport() {
  try {
    await navigator.clipboard.writeText(buildReport())
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // clipboard API may fail in insecure contexts
  }
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card overflow-hidden">
    <!-- Header -->
    <button
      class="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2">
        <Award :size="16" class="text-brand" />
        <span class="text-sm font-medium text-foreground">脚本评分</span>
      </div>
      <component :is="expanded ? ChevronUp : ChevronDown" :size="16" class="text-muted-foreground" />
    </button>

    <!-- Loading skeleton -->
    <div v-if="loading" class="px-4 pb-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="h-10 w-16 rounded-md bg-muted animate-pulse" />
        <div class="h-5 w-12 rounded bg-muted animate-pulse" />
      </div>
      <div class="mx-auto h-[200px] w-[200px] rounded-full bg-muted animate-pulse" />
      <div class="space-y-2">
        <div class="h-4 w-full rounded bg-muted animate-pulse" />
        <div class="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div class="h-4 w-5/6 rounded bg-muted animate-pulse" />
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="score && expanded" class="px-4 pb-4 space-y-4">
      <!-- Overall score -->
      <div class="flex items-center gap-3">
        <span class="text-3xl font-bold text-foreground">{{ score.overall }}</span>
        <BaseBadge :variant="ratingConfig.variant">{{ ratingConfig.label }}</BaseBadge>
      </div>

      <!-- Summary -->
      <p class="text-sm text-muted-foreground leading-relaxed">{{ score.summary }}</p>

      <!-- Radar chart -->
      <div class="flex justify-center">
        <ScoreRadarChart :dimensions="score.dimensions" />
      </div>

      <!-- Dimension details -->
      <div class="grid grid-cols-1 gap-1.5">
        <div
          v-for="dim in score.dimensions"
          :key="dim.key"
          class="flex items-center justify-between rounded-md bg-muted/40 px-3 py-1.5"
        >
          <span class="text-xs text-foreground">{{ dim.label }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted-foreground">{{ dim.comment }}</span>
            <span class="text-xs font-medium text-foreground tabular-nums w-8 text-right">
              {{ dim.score }}
            </span>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="score.suggestions.length" class="space-y-2">
        <h4 class="text-xs font-medium text-muted-foreground">优化建议</h4>
        <ul class="space-y-1.5">
          <li
            v-for="(suggestion, i) in score.suggestions"
            :key="i"
            class="flex items-start gap-2 text-sm text-foreground"
          >
            <Lightbulb :size="14" class="mt-0.5 shrink-0 text-brand" />
            <span class="leading-relaxed">{{ suggestion }}</span>
          </li>
        </ul>
      </div>

      <!-- Copy button -->
      <div class="flex justify-end">
        <BaseButton variant="ghost" size="sm" @click="copyReport">
          <component :is="copied ? Check : Copy" :size="14" />
          {{ copied ? '已复制' : '复制报告' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/base-button.vue'
import { TrendingUp, MousePointerClick, DollarSign, Play, Sparkles } from 'lucide-vue-next'
import { useVideoAnalysis } from '@/composables/use-video-analysis'
import { useChatStore } from '@/stores/chat-store'
import { GenerationStatus } from '@/models/enums'
import { computed } from 'vue'

const { requestOptimization, generateScriptDirections } = useVideoAnalysis()
const chatStore = useChatStore()

const busy = computed(() => chatStore.status === GenerationStatus.Generating)

const goals = [
  { key: '提升ROI', icon: TrendingUp, label: '提升ROI' },
  { key: '提升点击率', icon: MousePointerClick, label: '提升点击率' },
  { key: '降低CPA', icon: DollarSign, label: '降低CPA' },
  { key: '提升完播率', icon: Play, label: '提升完播率' },
] as const

function handleOptimize(goal: string) {
  requestOptimization(goal)
}

function handleGenerateScript() {
  generateScriptDirections()
}
</script>

<template>
  <div class="flex flex-col gap-2 pt-2">
    <div class="flex flex-wrap items-center gap-1.5">
      <span class="mr-1 text-xs text-muted-foreground">专项优化：</span>
      <BaseButton
        v-for="g in goals"
        :key="g.key"
        variant="outline"
        size="sm"
        class="h-7 px-2 text-xs"
        :disabled="busy"
        @click="handleOptimize(g.key)"
      >
        <component :is="g.icon" :size="12" />
        {{ g.label }}
      </BaseButton>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="mr-1 text-xs text-muted-foreground">脚本创作：</span>
      <BaseButton
        variant="brand"
        size="sm"
        class="h-7 px-3 text-xs"
        :disabled="busy"
        @click="handleGenerateScript"
      >
        <Sparkles :size="12" />
        根据分析生成新脚本
      </BaseButton>
    </div>
  </div>
</template>

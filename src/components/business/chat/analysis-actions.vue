<script setup lang="ts">
import BaseButton from '@/components/ui/base-button.vue'
import { TrendingUp, MousePointerClick, DollarSign, Play } from 'lucide-vue-next'
import { useVideoAnalysis } from '@/composables/use-video-analysis'
import { useChatStore } from '@/stores/chat-store'
import { GenerationStatus } from '@/models/enums'
import { computed } from 'vue'

const { requestOptimization } = useVideoAnalysis()
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
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5 pt-2">
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
</template>

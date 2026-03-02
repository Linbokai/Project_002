<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/models/types'
import ScriptActions from './script-actions.vue'
import AnalysisActions from './analysis-actions.vue'
import { useGameStore } from '@/stores/game-store'
import { useVideoAnalysis } from '@/composables/use-video-analysis'

const props = defineProps<{
  message: ChatMessage
}>()

const gameStore = useGameStore()
const { hasAnalysisResult } = useVideoAnalysis()

const isAssistant = computed(() => props.message.role === 'assistant')
const isUser = computed(() => props.message.role === 'user')

const hasScriptContent = computed(() => {
  const c = props.message.content
  if (!c || c.length < 50) return false
  const scriptPattern =
    /分镜|镜头|旁白|口播|【|】|^\d+-\d+s?/m
  const multiLine = c.split('\n').length >= 3
  return scriptPattern.test(c) || (multiLine && c.length > 100)
})

const isAnalysisResponse = computed(() => {
  if (!isAssistant.value || !props.message.content) return false
  const c = props.message.content
  return c.includes('买量策略分析') && c.includes('可复用') && c.includes('优化建议')
})

const gameName = computed(() => gameStore.currentGame?.name ?? '脚本')
</script>

<template>
  <div
    :class="[
      'max-w-[85%] rounded-lg p-4',
      isAssistant && 'bg-card text-card-foreground msg-assistant',
      isUser && 'ml-auto bg-brand/10 text-foreground msg-user',
    ]"
  >
    <pre class="whitespace-pre-wrap break-words font-sans text-sm">{{
      message.content || ' '
    }}</pre>
    <ScriptActions
      v-if="isAssistant && hasScriptContent && message.content"
      :script-text="message.content"
      :game-name="gameName"
    />
    <AnalysisActions
      v-if="isAssistant && isAnalysisResponse && hasAnalysisResult"
    />
  </div>
</template>

<style scoped>
.msg-assistant {
  animation: slide-in-left 0.2s ease-out;
}
.msg-user {
  animation: slide-in-right 0.2s ease-out;
}
@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>

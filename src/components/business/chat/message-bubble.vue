<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/models/types'
import { MessageType } from '@/models/enums'
import ScriptActions from './script-actions.vue'
import AnalysisActions from './analysis-actions.vue'
import ScriptDirectionActions from './script-direction-actions.vue'
import MarkdownContent from '@/components/ui/markdown-content.vue'
import { useGameStore } from '@/stores/game-store'
import { useVideoAnalysis } from '@/composables/use-video-analysis'

const props = defineProps<{
  message: ChatMessage
}>()

const gameStore = useGameStore()
const { hasAnalysisResult, hasDirectionsResult } = useVideoAnalysis()

const isAssistant = computed(() => props.message.role === 'assistant')
const isUser = computed(() => props.message.role === 'user')

const showScriptActions = computed(() => {
  if (!isAssistant.value || !props.message.content) return false
  if (props.message.type) return props.message.type === MessageType.Script
  return legacyHasScriptContent.value
})

const showAnalysisActions = computed(() => {
  if (!isAssistant.value || !props.message.content) return false
  if (props.message.type) {
    return props.message.type === MessageType.Analysis && hasAnalysisResult.value
  }
  return legacyIsAnalysisResponse.value && hasAnalysisResult.value
})

const legacyHasScriptContent = computed(() => {
  const c = props.message.content
  if (!c || c.length < 50) return false
  const scriptPattern = /分镜|镜头|旁白|口播|【|】|^\d+-\d+s?/m
  const multiLine = c.split('\n').length >= 3
  return scriptPattern.test(c) || (multiLine && c.length > 100)
})

const legacyIsAnalysisResponse = computed(() => {
  if (!isAssistant.value || !props.message.content) return false
  const c = props.message.content
  return c.includes('买量策略分析') && c.includes('可复用') && c.includes('优化建议')
})

const showDirectionActions = computed(() => {
  if (!isAssistant.value || !props.message.content) return false
  return props.message.type === MessageType.ScriptDirection && hasDirectionsResult.value
})

const useMarkdown = computed(() => {
  if (!isAssistant.value) return false
  const c = props.message.content
  return c && (c.includes('##') || c.includes('**') || c.includes('- '))
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
    <MarkdownContent
      v-if="useMarkdown"
      :content="message.content || ''"
    />
    <pre
      v-else
      class="whitespace-pre-wrap break-words font-sans text-sm"
    >{{ message.content || ' ' }}</pre>
    <ScriptActions
      v-if="showScriptActions"
      :script-text="message.content"
      :game-name="gameName"
    />
    <AnalysisActions
      v-if="showAnalysisActions"
    />
    <ScriptDirectionActions
      v-if="showDirectionActions"
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

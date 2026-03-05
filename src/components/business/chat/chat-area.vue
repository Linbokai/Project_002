<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import { useChatStore } from '@/stores/chat-store'
import { useVariantStore } from '@/stores/variant-store'
import { GenerationStatus } from '@/models/enums'
import { useVideoAnalysis } from '@/composables/use-video-analysis'
import EmptyState from './empty-state.vue'
import MessageBubble from './message-bubble.vue'
import VariantResults from './variant-results.vue'
import TypingIndicator from './typing-indicator.vue'

const emit = defineEmits<{
  'open-settings': []
  'open-game-manager': []
  'apply-template': [template: import('@/models/types').ScriptTemplate | import('@/models/types').UserTemplate]
  'open-templates': []
}>()

const chatStore = useChatStore()
const variantStore = useVariantStore()
const { analyzing, progress } = useVideoAnalysis()
const scrollContainer = ref<HTMLElement | null>(null)
const userNearBottom = ref(true)

const hasMessages = computed(() => chatStore.messages.length > 0)
const hasError = computed(
  () =>
    chatStore.status === GenerationStatus.Error &&
    !!chatStore.errorMessage,
)
const isGenerating = computed(
  () => chatStore.status === GenerationStatus.Generating,
)
const showTyping = computed(() => isGenerating.value || analyzing.value)
const typingLabel = computed(() => {
  if (analyzing.value) {
    return progress.value < 100 ? `提取视频帧 ${progress.value}%` : '分析中...'
  }
  return '生成中...'
})
const typingStages = computed(() => {
  if (analyzing.value) return ['提取视频帧...', '分析画面内容...', '生成优化建议...']
  if (isGenerating.value) return ['分析配置参数...', '构思脚本结构...', '撰写分镜脚本...']
  return []
})

const SCROLL_THRESHOLD = 100

function onScroll() {
  if (!scrollContainer.value) return
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  userNearBottom.value = scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD
}

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

watch(
  () => chatStore.messages.length,
  () => {
    userNearBottom.value = true
    nextTick(scrollToBottom)
  },
)

watch(
  () => chatStore.currentStreamText,
  () => {
    if (userNearBottom.value) scrollToBottom()
  },
  { flush: 'post' },
)

function handleOpenSettings() {
  emit('open-settings')
}

function handleOpenGameManager() {
  emit('open-game-manager')
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <div
      v-if="!hasMessages && !hasError && !showTyping"
      class="flex flex-1 flex-col overflow-auto"
    >
      <EmptyState
        @open-settings="handleOpenSettings"
        @open-game-manager="handleOpenGameManager"
        @apply-template="(tpl) => emit('apply-template', tpl)"
        @open-templates="emit('open-templates')"
      />
    </div>
    <div
      v-else
      ref="scrollContainer"
      class="flex flex-1 flex-col gap-4 overflow-auto px-4 py-4"
      @scroll="onScroll"
    >
      <div class="flex flex-col gap-4">
        <MessageBubble
          v-for="(msg, idx) in chatStore.messages"
          :key="idx"
          :message="msg"
        />
        <VariantResults
          v-if="variantStore.hasVariants"
          :variants="variantStore.variants"
          @select="variantStore.selectVariant($event)"
        />
        <TypingIndicator v-if="showTyping" :label="typingLabel" :stages="typingStages" />
        <div
          v-if="hasError"
          class="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4"
        >
          <AlertCircle
            :size="18"
            class="mt-0.5 shrink-0 text-destructive"
          />
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium text-destructive"
              >生成失败</span
            >
            <span class="text-sm text-muted-foreground">{{
              chatStore.errorMessage
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

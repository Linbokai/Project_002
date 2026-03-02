<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VideoMetrics } from '@/models/types'
import BaseButton from '@/components/ui/base-button.vue'
import VideoMetricsDialog from './video-metrics-dialog.vue'
import { Send, Sparkles, Video } from 'lucide-vue-next'
import { useChat } from '@/composables/use-chat'
import { useVideoAnalysis } from '@/composables/use-video-analysis'

const { sendMessage, generateScript, isGenerating } = useChat()
const { analyzeVideo, analyzing, progress } = useVideoAnalysis()
const inputText = ref('')
const showVideoDialog = ref(false)

const busy = computed(() => isGenerating.value || analyzing.value)

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || busy.value) return
  inputText.value = ''
  await sendMessage(text)
}

async function handleGenerate() {
  if (busy.value) return
  await generateScript()
}

function openVideoDialog() {
  if (busy.value) return
  showVideoDialog.value = true
}

async function handleVideoSubmit(file: File, metrics?: VideoMetrics) {
  showVideoDialog.value = false
  await analyzeVideo(file, metrics)
}
</script>

<template>
  <div class="flex shrink-0 flex-col gap-2 border-t border-border bg-background px-4 py-3">
    <div v-if="analyzing" class="flex items-center gap-2">
      <div class="h-1.5 flex-1 rounded-full bg-muted">
        <div
          class="h-full rounded-full bg-brand transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <span class="whitespace-nowrap text-xs text-muted-foreground">提取帧 {{ progress }}%</span>
    </div>
    <div class="flex items-center gap-2">
      <BaseButton
        variant="brand"
        size="sm"
        :disabled="busy"
        :loading="isGenerating"
        @click="handleGenerate"
      >
        <Sparkles v-if="!isGenerating" :size="14" />
        生成脚本
      </BaseButton>
      <BaseButton
        variant="outline"
        size="sm"
        :disabled="busy"
        :loading="analyzing"
        @click="openVideoDialog"
      >
        <Video v-if="!analyzing" :size="14" />
        分析视频
      </BaseButton>
    </div>
    <div class="flex items-end gap-2">
      <textarea
        v-model="inputText"
        placeholder="输入补充要求或追问..."
        :disabled="busy"
        rows="1"
        class="min-h-[36px] max-h-[96px] flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
        @keydown.enter.exact.prevent="handleSend"
        @input="($event.target as HTMLTextAreaElement).style.height = 'auto'; ($event.target as HTMLTextAreaElement).style.height = Math.min(($event.target as HTMLTextAreaElement).scrollHeight, 96) + 'px'"
      />
      <BaseButton
        variant="brand"
        size="icon"
        :disabled="!inputText.trim() || busy"
        title="发送"
        class="h-9 w-9 shrink-0"
        @click="handleSend"
      >
        <Send :size="16" />
      </BaseButton>
    </div>

    <VideoMetricsDialog
      :open="showVideoDialog"
      @close="showVideoDialog = false"
      @submit="handleVideoSubmit"
    />
  </div>
</template>

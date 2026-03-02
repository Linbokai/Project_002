<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VideoMetrics } from '@/models/types'
import BaseButton from '@/components/ui/base-button.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import VideoMetricsDialog from './video-metrics-dialog.vue'
import { Send, Sparkles, Video } from 'lucide-vue-next'
import { useChat } from '@/composables/use-chat'
import { useVideoAnalysis } from '@/composables/use-video-analysis'
import { useModelStatus } from '@/composables/use-model-status'
import { useConfigStore } from '@/stores/config-store'
import { useSettingsStore } from '@/stores/settings-store'
import { ProductionDirection } from '@/models/enums'
import { SEARCH_MODELS, GEN_MODELS, VISION_MODELS } from '@/constants/model-options'

const { sendMessage, generateScript, isGenerating } = useChat()
const { analyzeVideo, analyzing, progress } = useVideoAnalysis()
const { searchStatus, genStatus, visionStatus } = useModelStatus()
const configStore = useConfigStore()
const settingsStore = useSettingsStore()

const searchModelOptions = SEARCH_MODELS.map((m) => ({ value: m.id, label: m.name }))
const genModelOptions = GEN_MODELS.map((m) => ({ value: m.id, label: m.name }))
const visionModelOptions = VISION_MODELS.map((m) => ({ value: m.id, label: m.name }))
const inputText = ref('')
const showVideoDialog = ref(false)

const busy = computed(() => isGenerating.value || analyzing.value)
const generateLabel = computed(() =>
  configStore.config.direction === ProductionDirection.UeGameplay ? '生成玩法脚本' : '生成脚本',
)

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
    <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
      <BaseButton
        variant="brand"
        size="lg"
        :disabled="busy"
        :loading="isGenerating"
        @click="handleGenerate"
      >
        <Sparkles v-if="!isGenerating" :size="16" />
        {{ generateLabel }}
      </BaseButton>
      <BaseButton
        variant="outline"
        size="lg"
        :disabled="busy"
        :loading="analyzing"
        @click="openVideoDialog"
      >
        <Video v-if="!analyzing" :size="16" />
        分析视频
      </BaseButton>
      <div class="flex flex-1" />
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <div class="flex items-center gap-1.5">
          <span
            :class="[
              'h-2 w-2 shrink-0 rounded-full',
              searchStatus === 'connected' ? 'bg-chart-2' : searchStatus === 'connecting' ? 'bg-chart-4 animate-pulse' : 'bg-destructive',
            ]"
            :title="searchStatus === 'connected' ? '已连接' : searchStatus === 'connecting' ? '连接中' : '未连接'"
          />
          <span class="shrink-0 text-xs text-muted-foreground">搜索</span>
          <div class="w-40">
            <BaseSelect
              :model-value="settingsStore.config.searchModel"
              :options="searchModelOptions"
              @update:model-value="settingsStore.updateModel('search', $event)"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            :class="[
              'h-2 w-2 shrink-0 rounded-full',
              genStatus === 'connected' ? 'bg-chart-2' : genStatus === 'connecting' ? 'bg-chart-4 animate-pulse' : 'bg-destructive',
            ]"
            :title="genStatus === 'connected' ? '已连接' : genStatus === 'connecting' ? '连接中' : '未连接'"
          />
          <span class="shrink-0 text-xs text-muted-foreground">脚本</span>
          <div class="w-40">
            <BaseSelect
              :model-value="settingsStore.config.genModel"
              :options="genModelOptions"
              @update:model-value="settingsStore.updateModel('gen', $event)"
            />
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span
            :class="[
              'h-2 w-2 shrink-0 rounded-full',
              visionStatus === 'connected' ? 'bg-chart-2' : visionStatus === 'connecting' ? 'bg-chart-4 animate-pulse' : 'bg-destructive',
            ]"
            :title="visionStatus === 'connected' ? '已连接' : visionStatus === 'connecting' ? '连接中' : '未连接'"
          />
          <span class="shrink-0 text-xs text-muted-foreground">视觉</span>
          <div class="w-40">
            <BaseSelect
              :model-value="settingsStore.config.visionModel"
              :options="visionModelOptions"
              @update:model-value="settingsStore.updateModel('vision', $event)"
            />
          </div>
        </div>
      </div>
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

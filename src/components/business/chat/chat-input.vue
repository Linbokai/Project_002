<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VideoMetrics } from '@/models/types'
import BaseButton from '@/components/ui/base-button.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import VideoMetricsDialog from './video-metrics-dialog.vue'
import { Send, Sparkles, Video, Settings2, ChevronUp } from 'lucide-vue-next'
import { useChat } from '@/composables/use-chat'
import { useVideoAnalysis } from '@/composables/use-video-analysis'
import { useModelStatus } from '@/composables/use-model-status'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { ProductionDirection } from '@/models/enums'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { SEARCH_MODELS, GEN_MODELS, VISION_MODELS } from '@/constants/model-options'

const { sendMessage, generateScript, isGenerating } = useChat()
const { analyzeVideo, analyzing, progress } = useVideoAnalysis()
const { searchStatus, genStatus, visionStatus } = useModelStatus()
const configStore = useConfigStore()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const searchModelOptions = SEARCH_MODELS.map((m) => ({ value: m.id, label: m.name }))
const genModelOptions = GEN_MODELS.map((m) => ({ value: m.id, label: m.name }))
const visionModelOptions = VISION_MODELS.map((m) => ({ value: m.id, label: m.name }))
const inputText = ref('')
const showVideoDialog = ref(false)
const showModels = ref(false)

const busy = computed(() => isGenerating.value || analyzing.value)
const generateLabel = computed(() =>
  configStore.config.direction === ProductionDirection.UeGameplay ? '生成玩法脚本' : '生成脚本',
)

const configSummary = computed(() => {
  const c = configStore.config
  const parts: string[] = []
  const game = gameStore.currentGame
  if (game) parts.push(game.name)
  parts.push(`${c.duration}s`)
  parts.push(c.aspectRatio)
  const st = SCRIPT_TYPES.find((s) => s.id === c.scriptType)
  if (st) parts.push(st.name)
  return parts.join(' / ')
})

const allConnected = computed(() =>
  searchStatus.value === 'connected' && genStatus.value === 'connected' && visionStatus.value === 'connected',
)

function statusDotClass(status: string) {
  if (status === 'connected') return 'bg-chart-2'
  if (status === 'connecting') return 'bg-chart-4 animate-pulse'
  return 'bg-destructive'
}

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
  <div class="flex shrink-0 flex-col border-t border-border bg-background">
    <!-- Config Summary Bar -->
    <div class="flex items-center gap-2 border-b border-border/50 px-4 py-1.5">
      <span class="text-[11px] text-muted-foreground">当前配置</span>
      <span class="text-[11px] font-medium">{{ configSummary }}</span>
      <div class="flex-1" />
      <button
        type="button"
        class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        @click="showModels = !showModels"
      >
        <Settings2 :size="12" />
        模型
        <span
          class="h-1.5 w-1.5 shrink-0 rounded-full"
          :class="allConnected ? 'bg-chart-2' : 'bg-chart-4'"
        />
        <ChevronUp
          :size="10"
          class="transition-transform"
          :class="{ 'rotate-180': !showModels }"
        />
      </button>
    </div>

    <!-- Collapsible Model Selectors -->
    <div
      v-show="showModels"
      class="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border/50 px-4 py-2"
    >
      <div class="flex items-center gap-1.5">
        <span
          class="h-2 w-2 shrink-0 rounded-full"
          :class="statusDotClass(searchStatus)"
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
          class="h-2 w-2 shrink-0 rounded-full"
          :class="statusDotClass(genStatus)"
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
          class="h-2 w-2 shrink-0 rounded-full"
          :class="statusDotClass(visionStatus)"
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

    <div class="flex flex-col gap-2 px-4 py-3">
      <!-- Progress Bar -->
      <div v-if="analyzing" class="flex items-center gap-2">
        <div class="h-1.5 flex-1 rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-brand transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <span class="whitespace-nowrap text-xs text-muted-foreground">提取帧 {{ progress }}%</span>
      </div>

      <!-- Text Input + Send -->
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
          title="发送 (Enter)"
          class="h-9 w-9 shrink-0"
          @click="handleSend"
        >
          <Send :size="16" />
        </BaseButton>
      </div>

      <!-- Main Actions -->
      <div class="flex items-center gap-2">
        <BaseButton
          variant="brand"
          size="sm"
          :disabled="busy"
          :loading="isGenerating"
          @click="handleGenerate"
        >
          <Sparkles v-if="!isGenerating" :size="14" />
          {{ generateLabel }}
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
    </div>

    <VideoMetricsDialog
      :open="showVideoDialog"
      @close="showVideoDialog = false"
      @submit="handleVideoSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import { Clapperboard } from 'lucide-vue-next'
import QuickActions from './quick-actions.vue'
import { useSettingsStore } from '@/stores/settings-store'
import { useGameStore } from '@/stores/game-store'
import { useChat } from '@/composables/use-chat'
import { useVideoAnalysis } from '@/composables/use-video-analysis'

const emit = defineEmits<{
  'open-settings': []
  'open-game-manager': []
  generate: []
  'analyze-video': []
}>()

const settingsStore = useSettingsStore()
const gameStore = useGameStore()
const { generateScript, isGenerating } = useChat()
const { analyzeVideo, analyzing } = useVideoAnalysis()

const hasApiKey = computed(() => settingsStore.hasApiKey)
const hasGame = computed(() => gameStore.hasGames)

/** Scene A: no API key */
const showNoKey = computed(() => !hasApiKey.value)

/** Scene B: has key, no game */
const showNoGame = computed(() => hasApiKey.value && !hasGame.value)

/** Scene C: ready */
const showReady = computed(() => hasApiKey.value && hasGame.value)

const isDisabled = computed(() => isGenerating.value || analyzing.value)

function handleOpenSettings() {
  emit('open-settings')
}

function handleOpenGameManager() {
  emit('open-game-manager')
}

async function handleGenerate() {
  emit('generate')
  await generateScript()
}

function handleAnalyzeClick() {
  emit('analyze-video')
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*'
  input.onchange = () => {
    const file = input.files?.[0]
    if (file) analyzeVideo(file)
  }
  input.click()
}
</script>

<template>
  <div
    class="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center"
  >
    <!-- Scene A: no API key -->
    <div
      v-if="showNoKey"
      class="flex max-w-sm flex-col items-center gap-4"
    >
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        开始使用脚本工作台
      </h3>
      <p class="text-sm text-muted-foreground">
        配置 OpenRouter API Key 后即可生成买量视频脚本
      </p>
      <BaseButton variant="brand" @click="handleOpenSettings">
        配置 API
      </BaseButton>
    </div>

    <!-- Scene B: has key, no game -->
    <div
      v-else-if="showNoGame"
      class="flex max-w-sm flex-col items-center gap-4"
    >
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        添加你的第一个游戏
      </h3>
      <div class="flex gap-2">
        <BaseButton variant="brand" @click="handleOpenGameManager">
          添加游戏
        </BaseButton>
        <BaseButton variant="outline" @click="handleOpenGameManager">
          跳过
        </BaseButton>
      </div>
    </div>

    <!-- Scene C: ready -->
    <div
      v-else-if="showReady"
      class="flex max-w-sm flex-col items-center gap-6"
    >
      <Clapperboard
        :size="48"
        class="text-muted-foreground/50 shrink-0"
        aria-hidden="true"
      />
      <p class="text-sm font-medium text-muted-foreground">
        钩子优先 — 前3秒决定一切
      </p>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <BaseButton
          variant="brand"
          :disabled="isDisabled"
          :loading="isGenerating"
          @click="handleGenerate"
        >
          生成脚本
        </BaseButton>
        <BaseButton
          variant="brand"
          :disabled="isDisabled"
          :loading="analyzing"
          @click="handleAnalyzeClick"
        >
          分析视频
        </BaseButton>
      </div>
      <QuickActions :disabled="isDisabled" />
      <p class="text-xs text-muted-foreground/70">
        选择游戏与配置后，点击生成或上传视频分析
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>

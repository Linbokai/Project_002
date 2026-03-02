<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import { Clapperboard } from 'lucide-vue-next'
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
      class="flex max-w-md flex-col items-center gap-4"
    >
      <Clapperboard
        :size="48"
        class="text-muted-foreground/50 shrink-0"
        aria-hidden="true"
      />
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        欢迎使用买量脚本工作台
      </h3>
      <p class="text-sm text-center text-muted-foreground">
        本工具使用 AI 帮你写买量视频脚本。<br />需要先配置一个 AI 接口才能使用。
      </p>
      <BaseButton variant="brand" @click="handleOpenSettings">
        配置 AI 接口
      </BaseButton>
      <a
        href="https://openrouter.ai/keys"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-muted-foreground underline hover:text-foreground"
      >不知道怎么获取？点击查看教程</a>
    </div>

    <!-- Scene B: has key, no game -->
    <div
      v-else-if="showNoGame"
      class="flex max-w-md flex-col items-center gap-4"
    >
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        添加你要推广的游戏
      </h3>
      <p class="text-sm text-center text-muted-foreground">
        添加游戏信息后，AI 生成的脚本会更贴合你的游戏。
      </p>
      <div class="flex gap-2">
        <BaseButton variant="brand" @click="handleOpenGameManager">
          添加游戏
        </BaseButton>
        <BaseButton
          variant="outline"
          title="你可以随时在右上角「游戏库」中添加"
          @click="handleOpenGameManager"
        >
          稍后再说
        </BaseButton>
      </div>
      <p class="text-xs text-muted-foreground/70">
        你可以随时在右上角「游戏库」中添加
      </p>
    </div>

    <!-- Scene C: ready -->
    <div
      v-else-if="showReady"
      class="flex max-w-md flex-col items-center gap-6"
    >
      <Clapperboard
        :size="48"
        class="text-muted-foreground/50 shrink-0"
        aria-hidden="true"
      />
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        一切就绪，两种用法
      </h3>
      <div class="flex w-full flex-col gap-3">
        <div class="rounded-lg border bg-muted/30 p-4">
          <div class="mb-1 text-sm font-medium">1. 从零生成脚本</div>
          <p class="text-xs text-muted-foreground">在左侧配置好参数，点击下方「生成脚本」按钮</p>
        </div>
        <div class="rounded-lg border bg-muted/30 p-4">
          <div class="mb-1 text-sm font-medium">2. 分析已有视频</div>
          <p class="text-xs text-muted-foreground">上传一个买量视频，AI 帮你分析优缺点并给出优化建议</p>
        </div>
      </div>
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
          variant="outline"
          :disabled="isDisabled"
          :loading="analyzing"
          @click="handleAnalyzeClick"
        >
          上传视频分析
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

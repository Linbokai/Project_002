<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import { Clapperboard, Sparkles, Video, ArrowDown } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings-store'
import { useGameStore } from '@/stores/game-store'

const emit = defineEmits<{
  'open-settings': []
  'open-game-manager': []
}>()

const settingsStore = useSettingsStore()
const gameStore = useGameStore()

const hasApiKey = computed(() => settingsStore.hasApiKey)
const hasGame = computed(() => gameStore.hasGames)

const showNoKey = computed(() => !hasApiKey.value)
const showNoGame = computed(() => hasApiKey.value && !hasGame.value)
const showReady = computed(() => hasApiKey.value && hasGame.value)
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
      <BaseButton variant="brand" @click="emit('open-settings')">
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
        <BaseButton variant="brand" @click="emit('open-game-manager')">
          添加游戏
        </BaseButton>
        <BaseButton
          variant="outline"
          title="你可以随时在右上角「游戏库」中添加"
          @click="emit('open-game-manager')"
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
        一切就绪，开始创作
      </h3>
      <div class="flex w-full flex-col gap-3">
        <div class="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-left">
          <Sparkles :size="18" class="mt-0.5 shrink-0 text-brand" />
          <div>
            <div class="mb-0.5 text-sm font-medium">从零生成脚本</div>
            <p class="text-xs text-muted-foreground">在左侧配置好参数，点击下方「生成脚本」按钮</p>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-left">
          <Video :size="18" class="mt-0.5 shrink-0 text-brand" />
          <div>
            <div class="mb-0.5 text-sm font-medium">分析已有视频</div>
            <p class="text-xs text-muted-foreground">上传一个买量视频，AI 帮你分析优缺点并给出优化建议</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1.5 text-xs text-muted-foreground/60">
        <ArrowDown :size="14" />
        <span>使用下方操作栏开始</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import TemplateCard from '@/components/business/templates/template-card.vue'
import { Clapperboard, Sparkles, Video, ArrowDown, LayoutGrid, Zap, ChevronRight } from 'lucide-vue-next'
import { useSettingsStore } from '@/stores/settings-store'
import { useGameStore } from '@/stores/game-store'
import { useTemplateStore } from '@/stores/template-store'
import { useConfigStore } from '@/stores/config-store'
import { useSmartConfig } from '@/composables/use-smart-config'
import type { ScriptTemplate, UserTemplate } from '@/models/types'

const emit = defineEmits<{
  'open-settings': []
  'open-game-manager': []
  'apply-template': [template: ScriptTemplate | UserTemplate]
  'open-templates': []
}>()

const settingsStore = useSettingsStore()
const gameStore = useGameStore()
const templateStore = useTemplateStore()
const configStore = useConfigStore()
const { getSmartConfig, getPresetKeys } = useSmartConfig()

const hasApiKey = computed(() => settingsStore.hasApiKey)
const hasGame = computed(() => gameStore.hasGames)

const showNoKey = computed(() => !hasApiKey.value)
const showNoGame = computed(() => hasApiKey.value && !hasGame.value)
const showReady = computed(() => hasApiKey.value && hasGame.value)

function startQuickFlow(gameType: string) {
  const preset = getSmartConfig(gameType)
  if (preset) {
    configStore.updateConfig(preset as Partial<import('@/models/types').GenerationConfig>)
  }
}

const displayTemplates = computed(() => {
  return templateStore.quickStartTemplates.slice(0, 6)
})
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
      class="flex max-w-lg flex-col items-center gap-6"
    >
      <Clapperboard
        :size="48"
        class="text-muted-foreground/50 shrink-0"
        aria-hidden="true"
      />
      <h3 class="text-lg font-semibold leading-none tracking-tight">
        一切就绪，开始创作
      </h3>

      <!-- Quick Start: 3-step guide -->
      <div class="flex w-full flex-col gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
        <div class="flex items-center gap-2">
          <Zap :size="16" class="text-brand" />
          <span class="text-sm font-semibold">快速开始</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">1</span>
          <span>选择游戏品类</span>
          <ChevronRight :size="12" class="text-muted-foreground/40" />
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">2</span>
          <span>自动配置参数</span>
          <ChevronRight :size="12" class="text-muted-foreground/40" />
          <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">3</span>
          <span>一键生成</span>
        </div>
        <div class="flex flex-wrap gap-1.5 mt-1">
          <button
            v-for="key in getPresetKeys()"
            :key="key"
            type="button"
            class="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium hover:border-brand/40 hover:bg-brand/5 transition-colors"
            @click="startQuickFlow(key)"
          >
            {{ key }}
          </button>
        </div>
      </div>

      <!-- Templates -->
      <div class="flex w-full flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">推荐模板</span>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-brand transition-colors"
            @click="emit('open-templates')"
          >
            <LayoutGrid :size="12" />
            全部模板
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <TemplateCard
            v-for="tpl in displayTemplates"
            :key="tpl.id"
            :template="tpl"
            compact
            @apply="emit('apply-template', tpl)"
          />
        </div>
      </div>

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

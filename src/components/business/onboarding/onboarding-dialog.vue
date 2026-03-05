<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clapperboard, Key, Gamepad2, LayoutGrid, ChevronRight, ChevronLeft, X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/base-button.vue'
import BaseDialog from '@/components/ui/base-dialog.vue'
import TemplateCard from '@/components/business/templates/template-card.vue'
import { useSettingsStore } from '@/stores/settings-store'
import { useGameStore } from '@/stores/game-store'
import { useTemplateStore } from '@/stores/template-store'
import type { ScriptTemplate, UserTemplate } from '@/models/types'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'open-api-settings': []
  'open-game-manager': []
  'apply-template': [template: ScriptTemplate | UserTemplate]
}>()

const settingsStore = useSettingsStore()
const gameStore = useGameStore()
const templateStore = useTemplateStore()

const currentStep = ref(0)

const steps = computed(() => [
  {
    icon: Clapperboard,
    title: '欢迎使用买量脚本工作台',
    description: 'AI 驱动的买量视频脚本生成工具，帮你快速产出高质量脚本。',
  },
  {
    icon: Key,
    title: '配置 AI 接口',
    description: '需要一个 OpenRouter API Key 来调用 AI 模型。',
    action: '配置 API Key',
    actionDone: settingsStore.hasApiKey,
    doneText: '已配置',
  },
  {
    icon: Gamepad2,
    title: '添加你的游戏',
    description: '添加游戏信息后，生成的脚本会更贴合你的产品。',
    action: '添加游戏',
    actionDone: gameStore.hasGames,
    doneText: '已添加',
    skippable: true,
  },
  {
    icon: LayoutGrid,
    title: '选择模板，快速开始',
    description: '点击一个模板即可一键填充配置，然后生成你的第一个脚本。',
  },
])

const step = computed(() => steps.value[currentStep.value]!)
const isLastStep = computed(() => currentStep.value === steps.value.length - 1)
const isFirstStep = computed(() => currentStep.value === 0)

function next() {
  if (isLastStep.value) {
    emit('close')
    return
  }
  currentStep.value++
}

function prev() {
  if (currentStep.value > 0) currentStep.value--
}

function handleAction() {
  if (currentStep.value === 1) emit('open-api-settings')
  if (currentStep.value === 2) emit('open-game-manager')
}

function handleApplyTemplate(tpl: ScriptTemplate | UserTemplate) {
  emit('apply-template', tpl)
  emit('close')
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            v-for="(_, idx) in steps"
            :key="idx"
            class="h-1.5 rounded-full transition-all duration-300"
            :class="[
              idx === currentStep ? 'w-6 bg-brand' : 'w-1.5',
              idx < currentStep ? 'bg-brand/40' : idx > currentStep ? 'bg-muted-foreground/20' : '',
            ]"
          />
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          @click="emit('close')"
        >
          <X :size="18" />
        </button>
      </div>
    </template>

    <div class="flex flex-col items-center gap-5 py-2 text-center">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
        <component :is="step.icon" :size="28" class="text-brand" />
      </div>
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-semibold">{{ step.title }}</h3>
        <p class="text-sm text-muted-foreground">{{ step.description }}</p>
      </div>

      <!-- Step 1/2: Action button -->
      <template v-if="currentStep === 1 || currentStep === 2">
        <div v-if="step.actionDone" class="flex items-center gap-2 rounded-lg bg-brand/8 px-4 py-2 text-sm font-medium text-brand">
          ✓ {{ step.doneText }}
        </div>
        <BaseButton v-else variant="brand" @click="handleAction">
          {{ step.action }}
        </BaseButton>
        <a
          v-if="currentStep === 1"
          href="https://openrouter.ai/keys"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-muted-foreground underline hover:text-foreground"
        >不知道怎么获取 API Key？</a>
      </template>

      <!-- Step 3: Template cards -->
      <template v-if="currentStep === 3">
        <div class="grid w-full grid-cols-2 gap-2">
          <TemplateCard
            v-for="tpl in templateStore.quickStartTemplates"
            :key="tpl.id"
            :template="tpl"
            compact
            @apply="handleApplyTemplate(tpl)"
          />
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <BaseButton
          v-if="!isFirstStep"
          variant="ghost"
          size="sm"
          @click="prev"
        >
          <ChevronLeft :size="16" />
          上一步
        </BaseButton>
        <span v-else />
        <div class="flex items-center gap-2">
          <BaseButton
            v-if="!isLastStep"
            variant="ghost"
            size="sm"
            @click="emit('close')"
          >
            跳过引导
          </BaseButton>
          <BaseButton
            :variant="isLastStep ? 'brand' : 'outline'"
            size="sm"
            @click="next"
          >
            {{ isLastStep ? '开始使用' : '下一步' }}
            <ChevronRight v-if="!isLastStep" :size="16" />
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseDialog>
</template>

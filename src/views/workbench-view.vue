<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import ConfigPanel from '@/components/business/layout/config-panel.vue'
import AppHeader from '@/components/business/layout/app-header.vue'
import ChatArea from '@/components/business/chat/chat-area.vue'
import ChatInput from '@/components/business/chat/chat-input.vue'
import BaseToast from '@/components/ui/base-toast.vue'

const ApiConfigDialog = defineAsyncComponent(() => import('@/components/business/modals/api-config-dialog.vue'))
const GameManagerDialog = defineAsyncComponent(() => import('@/components/business/modals/game-manager-dialog.vue'))
const HistoryPanel = defineAsyncComponent(() => import('@/components/business/modals/history-panel.vue'))
const TemplateGallery = defineAsyncComponent(() => import('@/components/business/templates/template-gallery.vue'))
const SaveTemplateDialog = defineAsyncComponent(() => import('@/components/business/templates/save-template-dialog.vue'))
const OnboardingDialog = defineAsyncComponent(() => import('@/components/business/onboarding/onboarding-dialog.vue'))
import BaseDrawer from '@/components/ui/base-drawer.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useBreakpoints } from '@/composables/use-media-query'
import { useHistoryStore } from '@/stores/history-store'
import { useChatStore } from '@/stores/chat-store'
import { useImageStore } from '@/stores/image-store'
import { useConfigStore } from '@/stores/config-store'
import { useTemplateStore } from '@/stores/template-store'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem } from '@/utils'
import type { ScriptTemplate, UserTemplate, TemplateConfig } from '@/models/types'

const { isMobile } = useBreakpoints()
const panelCollapsed = ref(false)
const drawerOpen = ref(false)
const historyOpen = ref(false)
const apiSettingsOpen = ref(false)
const gameManagerOpen = ref(false)
const templateGalleryOpen = ref(false)
const saveTemplateOpen = ref(false)

const onboardingDone = getItem<boolean>(STORAGE_KEYS.ONBOARDING_DONE, false)
const onboardingOpen = ref(!onboardingDone)

function closeOnboarding() {
  onboardingOpen.value = false
  setItem(STORAGE_KEYS.ONBOARDING_DONE, true)
}

const configStore = useConfigStore()
const templateStore = useTemplateStore()

function applyTemplate(tpl: ScriptTemplate | UserTemplate) {
  const partial: Record<string, unknown> = { ...tpl.config }
  if ('recommendedThemeIds' in tpl && tpl.recommendedThemeIds?.length) {
    partial.selectedThemes = tpl.recommendedThemeIds
  }
  if ('recommendedSellTags' in tpl && tpl.recommendedSellTags?.length) {
    partial.selectedSellTags = tpl.recommendedSellTags
  }
  configStore.updateConfig(partial as Partial<import('@/models/types').GenerationConfig>)
  templateGalleryOpen.value = false
}

function handleSaveTemplate(name: string, description: string) {
  const cfg = configStore.config
  const config: TemplateConfig = {
    direction: cfg.direction,
    duration: cfg.duration,
    aspectRatio: cfg.aspectRatio,
    scriptType: cfg.scriptType,
    audience: cfg.audience,
    ueContentType: cfg.ueContentType,
  }
  templateStore.saveUserTemplate(name, description, config)
}

function handleOpenHistory() {
  historyOpen.value = true
}

function handleOpenApiSettings() {
  apiSettingsOpen.value = true
}

function handleOpenGameManager() {
  gameManagerOpen.value = true
}

const historyStore = useHistoryStore()
const chatStore = useChatStore()
const imageStore = useImageStore()

async function handleLoadSession(id: string) {
  const session = historyStore.getSession(id)
  if (!session) return
  chatStore.clearMessages()
  chatStore.currentSessionId = id
  session.messages.forEach((m) => chatStore.addMessage(m))
  await imageStore.loadSession(id)
  historyOpen.value = false
}
</script>

<template>
  <BaseToast>
    <div class="flex h-screen flex-col overflow-hidden">
    <div class="flex flex-1 overflow-hidden">
      <template v-if="!isMobile">
        <ConfigPanel
          :collapsed="panelCollapsed"
          @open-templates="templateGalleryOpen = true"
          @save-template="saveTemplateOpen = true"
        />
        <button
          class="flex w-4 shrink-0 items-center justify-center border-r border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          :title="panelCollapsed ? '展开面板' : '收起面板'"
          @click="panelCollapsed = !panelCollapsed"
        >
          <ChevronRight v-if="panelCollapsed" :size="14" />
          <ChevronLeft v-else :size="14" />
        </button>
      </template>
      <BaseDrawer v-else :open="drawerOpen" @close="drawerOpen = false">
        <ConfigPanel
          @open-templates="templateGalleryOpen = true; drawerOpen = false"
          @save-template="saveTemplateOpen = true; drawerOpen = false"
        />
      </BaseDrawer>
      <div class="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          @new-session="chatStore.clearMessages(); imageStore.clearAll()"
          @open-history="handleOpenHistory"
          @open-api-settings="handleOpenApiSettings"
          @open-game-manager="handleOpenGameManager"
          @toggle-panel="drawerOpen = !drawerOpen"
        />
        <ChatArea
          @open-settings="handleOpenApiSettings"
          @open-game-manager="handleOpenGameManager"
          @apply-template="applyTemplate"
          @open-templates="templateGalleryOpen = true"
        />
        <ChatInput />
      </div>
    </div>

    <HistoryPanel
      v-if="historyOpen"
      :open="historyOpen"
      @close="historyOpen = false"
      @load-session="handleLoadSession"
    />
    <ApiConfigDialog v-if="apiSettingsOpen" :open="apiSettingsOpen" @close="apiSettingsOpen = false" />
    <GameManagerDialog v-if="gameManagerOpen" :open="gameManagerOpen" @close="gameManagerOpen = false" />
    <TemplateGallery v-if="templateGalleryOpen" :open="templateGalleryOpen" @close="templateGalleryOpen = false" @apply="applyTemplate" />
    <SaveTemplateDialog v-if="saveTemplateOpen" :open="saveTemplateOpen" @close="saveTemplateOpen = false" @save="handleSaveTemplate" />
    <OnboardingDialog
      v-if="onboardingOpen"
      :open="onboardingOpen"
      @close="closeOnboarding"
      @open-api-settings="handleOpenApiSettings"
      @open-game-manager="handleOpenGameManager"
      @apply-template="(tpl) => { applyTemplate(tpl); closeOnboarding() }"
    />
    </div>
  </BaseToast>
</template>

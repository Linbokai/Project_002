<script setup lang="ts">
import { ref } from 'vue'
import IconSidebar from '@/components/business/layout/icon-sidebar.vue'
import AppHeader from '@/components/business/layout/app-header.vue'
import ChatArea from '@/components/business/chat/chat-area.vue'
import ChatInput from '@/components/business/chat/chat-input.vue'
import ApiConfigDialog from '@/components/business/modals/api-config-dialog.vue'
import GameManagerDialog from '@/components/business/modals/game-manager-dialog.vue'
import ConfigDialog from '@/components/business/modals/config-dialog.vue'
import HistoryPanel from '@/components/business/modals/history-panel.vue'
import ThemePanelOverlay from '@/components/business/theme-radar/theme-panel-overlay.vue'
import BaseToast from '@/components/ui/base-toast.vue'
import { useHistoryStore } from '@/stores/history-store'
import { useChatStore } from '@/stores/chat-store'

const configOpen = ref(false)
const historyOpen = ref(false)
const apiSettingsOpen = ref(false)
const gameManagerOpen = ref(false)
const themePanelOpen = ref(false)
const themePanelType = ref<'search' | 't1' | 't2' | 't3' | 'add' | null>(null)

function handleOpenPanel(type: 'search' | 't1' | 't2' | 't3' | 'add') {
  themePanelType.value = type
  themePanelOpen.value = true
}

function handleOpenConfig() {
  configOpen.value = true
}

function handleOpenHistory() {
  historyOpen.value = true
}

function handleOpenApiSettings() {
  apiSettingsOpen.value = true
}

function handleOpenSettings() {
  apiSettingsOpen.value = true
}

function handleOpenGameManager() {
  gameManagerOpen.value = true
}

const historyStore = useHistoryStore()
const chatStore = useChatStore()

function handleLoadSession(id: string) {
  const session = historyStore.getSession(id)
  if (!session) return
  chatStore.clearMessages()
  session.messages.forEach((m) => chatStore.addMessage(m))
  historyOpen.value = false
}
</script>

<template>
  <BaseToast>
    <div class="flex h-screen flex-col overflow-hidden">
    <div class="flex flex-1 overflow-hidden">
      <IconSidebar @open-panel="handleOpenPanel" />
      <div class="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          @open-config="handleOpenConfig"
          @open-history="handleOpenHistory"
          @open-api-settings="handleOpenApiSettings"
          @open-game-manager="handleOpenGameManager"
        />
        <ChatArea
          @open-settings="handleOpenSettings"
          @open-game-manager="handleOpenGameManager"
        />
        <ChatInput />
      </div>
    </div>

    <ConfigDialog v-if="configOpen" :open="configOpen" @close="configOpen = false" />
    <HistoryPanel
      v-if="historyOpen"
      :open="historyOpen"
      @close="historyOpen = false"
      @load-session="handleLoadSession"
    />
    <ApiConfigDialog v-if="apiSettingsOpen" :open="apiSettingsOpen" @close="apiSettingsOpen = false" />
    <GameManagerDialog v-if="gameManagerOpen" :open="gameManagerOpen" @close="gameManagerOpen = false" />
    <ThemePanelOverlay
      v-if="themePanelOpen && themePanelType"
      :open="themePanelOpen"
      :initial-view="themePanelType"
      @close="themePanelOpen = false"
    />
    </div>
  </BaseToast>
</template>

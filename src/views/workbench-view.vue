<script setup lang="ts">
import { ref } from 'vue'
import ConfigPanel from '@/components/business/layout/config-panel.vue'
import AppHeader from '@/components/business/layout/app-header.vue'
import ChatArea from '@/components/business/chat/chat-area.vue'
import ChatInput from '@/components/business/chat/chat-input.vue'
import ApiConfigDialog from '@/components/business/modals/api-config-dialog.vue'
import GameManagerDialog from '@/components/business/modals/game-manager-dialog.vue'
import HistoryPanel from '@/components/business/modals/history-panel.vue'
import BaseToast from '@/components/ui/base-toast.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useHistoryStore } from '@/stores/history-store'
import { useChatStore } from '@/stores/chat-store'
import { useImageStore } from '@/stores/image-store'

const panelCollapsed = ref(false)
const historyOpen = ref(false)
const apiSettingsOpen = ref(false)
const gameManagerOpen = ref(false)

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
      <ConfigPanel :collapsed="panelCollapsed" />
      <button
        class="flex w-4 shrink-0 items-center justify-center border-r border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        :title="panelCollapsed ? '展开面板' : '收起面板'"
        @click="panelCollapsed = !panelCollapsed"
      >
        <ChevronRight v-if="panelCollapsed" :size="14" />
        <ChevronLeft v-else :size="14" />
      </button>
      <div class="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          @new-session="chatStore.clearMessages(); imageStore.clearAll()"
          @open-history="handleOpenHistory"
          @open-api-settings="handleOpenApiSettings"
          @open-game-manager="handleOpenGameManager"
        />
        <ChatArea
          @open-settings="handleOpenApiSettings"
          @open-game-manager="handleOpenGameManager"
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
    </div>
  </BaseToast>
</template>

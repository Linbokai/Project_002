<script setup lang="ts">
import { History, Key, Gamepad2 } from 'lucide-vue-next'
import { APP_NAME } from '@/constants'
import { useSettingsStore } from '@/stores/settings-store'
import ThemeToggle from '@/components/ui/theme-toggle.vue'
import BaseButton from '@/components/ui/base-button.vue'

const emit = defineEmits<{
  'open-history': []
  'open-api-settings': []
  'open-game-manager': []
}>()

const settingsStore = useSettingsStore()

function openHistory() {
  emit('open-history')
}

function openApiSettings() {
  emit('open-api-settings')
}

function openGameManager() {
  emit('open-game-manager')
}
</script>

<template>
  <header
    class="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl"
  >
    <span class="shrink-0 text-sm font-semibold">{{ APP_NAME }}</span>
    <div class="flex-1" />
    <div class="flex shrink-0 items-center gap-1">
      <BaseButton
        variant="ghost"
        size="icon"
        title="游戏库管理"
        aria-label="游戏库管理"
        @click="openGameManager"
      >
        <Gamepad2 :size="16" />
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="icon"
        title="历史记录"
        aria-label="历史记录"
        @click="openHistory"
      >
        <History :size="16" />
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="icon"
        title="AI 接口配置"
        :aria-label="settingsStore.hasApiKey ? 'AI 接口配置' : 'AI 接口配置（未配置）'"
        @click="openApiSettings"
      >
        <span class="relative">
          <Key :size="16" />
          <span
            v-if="!settingsStore.hasApiKey"
            class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive"
            aria-hidden="true"
          />
        </span>
      </BaseButton>
      <ThemeToggle />
    </div>
  </header>
</template>

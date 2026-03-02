<script setup lang="ts">
import { computed } from 'vue'
import { Settings, History, Key, Gamepad2 } from 'lucide-vue-next'
import { APP_NAME } from '@/constants'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import ThemeToggle from '@/components/ui/theme-toggle.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseBadge from '@/components/ui/base-badge.vue'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { AudienceType } from '@/models/enums'

const emit = defineEmits<{
  'open-config': []
  'open-history': []
  'open-api-settings': []
  'open-game-manager': []
}>()

const configStore = useConfigStore()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const themeRadarStore = useThemeRadarStore()

const gameName = computed(() => gameStore.currentGame?.name ?? null)
const durationLabel = computed(() => `${configStore.config.duration}s`)
const scriptTypeLabel = computed(() => {
  const found = SCRIPT_TYPES.find((t) => t.id === configStore.config.scriptType)
  return found?.name ?? ''
})
const audienceLabel = computed(() => {
  if (configStore.config.audience === AudienceType.Custom) {
    return configStore.config.customAudience || '自定义'
  }
  const found = AUDIENCE_PROFILES.find(
    (p) => p.id === configStore.config.audience,
  )
  return found?.label ?? ''
})
const themesCount = computed(() => themeRadarStore.totalSelected)

function openConfig() {
  emit('open-config')
}

function openHistory() {
  emit('open-history')
}

function openApiSettings() {
  emit('open-api-settings')
}

function openGameManager() {
  emit('open-game-manager')
}

function openConfigFromPills() {
  emit('open-config')
}
</script>

<template>
  <header
    class="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl"
  >
    <span class="shrink-0 text-sm font-semibold">{{ APP_NAME }}</span>
    <div
      class="flex min-w-0 flex-1 flex-wrap items-center gap-2"
      role="button"
      tabindex="0"
      aria-label="点击打开配置"
      @click="openConfigFromPills"
      @keydown.enter="openConfigFromPills"
      @keydown.space.prevent="openConfigFromPills"
    >
      <BaseBadge v-if="gameName" variant="secondary">{{ gameName }}</BaseBadge>
      <BaseBadge variant="secondary">{{ durationLabel }}</BaseBadge>
      <BaseBadge v-if="scriptTypeLabel" variant="secondary">
        {{ scriptTypeLabel }}
      </BaseBadge>
      <BaseBadge v-if="audienceLabel" variant="secondary">
        {{ audienceLabel }}
      </BaseBadge>
      <BaseBadge v-if="themesCount > 0" variant="brand">
        {{ themesCount }}个主题
      </BaseBadge>
    </div>
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
        title="配置"
        aria-label="配置"
        @click="openConfig"
      >
        <Settings :size="16" />
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="icon"
        title="历史"
        aria-label="历史"
        @click="openHistory"
      >
        <History :size="16" />
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="icon"
        title="API 配置"
        :aria-label="settingsStore.hasApiKey ? 'API 配置' : 'API 配置（未配置）'"
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

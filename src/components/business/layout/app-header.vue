<script setup lang="ts">
import { computed } from 'vue'
import { History, Key, Gamepad2, RefreshCw } from 'lucide-vue-next'
import { APP_NAME } from '@/constants'
import { useSettingsStore } from '@/stores/settings-store'
import { useBalance } from '@/composables/use-balance'
import ThemeToggle from '@/components/ui/theme-toggle.vue'
import BaseButton from '@/components/ui/base-button.vue'

const emit = defineEmits<{
  'open-history': []
  'open-api-settings': []
  'open-game-manager': []
}>()

const settingsStore = useSettingsStore()
const { keyInfo, loading, refresh } = useBalance()

const balanceText = computed(() => {
  if (!keyInfo.value) return null
  const info = keyInfo.value
  if (info.limit != null && info.limitRemaining != null) {
    return `$${info.limitRemaining.toFixed(2)}`
  }
  return `$${info.usage.toFixed(2)}`
})

const balanceTooltip = computed(() => {
  if (!keyInfo.value) return ''
  const info = keyInfo.value
  const lines: string[] = []
  if (info.limit != null && info.limitRemaining != null) {
    lines.push(`剩余额度: $${info.limitRemaining.toFixed(4)}`)
    lines.push(`额度上限: $${info.limit.toFixed(2)}`)
  }
  lines.push(`累计用量: $${info.usage.toFixed(4)}`)
  lines.push(`今日用量: $${info.usageDaily.toFixed(4)}`)
  lines.push(`本月用量: $${info.usageMonthly.toFixed(4)}`)
  if (info.isFreeTier) lines.push('（免费额度）')
  return lines.join('\n')
})

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
      <div
        v-if="balanceText"
        class="mr-1 flex items-center gap-1 rounded-md border border-border px-2 py-0.5"
        :title="balanceTooltip"
      >
        <span class="text-xs text-muted-foreground">余额</span>
        <span class="text-xs font-medium tabular-nums">{{ balanceText }}</span>
        <button
          class="inline-flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          :disabled="loading"
          aria-label="刷新余额"
          @click="refresh"
        >
          <RefreshCw :size="10" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
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

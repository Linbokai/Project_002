<script setup lang="ts">
import { ref } from 'vue'
import { Search } from 'lucide-vue-next'
import BaseButton from '@/components/ui/base-button.vue'
import { useThemeSearch } from '@/composables/use-theme-search'
import { useToast } from '@/composables/use-toast'
import { useSettingsStore } from '@/stores/settings-store'
import { copyToClipboard } from '@/utils'

const { searchHotTopics, isSearching, getPromptForManualMode } = useThemeSearch()
const toast = useToast()
const settingsStore = useSettingsStore()

const errorMessage = ref('')

async function handleSearch() {
  errorMessage.value = ''
  try {
    if (!settingsStore.config.openRouterKey) {
      errorMessage.value = '请先配置 API Key'
      toast.showToast('请先配置 API Key', 'destructive')
      return
    }
    await searchHotTopics()
  } catch (e) {
    const msg = e instanceof Error ? e.message : '搜索失败'
    errorMessage.value = msg
    toast.showToast(msg, 'destructive')
  }
}

async function handleOfflineCopy() {
  const prompt = getPromptForManualMode()
  const ok = await copyToClipboard(prompt)
  if (ok) {
    toast.showToast('已复制提示词到剪贴板', 'success')
  } else {
    toast.showToast('复制失败', 'destructive')
  }
}
</script>

<template>
  <div class="space-y-2">
    <BaseButton
      variant="brand"
      class="w-full"
      :loading="isSearching"
      :disabled="isSearching"
      @click="handleSearch"
    >
      <Search :size="16" />
      搜索热点
    </BaseButton>
    <p v-if="errorMessage" class="text-xs text-destructive">
      {{ errorMessage }}
    </p>
    <button
      type="button"
      class="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      @click="handleOfflineCopy"
    >
      离线模式（复制提示词）
    </button>
  </div>
</template>

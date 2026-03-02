<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
import BaseButton from '@/components/ui/base-button.vue'
import { useGameplaySearch } from '@/composables/use-gameplay-search'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { useToast } from '@/composables/use-toast'
import { useSettingsStore } from '@/stores/settings-store'
import { SearchRegion } from '@/models/enums'
import { copyToClipboard } from '@/utils'

const { searchHotGameplays, isSearching, getPromptForManualMode } = useGameplaySearch()
const gameplayRadarStore = useGameplayRadarStore()
const toast = useToast()
const settingsStore = useSettingsStore()

const errorMessage = ref('')

const regionTabs: { value: SearchRegion; label: string }[] = [
  { value: SearchRegion.Domestic, label: '国内' },
  { value: SearchRegion.Overseas, label: '海外' },
]

const searchButtonLabel = computed(() =>
  gameplayRadarStore.region === SearchRegion.Domestic
    ? '搜索国内热门玩法'
    : '搜索海外热门玩法',
)

function handleRegionChange(r: SearchRegion) {
  gameplayRadarStore.setRegion(r)
}

async function handleSearch() {
  errorMessage.value = ''
  try {
    if (!settingsStore.config.openRouterKey) {
      errorMessage.value = '请先配置 API Key'
      toast.showToast('请先配置 API Key', 'destructive')
      return
    }
    await searchHotGameplays()
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
  <div class="space-y-3">
    <div class="flex rounded-lg border border-border bg-muted/30 p-0.5">
      <button
        v-for="tab in regionTabs"
        :key="tab.value"
        type="button"
        class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          gameplayRadarStore.region === tab.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="handleRegionChange(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    <BaseButton
      variant="brand"
      class="w-full"
      :loading="isSearching"
      :disabled="isSearching"
      @click="handleSearch"
    >
      <Search :size="16" />
      {{ searchButtonLabel }}
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

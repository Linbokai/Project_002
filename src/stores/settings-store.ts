import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiConfig } from '@/models/types'
import { STORAGE_KEYS, API_DEFAULTS } from '@/constants'
import { getItem, setItem } from '@/utils'

export const useSettingsStore = defineStore('settings', () => {
  const config = ref<ApiConfig>(
    getItem<ApiConfig>(STORAGE_KEYS.API_CONFIG, {
      openRouterKey: '',
      searchModel: API_DEFAULTS.SEARCH_MODEL,
      genModel: API_DEFAULTS.GEN_MODEL,
      visionModel: API_DEFAULTS.VISION_MODEL,
    }),
  )

  const hasApiKey = computed(() => config.value.openRouterKey.length > 0)

  function updateConfig(partial: Partial<ApiConfig>) {
    config.value = { ...config.value, ...partial }
    setItem(STORAGE_KEYS.API_CONFIG, config.value)
  }

  function getModelForTask(task: 'search' | 'gen' | 'vision'): string {
    switch (task) {
      case 'search': return config.value.searchModel
      case 'gen': return config.value.genModel
      case 'vision': return config.value.visionModel
    }
  }

  return { config, hasApiKey, updateConfig, getModelForTask }
})

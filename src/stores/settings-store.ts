import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiConfig } from '@/models/types'
import { STORAGE_KEYS, API_DEFAULTS } from '@/constants'
import { getItem, setItem } from '@/utils'

export type TaskType = 'search' | 'gen' | 'vision' | 'image'

export const useSettingsStore = defineStore('settings', () => {
  const config = ref<ApiConfig>(
    getItem<ApiConfig>(STORAGE_KEYS.API_CONFIG, {
      openRouterKey: '',
      searchModel: API_DEFAULTS.SEARCH_MODEL,
      genModel: API_DEFAULTS.GEN_MODEL,
      visionModel: API_DEFAULTS.VISION_MODEL,
      imageModel: API_DEFAULTS.IMAGE_MODEL,
    }),
  )

  const hasApiKey = computed(() => config.value.openRouterKey.length > 0)

  function updateConfig(partial: Partial<ApiConfig>) {
    config.value = { ...config.value, ...partial }
    setItem(STORAGE_KEYS.API_CONFIG, config.value)
  }

  function getModelForTask(task: TaskType): string {
    switch (task) {
      case 'search': return config.value.searchModel
      case 'gen': return config.value.genModel
      case 'vision': return config.value.visionModel
      case 'image': return config.value.imageModel
    }
  }

  function updateModel(task: TaskType, modelId: string) {
    const keyMap = {
      search: 'searchModel',
      gen: 'genModel',
      vision: 'visionModel',
      image: 'imageModel',
    } as const
    updateConfig({ [keyMap[task]]: modelId })
  }

  return { config, hasApiKey, updateConfig, getModelForTask, updateModel }
})

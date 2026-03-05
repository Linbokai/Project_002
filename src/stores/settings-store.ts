import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiConfig, TaskType } from '@/models/types'
import { STORAGE_KEYS, API_DEFAULTS } from '@/constants'
import { getItem, setItem } from '@/utils'
import { useModelRoutingStore } from './model-routing-store'

export type { TaskType } from '@/models/types'

export const useSettingsStore = defineStore('settings', () => {
  const config = ref<ApiConfig>(
    getItem<ApiConfig>(STORAGE_KEYS.API_CONFIG, {
      openRouterKey: '',
      searchModel: API_DEFAULTS.SEARCH_MODEL,
      genModel: API_DEFAULTS.GEN_MODEL,
      visionModel: API_DEFAULTS.VISION_MODEL,
      imageModel: API_DEFAULTS.IMAGE_MODEL,
      routingMode: API_DEFAULTS.ROUTING_MODE,
      routingProfile: API_DEFAULTS.ROUTING_PROFILE,
    }),
  )

  const hasApiKey = computed(() => config.value.openRouterKey.length > 0)

  function updateConfig(partial: Partial<ApiConfig>) {
    config.value = { ...config.value, ...partial }
    setItem(STORAGE_KEYS.API_CONFIG, config.value)
  }

  function getModelForTask(task: TaskType): string {
    if (config.value.routingMode === 'auto') {
      const routingStore = useModelRoutingStore()
      const resolved = routingStore.resolvedModels[task]
      if (resolved) return resolved
    }
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

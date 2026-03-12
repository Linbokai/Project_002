import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiConfig, TaskType } from '@/models/types'
import { STORAGE_KEYS, API_DEFAULTS, ARK_DEFAULTS } from '@/constants'
import { getItem, setItem } from '@/utils'

export type { TaskType } from '@/models/types'

export const useSettingsStore = defineStore('settings', () => {
  const config = ref<ApiConfig>(
    getItem<ApiConfig>(STORAGE_KEYS.API_CONFIG, {
      provider: 'ark',
      openRouterKey: '',
      searchModel: API_DEFAULTS.SEARCH_MODEL,
      genModel: API_DEFAULTS.GEN_MODEL,
      visionModel: API_DEFAULTS.VISION_MODEL,
      imageModel: API_DEFAULTS.IMAGE_MODEL,
      routingMode: API_DEFAULTS.ROUTING_MODE,
      routingProfile: API_DEFAULTS.ROUTING_PROFILE,
      arkKey: '',
      arkGenModel: ARK_DEFAULTS.GEN_MODEL,
      arkVisionModel: ARK_DEFAULTS.VISION_MODEL,
      arkImageModel: ARK_DEFAULTS.IMAGE_MODEL,
    }),
  )

  const trialMode = ref(getItem<boolean>(STORAGE_KEYS.TRIAL_MODE, false))
  const trialUsageCount = ref(getItem<number>(STORAGE_KEYS.TRIAL_USAGE, 0))
  const TRIAL_MAX = 5

  const hasApiKey = computed(() => {
    if (config.value.provider === 'ark') return config.value.arkKey.length > 0
    return config.value.openRouterKey.length > 0
  })
  const isTrialMode = computed(() => trialMode.value)
  const trialRemaining = computed(() => Math.max(0, TRIAL_MAX - trialUsageCount.value))
  const canUseTrial = computed(() => trialMode.value && trialRemaining.value > 0)

  function updateConfig(partial: Partial<ApiConfig>) {
    config.value = { ...config.value, ...partial }
    setItem(STORAGE_KEYS.API_CONFIG, config.value)
  }

  function getManualModel(task: TaskType): string {
    if (config.value.provider === 'ark') {
      switch (task) {
        case 'gen':
        case 'search': return config.value.arkGenModel
        case 'vision': return config.value.arkVisionModel
        case 'image': return config.value.arkImageModel
      }
    }
    switch (task) {
      case 'search': return config.value.searchModel
      case 'gen': return config.value.genModel
      case 'vision': return config.value.visionModel
      case 'image': return config.value.imageModel
      default: return config.value.genModel
    }
  }

  function updateModel(task: TaskType, modelId: string) {
    if (config.value.provider === 'ark') {
      const arkKeyMap = {
        search: 'arkGenModel',
        gen: 'arkGenModel',
        vision: 'arkVisionModel',
        image: 'arkImageModel',
      } as const
      updateConfig({ [arkKeyMap[task]]: modelId })
    } else {
      const keyMap = {
        search: 'searchModel',
        gen: 'genModel',
        vision: 'visionModel',
        image: 'imageModel',
      } as const
      updateConfig({ [keyMap[task]]: modelId })
    }
  }

  function enableTrialMode() {
    trialMode.value = true
    setItem(STORAGE_KEYS.TRIAL_MODE, true)
  }

  function consumeTrial() {
    trialUsageCount.value++
    setItem(STORAGE_KEYS.TRIAL_USAGE, trialUsageCount.value)
  }

  function disableTrialMode() {
    trialMode.value = false
    setItem(STORAGE_KEYS.TRIAL_MODE, false)
  }

  return {
    config,
    hasApiKey,
    updateConfig,
    getManualModel,
    updateModel,
    isTrialMode,
    trialRemaining,
    canUseTrial,
    enableTrialMode,
    consumeTrial,
    disableTrialMode,
  }
})

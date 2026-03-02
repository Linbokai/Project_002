import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GenerationConfig } from '@/models/types'
import { VideoDuration, AspectRatio, ScriptType, AudienceType } from '@/models/enums'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem } from '@/utils'

function defaultConfig(): GenerationConfig {
  return {
    gameId: '',
    duration: VideoDuration.S15,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.VoGuide,
    audience: AudienceType.Male2535,
    customAudience: '',
    hero: { mode: 'game', value: '' },
    collabIP: { enabled: false, name: '', info: '' },
    selectedThemes: [],
    selectedSellTags: [],
    additionalRequirements: '',
  }
}

export const useConfigStore = defineStore('config', () => {
  const config = ref<GenerationConfig>(
    getItem<GenerationConfig>(STORAGE_KEYS.GENERATION_CONFIG, defaultConfig()),
  )

  function updateConfig(partial: Partial<GenerationConfig>) {
    config.value = { ...config.value, ...partial }
    setItem(STORAGE_KEYS.GENERATION_CONFIG, config.value)
  }

  function toggleSellTag(tag: string) {
    const idx = config.value.selectedSellTags.indexOf(tag)
    if (idx === -1) {
      config.value.selectedSellTags.push(tag)
    } else {
      config.value.selectedSellTags.splice(idx, 1)
    }
    setItem(STORAGE_KEYS.GENERATION_CONFIG, config.value)
  }

  function toggleTheme(themeId: string) {
    const idx = config.value.selectedThemes.indexOf(themeId)
    if (idx === -1) {
      config.value.selectedThemes.push(themeId)
    } else {
      config.value.selectedThemes.splice(idx, 1)
    }
    setItem(STORAGE_KEYS.GENERATION_CONFIG, config.value)
  }

  function resetConfig() {
    config.value = defaultConfig()
    setItem(STORAGE_KEYS.GENERATION_CONFIG, config.value)
  }

  return { config, updateConfig, toggleSellTag, toggleTheme, resetConfig }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GenerationConfig } from '@/models/types'
import { VideoDuration, AspectRatio, ScriptType, AudienceType, ProductionDirection, UeContentType } from '@/models/enums'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem } from '@/utils'
import { AD_PLATFORMS } from '@/constants/ad-platforms'

function defaultConfig(): GenerationConfig {
  return {
    direction: ProductionDirection.Script2D,
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
    ueContentType: UeContentType.Gameplay,
    selectedGameplays: [],
    referenceNote: '',
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

  function toggleGameplay(gameplayId: string) {
    const idx = config.value.selectedGameplays.indexOf(gameplayId)
    if (idx === -1) {
      config.value.selectedGameplays.push(gameplayId)
    } else {
      config.value.selectedGameplays.splice(idx, 1)
    }
    setItem(STORAGE_KEYS.GENERATION_CONFIG, config.value)
  }

  const platformId = ref<string>(getItem<string>('sg_platform', 'general'))

  function setPlatform(id: string) {
    platformId.value = id
    setItem('sg_platform', id)
  }

  const platformPromptHint = computed(() => {
    const p = AD_PLATFORMS.find((pl) => pl.id === platformId.value)
    return p?.promptHint ?? ''
  })

  function resetConfig() {
    config.value = defaultConfig()
    setItem(STORAGE_KEYS.GENERATION_CONFIG, config.value)
    setPlatform('general')
  }

  return { config, updateConfig, toggleSellTag, toggleTheme, toggleGameplay, resetConfig, platformId, setPlatform, platformPromptHint }
})

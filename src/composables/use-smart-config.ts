import { ProductionDirection, AspectRatio, ScriptType, AudienceType } from '@/models/enums'
import type { GenerationConfig } from '@/models/types'

interface SmartPreset {
  duration: number
  aspectRatio: AspectRatio
  scriptType: ScriptType
  audience: AudienceType
  recommendedThemes: string[]
  recommendedSellTags: string[]
}

const GAME_TYPE_PRESETS: Record<string, SmartPreset> = {
  SLG: {
    duration: 15,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.VoGuide,
    audience: AudienceType.Male2535,
    recommendedThemes: ['tower', 'rescue'],
    recommendedSellTags: ['部落', '跨服战斗'],
  },
  RPG: {
    duration: 15,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.ShowcaseCharacter,
    audience: AudienceType.Male1824,
    recommendedThemes: ['boss', 'bullet'],
    recommendedSellTags: ['角色', '角色收集'],
  },
  MOBA: {
    duration: 15,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.ShowcaseCharacter,
    audience: AudienceType.Male1824,
    recommendedThemes: ['bullet'],
    recommendedSellTags: ['PVP', '战斗(割草)'],
  },
  卡牌: {
    duration: 15,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.VoIntro,
    audience: AudienceType.Male2535,
    recommendedThemes: ['bullet'],
    recommendedSellTags: ['角色收集', '高级许愿'],
  },
  休闲: {
    duration: 5,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.Hook5s,
    audience: AudienceType.General,
    recommendedThemes: ['asmr', 'merge'],
    recommendedSellTags: ['小游戏', '福利'],
  },
  二次元: {
    duration: 15,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.ShowcaseCharacter,
    audience: AudienceType.Male1824,
    recommendedThemes: ['bullet'],
    recommendedSellTags: ['角色', '角色收集'],
  },
  射击: {
    duration: 15,
    aspectRatio: AspectRatio.Landscape,
    scriptType: ScriptType.ShowcaseMap,
    audience: AudienceType.Male1824,
    recommendedThemes: ['survive'],
    recommendedSellTags: ['PVP', '跨服战斗'],
  },
  模拟经营: {
    duration: 30,
    aspectRatio: AspectRatio.Portrait,
    scriptType: ScriptType.VoGuide,
    audience: AudienceType.General,
    recommendedThemes: [],
    recommendedSellTags: ['任务', '冒险'],
  },
}

export function useSmartConfig() {
  function getSmartConfig(gameType: string): Partial<GenerationConfig> | null {
    const key = Object.keys(GAME_TYPE_PRESETS).find(
      (k) => gameType.toUpperCase().includes(k.toUpperCase()) || k.includes(gameType),
    )
    if (!key) return null

    const preset = GAME_TYPE_PRESETS[key]!
    return {
      direction: ProductionDirection.Script2D,
      duration: preset.duration,
      aspectRatio: preset.aspectRatio,
      scriptType: preset.scriptType,
      audience: preset.audience,
      selectedThemes: preset.recommendedThemes,
      selectedSellTags: preset.recommendedSellTags,
    }
  }

  function getPresetKeys(): string[] {
    return Object.keys(GAME_TYPE_PRESETS)
  }

  return {
    getSmartConfig,
    getPresetKeys,
  }
}

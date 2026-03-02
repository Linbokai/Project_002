import type {
  VideoDuration,
  AspectRatio,
  ScriptType,
  AudienceType,
} from '@/models/enums'

export interface HeroConfig {
  mode: 'game' | 'trending' | 'custom'
  value: string
}

export interface CollabIPConfig {
  enabled: boolean
  name: string
  info: string
}

export interface GenerationConfig {
  gameId: string
  duration: VideoDuration
  aspectRatio: AspectRatio
  scriptType: ScriptType
  audience: AudienceType
  customAudience: string
  hero: HeroConfig
  collabIP: CollabIPConfig
  selectedThemes: string[]
  selectedSellTags: string[]
  additionalRequirements: string
}

export interface ApiConfig {
  openRouterKey: string
  searchModel: string
  genModel: string
  visionModel: string
}

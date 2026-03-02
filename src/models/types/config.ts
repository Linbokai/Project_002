import type {
  VideoDuration,
  AspectRatio,
  ScriptType,
  AudienceType,
  ProductionDirection,
  UeContentType,
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
  direction: ProductionDirection
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
  ueContentType: UeContentType
  selectedGameplays: string[]
}

export interface ApiConfig {
  openRouterKey: string
  searchModel: string
  genModel: string
  visionModel: string
}

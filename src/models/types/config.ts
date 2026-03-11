import type {
  VideoDuration,
  AspectRatio,
  ScriptType,
  AudienceType,
  ProductionDirection,
  UeContentType,
} from '@/models/enums'
import type { RoutingMode, RoutingProfile } from './model-routing'

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
  referenceNote: string
}

export interface ApiConfig {
  openRouterKey: string
  searchModel: string
  genModel: string
  visionModel: string
  imageModel: string
  routingMode: RoutingMode
  routingProfile: RoutingProfile
}

export interface KeyInfo {
  label: string
  limit: number | null
  limitRemaining: number | null
  usage: number
  usageDaily: number
  usageMonthly: number
  isFreeTier: boolean
}

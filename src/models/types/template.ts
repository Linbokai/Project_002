import type {
  ProductionDirection,
  AspectRatio,
  ScriptType,
  AudienceType,
  UeContentType,
} from '@/models/enums'

export type TemplateCategory = 'popular' | 'voiceover' | 'showcase' | 'story' | 'ue'

export type GameCategory =
  | 'slg'
  | 'rpg'
  | 'casual'
  | 'card'
  | 'moba'
  | 'acg'
  | 'shooter'
  | 'sim'

export const GAME_CATEGORY_LABELS: Record<GameCategory, string> = {
  slg: 'SLG',
  rpg: 'RPG',
  casual: '休闲',
  card: '卡牌',
  moba: 'MOBA',
  acg: '二次元',
  shooter: '射击',
  sim: '模拟经营',
}

export interface TemplateConfig {
  direction: ProductionDirection
  duration: number
  aspectRatio: AspectRatio
  scriptType: ScriptType
  audience?: AudienceType
  ueContentType?: UeContentType
}

export interface ScriptTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  gameCategory?: GameCategory
  icon: string
  config: TemplateConfig
  preview?: string
  recommendedThemeIds?: string[]
  recommendedSellTags?: string[]
}

export interface UserTemplate {
  id: string
  name: string
  description: string
  config: TemplateConfig
  createdAt: number
}

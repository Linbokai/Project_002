import type {
  ProductionDirection,
  AspectRatio,
  ScriptType,
  AudienceType,
  UeContentType,
} from '@/models/enums'

export type TemplateCategory = 'popular' | 'voiceover' | 'showcase' | 'story' | 'ue'

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
  icon: string
  config: TemplateConfig
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

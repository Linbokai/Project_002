import type { ThemeCategory } from '@/models/enums'

export interface ThemeTopic {
  id: string
  name: string
  desc: string
  tag: string
  heat: string
  hooks: string[]
  cases: string[]
  selected: boolean
}

export interface PresetTheme {
  id: string
  name: string
  tier: 'T1' | 'T2' | 'T3'
  description: string
  category: ThemeCategory
  scenes: string[]
  /** 数据来源：AI 推理 / 平台数据 */
  source?: 'ai' | 'platform'
  /** 热度趋势指标 1-100 */
  trendScore?: number
}

export interface CustomTheme {
  id: string
  name: string
  description: string
  category: ThemeCategory
  selected: boolean
}

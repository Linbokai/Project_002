export interface ScoreDimension {
  key: string
  label: string
  score: number
  comment: string
}

export interface ScriptScore {
  dimensions: ScoreDimension[]
  overall: number
  summary: string
  suggestions: string[]
  generatedAt: number
}

export const SCORE_DIMENSIONS = [
  { key: 'attraction', label: '吸引力', weight: 0.25, description: '前3秒抓眼球的能力' },
  { key: 'rhythm', label: '节奏感', weight: 0.20, description: '叙事节奏是否紧凑流畅' },
  { key: 'sellpoint', label: '卖点覆盖', weight: 0.20, description: '核心卖点展示是否充分' },
  { key: 'cta', label: '行动号召', weight: 0.15, description: '是否有效驱动用户行动' },
  { key: 'creativity', label: '创意度', weight: 0.20, description: '创意新颖度和差异化' },
] as const

export type ScoreDimensionKey = (typeof SCORE_DIMENSIONS)[number]['key']

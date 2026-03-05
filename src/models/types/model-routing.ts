export type TaskType = 'search' | 'gen' | 'vision' | 'image'

export type RoutingMode = 'manual' | 'auto'

export type RoutingProfile = 'balanced' | 'quality' | 'economy'

export interface OpenRouterModelInfo {
  id: string
  name: string
  pricing: { prompt: string; completion: string; image?: string }
  context_length: number
  architecture: { modality: string; tokenizer: string }
  top_provider: { max_completion_tokens: number }
}

export interface ModelScore {
  id: string
  name: string
  qualityScore: number
  costPer1M: number
  finalScore: number
}

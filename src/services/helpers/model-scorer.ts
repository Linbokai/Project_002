import type {
  OpenRouterModelInfo,
  ModelScore,
  RoutingProfile,
  TaskType,
} from '@/models/types'
import { QUALITY_TIERS } from '@/constants/model-quality-tiers'

const SEARCH_PATTERNS = ['perplexity/', ':online']

export function filterModelsByTask(
  models: OpenRouterModelInfo[],
  task: TaskType,
): OpenRouterModelInfo[] {
  const knownSearchIds = Object.keys(QUALITY_TIERS.search ?? {})

  return models.filter((m) => {
    const modality = m.architecture?.modality ?? ''
    switch (task) {
      case 'search':
        return (
          modality.includes('text->text') &&
          (SEARCH_PATTERNS.some((p) => m.id.includes(p)) ||
            knownSearchIds.includes(m.id))
        )
      case 'gen':
        return modality.includes('text->text')
      case 'vision':
        return (
          modality.includes('image->text') ||
          modality.includes('image+text->text')
        )
      case 'image':
        return modality.includes('->image')
    }
  })
}

function computeCostPer1M(model: OpenRouterModelInfo): number {
  const prompt = parseFloat(model.pricing?.prompt ?? '0')
  const completion = parseFloat(model.pricing?.completion ?? '0')
  return ((prompt + completion) / 2) * 1_000_000
}

function getQualityScore(modelId: string, task: TaskType): number {
  return QUALITY_TIERS[task]?.[modelId] ?? 0
}

function estimateQualityFromCost(costPer1M: number): number {
  if (costPer1M <= 0) return 50
  return Math.min(90, 50 + Math.log10(costPer1M + 1) * 25)
}

export function scoreModels(
  models: OpenRouterModelInfo[],
  task: TaskType,
): ModelScore[] {
  return models.map((m) => {
    const costPer1M = computeCostPer1M(m)
    const qualityScore =
      getQualityScore(m.id, task) || estimateQualityFromCost(costPer1M)

    return {
      id: m.id,
      name: m.name,
      qualityScore,
      costPer1M,
      finalScore: 0,
    }
  })
}

function computeFinalScore(
  quality: number,
  costPer1M: number,
  profile: RoutingProfile,
): number {
  switch (profile) {
    case 'quality':
      return quality
    case 'economy':
      return 1000 / (costPer1M + 0.01) + quality * 0.01
    case 'balanced':
      return quality / (costPer1M + 0.1)
  }
}

export function pickBestModel(
  scores: ModelScore[],
  profile: RoutingProfile,
): string {
  if (scores.length === 0) return ''

  const ranked = scores
    .map((s) => ({
      ...s,
      finalScore: computeFinalScore(s.qualityScore, s.costPer1M, profile),
    }))
    .sort((a, b) => b.finalScore - a.finalScore)

  return ranked[0]?.id ?? ''
}

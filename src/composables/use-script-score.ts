import { ref } from 'vue'
import { chatCompletion } from '@/services/api/openrouter-api'
import { useSettingsStore } from '@/stores/settings-store'
import {
  buildScoreSystemPrompt,
  buildScoreUserPrompt,
} from '@/services/helpers/score-prompt-builder'
import type { ScriptScore, ScoreDimension } from '@/models/types/score'
import { SCORE_DIMENSIONS } from '@/models/types/score'

function extractJson(raw: string): string {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1]!.trim()
  const braceMatch = raw.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0]
  return raw.trim()
}

function computeOverall(dimensions: ScoreDimension[]): number {
  let total = 0
  let weightSum = 0
  for (const dim of SCORE_DIMENSIONS) {
    const found = dimensions.find((d) => d.key === dim.key)
    if (found) {
      total += found.score * dim.weight
      weightSum += dim.weight
    }
  }
  return weightSum > 0 ? Math.round(total / weightSum) : 0
}

interface RawScoreResponse {
  dimensions: { key: string; score: number; comment: string }[]
  summary: string
  suggestions: string[]
}

function validateResponse(data: unknown): data is RawScoreResponse {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.dimensions) || typeof obj.summary !== 'string') return false
  if (!Array.isArray(obj.suggestions)) return false
  return obj.dimensions.every(
    (d: unknown) =>
      d &&
      typeof d === 'object' &&
      typeof (d as Record<string, unknown>).key === 'string' &&
      typeof (d as Record<string, unknown>).score === 'number' &&
      typeof (d as Record<string, unknown>).comment === 'string',
  )
}

export function useScriptScore() {
  const loading = ref(false)
  const error = ref('')
  const score = ref<ScriptScore | null>(null)

  async function scoreScript(scriptContent: string): Promise<void> {
    if (!scriptContent.trim()) {
      error.value = '脚本内容为空'
      return
    }

    loading.value = true
    error.value = ''
    score.value = null

    try {
      const settings = useSettingsStore()
      const raw = await chatCompletion({
        config: settings.config,
        model: settings.getModelForTask('gen'),
        messages: [
          { role: 'system', content: buildScoreSystemPrompt() },
          { role: 'user', content: buildScoreUserPrompt(scriptContent) },
        ],
        stream: false,
        maxTokens: 1024,
      })

      const jsonStr = extractJson(raw)
      const parsed: unknown = JSON.parse(jsonStr)

      if (!validateResponse(parsed)) {
        throw new Error('AI 返回的评分格式不正确')
      }

      const dimensions: ScoreDimension[] = SCORE_DIMENSIONS.map((def) => {
        const match = parsed.dimensions.find((d) => d.key === def.key)
        return {
          key: def.key,
          label: def.label,
          score: match ? Math.min(100, Math.max(0, Math.round(match.score))) : 0,
          comment: match?.comment ?? '',
        }
      })

      score.value = {
        dimensions,
        overall: computeOverall(dimensions),
        summary: parsed.summary,
        suggestions: parsed.suggestions.slice(0, 5),
        generatedAt: Date.now(),
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '评分失败，请重试'
    } finally {
      loading.value = false
    }
  }

  function clearScore() {
    score.value = null
    error.value = ''
  }

  return { loading, error, score, scoreScript, clearScore }
}

import { ref, unref } from 'vue'
import { chatCompletion, streamChat } from '@/services/api/openrouter-api'
import { useSettingsStore } from '@/stores/settings-store'
import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useHistoryStore } from '@/stores/history-store'
import { useImageStore } from '@/stores/image-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import {
  buildScoreSystemPrompt,
  buildScoreUserPrompt,
} from '@/services/helpers/score-prompt-builder'
import type { ScriptScore, ScoreDimension } from '@/models/types/score'
import { SCORE_DIMENSIONS } from '@/models/types/score'
import { MessageType, ProductionDirection } from '@/models/enums'
import { useToast } from '@/composables/use-toast'

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

function buildOptimizePrompt(original: string, suggestions: string[]): string {
  return `你是一个资深的游戏买量脚本优化专家。

## 原始脚本
${original}

## 需要优化的方面
${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

## 要求
1. 保持原脚本的整体结构和长度
2. 针对以上每个建议进行具体优化
3. 用【已优化】标注你改动的部分
4. 最后简要说明你做了哪些改动

请输出优化后的完整脚本：`
}

export function useScriptScore() {
  const loading = ref(false)
  const error = ref('')
  const score = ref<ScriptScore | null>(null)
  const chatStore = useChatStore()
  const settingsStore = useSettingsStore()
  const configStore = useConfigStore()
  const gameStore = useGameStore()
  const historyStore = useHistoryStore()
  const imageStore = useImageStore()
  const themeRadarStore = useThemeRadarStore()
  const gameplayRadarStore = useGameplayRadarStore()
  const { showToast } = useToast()

  function saveSession() {
    const msgs = [...chatStore.messages]
    if (msgs.length === 0) return
    const gameName = unref(gameStore.currentGame)?.name ?? ''
    const isUe = unref(configStore.config).direction === ProductionDirection.UeGameplay
    const themes = isUe
      ? gameplayRadarStore.getAllSelectedNames().join('、')
      : themeRadarStore.getAllSelectedNames().join('、')
    const firstUser = msgs.find((m) => m.role === 'user')
    const preview = firstUser?.content.slice(0, 80) ?? ''
    if (chatStore.currentSessionId) {
      historyStore.updateSession(chatStore.currentSessionId, { messages: msgs, preview, themes })
      imageStore.persistToSession(chatStore.currentSessionId)
    } else {
      const id = historyStore.addSession({ messages: msgs, gameName, themes, preview })
      chatStore.currentSessionId = id
      imageStore.bindSession(id)
      imageStore.persistToSession(id)
    }
  }

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

  async function optimizeScript(originalScript: string, suggestions: string[]): Promise<void> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      showToast('请先配置 API Key', 'destructive')
      return
    }
    const model = settingsStore.getModelForTask('gen')
    if (!model) {
      showToast('请先选择生成模型', 'destructive')
      return
    }

    const prompt = buildOptimizePrompt(originalScript, suggestions)
    const label = suggestions.length === 1 ? '应用单条建议优化' : '一键全部优化'
    chatStore.addMessage({
      role: 'user',
      content: label,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Script)

    await streamChat(
      {
        config,
        model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        onChunk: (chunk) => chatStore.appendToStream(chunk),
        onDone: () => {
          chatStore.finishGeneration()
          saveSession()
        },
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      },
    )
  }

  return { loading, error, score, scoreScript, clearScore, optimizeScript }
}

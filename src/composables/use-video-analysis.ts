import { ref, unref } from 'vue'
import type { VideoMetrics, ApiConfig } from '@/models/types'
import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useHistoryStore } from '@/stores/history-store'
import { useImageStore } from '@/stores/image-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { streamChat } from '@/services/api/openrouter-api'
import {
  buildVideoAnalysisPrompt,
  buildVideoOptimizationPrompt,
  buildScriptDirectionsPrompt,
  buildDirectionDetailPrompt,
} from '@/services/helpers/analysis-prompt-builder'
import { buildSystemPrompt } from '@/services/helpers/script-prompt-builder'
import { MessageType, ProductionDirection } from '@/models/enums'
import { useToast } from '@/composables/use-toast'
import { useVideoFrames } from '@/composables/use-video-frames'

export interface AnalysisScore {
  hookStrength: number
  rhythm: number
  sellingPoints: number
  platformFit: number
  visualQuality: number
  overall: number
}

export function parseAnalysisScore(content: string): AnalysisScore | null {
  const hookPattern = /(?:钩子强度|hook)[:\s：]*(\d+)\s*\/\s*10/i
  const rhythmPattern = /(?:节奏把控|节奏|rhythm)[:\s：]*(\d+)\s*\/\s*10/i
  const sellPattern = /(?:卖点覆盖|卖点|selling)[:\s：]*(\d+)\s*\/\s*10/i
  const platformPattern = /(?:平台适配|平台|platform)[:\s：]*(\d+)\s*\/\s*10/i
  const visualPattern = /(?:视觉质量|视觉|visual)[:\s：]*(\d+)\s*\/\s*10/i
  const overallPattern = /(?:综合评分|综合|overall)[:\s：]*(\d+)\s*\/\s*10/i

  const hook = content.match(hookPattern)
  const rhythm = content.match(rhythmPattern)
  const sell = content.match(sellPattern)
  const platform = content.match(platformPattern)
  const visual = content.match(visualPattern)
  const overall = content.match(overallPattern)

  if (!hook || !rhythm || !sell || !platform || !visual || !overall) return null

  return {
    hookStrength: parseInt(hook[1]!, 10),
    rhythm: parseInt(rhythm[1]!, 10),
    sellingPoints: parseInt(sell[1]!, 10),
    platformFit: parseInt(platform[1]!, 10),
    visualQuality: parseInt(visual[1]!, 10),
    overall: parseInt(overall[1]!, 10),
  }
}

const analyzing = ref(false)
const videoFile = ref<File | null>(null)
const lastMetrics = ref<VideoMetrics | undefined>()
const hasAnalysisResult = ref(false)
const hasDirectionsResult = ref(false)

export function useVideoAnalysis() {
  const chatStore = useChatStore()
  const configStore = useConfigStore()
  const gameStore = useGameStore()
  const settingsStore = useSettingsStore()
  const historyStore = useHistoryStore()
  const imageStore = useImageStore()
  const themeRadarStore = useThemeRadarStore()
  const gameplayRadarStore = useGameplayRadarStore()
  const { showToast } = useToast()
  const { extractFrames, progress } = useVideoFrames()

  function saveSession() {
    const msgs = [...chatStore.messages]
    if (msgs.length === 0) return

    const gameName = gameStore.currentGame?.name ?? ''
    const isUe = configStore.config.direction === ProductionDirection.UeGameplay
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

  function requireApiKey(): ApiConfig | null {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      showToast('请先配置 API Key', 'destructive')
      return null
    }
    return config
  }

  async function analyzeVideo(file: File, metrics?: VideoMetrics): Promise<void> {
    const config = requireApiKey()
    if (!config) {
      chatStore.failGeneration('请先配置 API Key')
      return
    }

    analyzing.value = true
    videoFile.value = file
    lastMetrics.value = metrics
    hasAnalysisResult.value = false

    try {
      const frames = await extractFrames(file)
      const systemPrompt = buildVideoAnalysisPrompt(metrics)

      const imageContents = frames.map((dataUrl) => ({
        type: 'image_url' as const,
        image_url: { url: dataUrl },
      }))

      const userContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
        { type: 'text', text: '[视频分析]' },
        ...imageContents,
      ]

      chatStore.addMessage({
        role: 'user',
        content: '[视频分析]',
        timestamp: Date.now(),
      })
      chatStore.startGeneration(MessageType.Analysis)

      await streamChat(
        {
          config,
          model: settingsStore.getModelForTask('vision'),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
        },
        {
          onChunk: (chunk) => chatStore.appendToStream(chunk),
          onDone: () => {
            chatStore.finishGeneration()
            hasAnalysisResult.value = true
            saveSession()
          },
          onError: (err) => {
            chatStore.failGeneration(err)
            showToast(err, 'destructive')
          },
        },
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : '视频分析失败'
      showToast(msg, 'destructive')
    } finally {
      analyzing.value = false
      videoFile.value = null
    }
  }

  async function requestOptimization(goal: string): Promise<void> {
    const config = requireApiKey()
    if (!config) return

    const prompt = buildVideoOptimizationPrompt(goal, lastMetrics.value)

    chatStore.addMessage({
      role: 'user',
      content: `专项优化：${goal}`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Optimization)

    const messages = [
      ...chatStore.getMessagesForApi().slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt },
    ]

    await streamChat(
      {
        config,
        model: settingsStore.getModelForTask('gen'),
        messages,
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

  async function generateScriptDirections(): Promise<void> {
    const config = requireApiKey()
    if (!config) return

    const genConfig = unref(configStore.config)
    const game = unref(gameStore.currentGame)
    const prompt = buildScriptDirectionsPrompt(genConfig, game, lastMetrics.value)

    hasDirectionsResult.value = false

    chatStore.addMessage({
      role: 'user',
      content: '根据视频分析生成脚本方向',
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.ScriptDirection)

    const messages = [
      ...chatStore.getMessagesForApi().slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: prompt },
    ]

    await streamChat(
      {
        config,
        model: settingsStore.getModelForTask('gen'),
        messages,
      },
      {
        onChunk: (chunk) => chatStore.appendToStream(chunk),
        onDone: () => {
          chatStore.finishGeneration()
          hasDirectionsResult.value = true
          saveSession()
        },
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      },
    )
  }

  async function generateDetailedScript(directionNumber: number): Promise<void> {
    const config = requireApiKey()
    if (!config) return

    const genConfig = unref(configStore.config)
    const game = unref(gameStore.currentGame)
    const userPrompt = buildDirectionDetailPrompt(directionNumber, genConfig, game)

    const analysisContext = chatStore.getMessagesForApi()
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content)
      .join('\n\n')

    const systemPrompt = buildSystemPrompt(genConfig, game, analysisContext)

    chatStore.addMessage({
      role: 'user',
      content: `选择方向${['一', '二', '三'][directionNumber - 1]}，生成完整脚本`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Script)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatStore.getMessagesForApi().slice(0, -1),
      { role: 'user', content: userPrompt },
    ]

    await streamChat(
      {
        config,
        model: settingsStore.getModelForTask('gen'),
        messages,
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

  return {
    analyzeVideo,
    requestOptimization,
    generateScriptDirections,
    generateDetailedScript,
    extractFrames,
    progress,
    analyzing,
    hasAnalysisResult,
    hasDirectionsResult,
  }
}

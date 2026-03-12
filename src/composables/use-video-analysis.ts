import { ref, unref } from 'vue'
import type { VideoMetrics, ApiConfig } from '@/models/types'
import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { streamChat } from '@/services/api/openrouter-api'
import {
  buildVideoAnalysisPrompt,
  buildVideoOptimizationPrompt,
  buildScriptDirectionsPrompt,
  buildDirectionDetailPrompt,
} from '@/services/helpers/analysis-prompt-builder'
import { buildSystemPrompt } from '@/services/helpers/script-prompt-builder'
import { API_DEFAULTS } from '@/constants'
import { MessageType } from '@/models/enums'
import { useToast } from '@/composables/use-toast'
import { useVideoFrames } from '@/composables/use-video-frames'
import { useSessionPersistence } from '@/composables/use-session-persistence'
import { useResolvedModel } from '@/composables/use-resolved-model'

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
  const { showToast } = useToast()
  const { extractFrames, progress } = useVideoFrames()
  const { saveSession } = useSessionPersistence()
  const { withFallback } = useResolvedModel()

  function requireApiKey(): ApiConfig | null {
    const config = unref(settingsStore.config)
    if (!settingsStore.hasApiKey) {
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
          ...withFallback('vision'),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          signal: chatStore.getSignal(),
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
        ...withFallback('gen'),
        messages,
        signal: chatStore.getSignal(),
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
        ...withFallback('gen'),
        messages,
        signal: chatStore.getSignal(),
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

    const allApiMsgs = chatStore.getMessagesForApi()
    const lastAssistant = [...allApiMsgs].reverse().find((m) => m.role === 'assistant')
    const directionsContent = lastAssistant?.content ?? ''
    const systemPrompt = buildSystemPrompt(genConfig, game, directionsContent)

    chatStore.addMessage({
      role: 'user',
      content: `选择方向${['一', '二', '三'][directionNumber - 1]}，生成完整脚本`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Script)

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]

    await streamChat(
      {
        config,
        ...withFallback('gen'),
        messages,
        maxTokens: API_DEFAULTS.MAX_TOKENS_SCRIPT,
        signal: chatStore.getSignal(),
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

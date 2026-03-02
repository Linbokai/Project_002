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
import { MessageType } from '@/models/enums'
import { useToast } from '@/composables/use-toast'
import { useVideoFrames } from '@/composables/use-video-frames'

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
        onDone: () => chatStore.finishGeneration(),
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
      ...chatStore.getMessagesForApi(),
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
        onDone: () => chatStore.finishGeneration(),
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

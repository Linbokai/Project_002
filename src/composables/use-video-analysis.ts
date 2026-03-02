import { ref, unref } from 'vue'
import type { VideoMetrics } from '@/models/types'
import { useChatStore } from '@/stores/chat-store'
import { useSettingsStore } from '@/stores/settings-store'
import { streamChat } from '@/services/api/openrouter-api'
import { buildVideoAnalysisPrompt, buildVideoOptimizationPrompt } from '@/services/helpers/prompt-builder'
import { useToast } from '@/composables/use-toast'

const FPS = 2
const MAX_FRAMES = 120
const MAX_WIDTH = 960
const JPEG_QUALITY = 0.75

const progress = ref(0)
const analyzing = ref(false)
const videoFile = ref<File | null>(null)
const lastMetrics = ref<VideoMetrics | undefined>()
const hasAnalysisResult = ref(false)

export function useVideoAnalysis() {
  const chatStore = useChatStore()
  const settingsStore = useSettingsStore()
  const { showToast } = useToast()

  async function extractFrames(video: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(video)
      const videoEl = document.createElement('video')
      videoEl.muted = true
      videoEl.playsInline = true
      videoEl.crossOrigin = 'anonymous'

      videoEl.onloadedmetadata = () => {
        const duration = videoEl.duration
        const totalFrames = Math.min(
          Math.floor(duration * FPS),
          MAX_FRAMES,
        )
        const frames: string[] = []
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('无法创建 canvas context'))
          return
        }

        let captured = 0
        const captureNext = (t: number) => {
          if (captured >= totalFrames) {
            URL.revokeObjectURL(url)
            videoEl.src = ''
            progress.value = 100
            resolve(frames)
            return
          }
          videoEl.currentTime = t
        }

        videoEl.onseeked = () => {
          let w = videoEl.videoWidth
          let h = videoEl.videoHeight
          if (w > MAX_WIDTH) {
            h = Math.round((h * MAX_WIDTH) / w)
            w = MAX_WIDTH
          }
          canvas.width = w
          canvas.height = h
          ctx.drawImage(videoEl, 0, 0, w, h)
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
          frames.push(dataUrl)
          captured++
          progress.value = Math.round((captured / totalFrames) * 100)
          const nextT = (captured / totalFrames) * duration
          captureNext(nextT)
        }

        videoEl.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('视频加载失败'))
        }

        captureNext(0)
      }

      videoEl.src = url
    })
  }

  async function analyzeVideo(file: File, metrics?: VideoMetrics): Promise<void> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      chatStore.failGeneration('请先配置 API Key')
      showToast('请先配置 API Key', 'destructive')
      return
    }

    analyzing.value = true
    videoFile.value = file
    lastMetrics.value = metrics
    hasAnalysisResult.value = false
    progress.value = 0

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
      chatStore.startGeneration()

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
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const prompt = buildVideoOptimizationPrompt(goal, lastMetrics.value)

    chatStore.addMessage({
      role: 'user',
      content: `专项优化：${goal}`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration()

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

  return {
    analyzeVideo,
    requestOptimization,
    extractFrames,
    progress,
    analyzing,
    hasAnalysisResult,
  }
}

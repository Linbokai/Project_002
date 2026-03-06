import { computed } from 'vue'
import { useImageStore } from '@/stores/image-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { generateImage } from '@/services/api/image-api'
import {
  buildStoryboardGridSystemPrompt,
  buildStoryboardGridPrompt,
} from '@/services/helpers/storyboard-prompt-builder'
import { parseFrames } from '@/services/helpers/frame-parser'
import type { ScriptKey, ImageConfig } from '@/models/types'
import { useVisualContext } from '@/composables/use-visual-context'
import { useResolvedModel } from '@/composables/use-resolved-model'

export function useStoryboardGrid(scriptKey: ScriptKey) {
  const imageStore = useImageStore()
  const settingsStore = useSettingsStore()
  const configStore = useConfigStore()
  const gameStore = useGameStore()
  const { ensureVisualContext } = useVisualContext(scriptKey)
  const { withFallback } = useResolvedModel()

  const gridImage = computed(() => imageStore.getGridImage(scriptKey))
  const loading = computed(() => imageStore.isGridLoading(scriptKey))
  const error = computed(() => imageStore.getGridError(scriptKey))

  async function generateGrid(scriptContent: string): Promise<void> {
    if (imageStore.isGridLoading(scriptKey)) return

    imageStore.setGridLoading(scriptKey, true)
    try {
      const shots = parseFrames(scriptContent)
      if (shots.length === 0) {
        imageStore.setGridError(scriptKey, '未解析到分镜内容')
        return
      }

      const contextText = await ensureVisualContext(scriptContent)
      const ctx = imageStore.getContext(scriptKey)

      const uploadedRefs = [
        ...(ctx?.characterImages ?? []),
        ...(ctx?.styleImages ?? []),
      ].map((img) => img.url)

      const panelRatio = configStore.config.aspectRatio
      const systemPrompt = buildStoryboardGridSystemPrompt(panelRatio, contextText)
      const prompt = buildStoryboardGridPrompt(
        shots,
        gameStore.currentGame?.name ?? '游戏',
        uploadedRefs.length > 0,
        panelRatio,
      )

      const imageConfig: ImageConfig = {
        aspect_ratio: '1:1',
        image_size: '2K',
      }

      const imageFb = withFallback('image')
      const result = await generateImage({
        apiKey: settingsStore.config.openRouterKey,
        ...imageFb,
        prompt,
        imageConfig,
        systemPrompt,
        referenceImages: uploadedRefs.length > 0 ? uploadedRefs : undefined,
      })

      if (result.images.length > 0) {
        imageStore.setGridImage(scriptKey, {
          url: result.images[0]!.url,
          prompt: `九宫格分镜概览 (${shots.length} 镜头)`,
          model: imageFb.model,
          createdAt: Date.now(),
        })
        imageStore.persistToSession()
      } else {
        imageStore.setGridError(scriptKey, '模型未返回图片')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '九宫格生图失败'
      imageStore.setGridError(scriptKey, msg)
    } finally {
      imageStore.setGridLoading(scriptKey, false)
    }
  }

  return { gridImage, loading, error, generateGrid }
}

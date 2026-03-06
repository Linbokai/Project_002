import { computed } from 'vue'
import { useImageStore } from '@/stores/image-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useConfigStore } from '@/stores/config-store'
import { generateImage } from '@/services/api/image-api'
import {
  buildImageSystemPrompt,
  buildShotImagePrompt,
} from '@/services/helpers/visual-context-builder'
import { IMAGE_DEFAULTS } from '@/constants'
import type { ScriptKey, ShotImageKey, ImageConfig } from '@/models/types'
import { useVisualContext } from '@/composables/use-visual-context'
import { useResolvedModel } from '@/composables/use-resolved-model'

export function useShotImage(scriptKey: ScriptKey, shotKey: ShotImageKey) {
  const imageStore = useImageStore()
  const settingsStore = useSettingsStore()
  const configStore = useConfigStore()
  const { ensureVisualContext } = useVisualContext(scriptKey)
  const { withFallback } = useResolvedModel()

  const image = computed(() => imageStore.getImage(shotKey))
  const loading = computed(() => imageStore.isLoading(shotKey))
  const error = computed(() => imageStore.getError(shotKey))
  const visualContext = computed(() => imageStore.getContext(scriptKey))
  const contextLoading = computed(() => imageStore.isContextLoading(scriptKey))

  async function generate(sceneDescription: string, scriptText: string) {
    if (imageStore.isLoading(shotKey)) return

    imageStore.setLoading(shotKey, true)
    try {
      const contextText = await ensureVisualContext(scriptText)
      const ctx = imageStore.getContext(scriptKey)

      const uploadedRefs = [
        ...(ctx?.characterImages ?? []),
        ...(ctx?.styleImages ?? []),
      ].map((img) => img.url)

      const generatedRefs = imageStore.getScriptImages(scriptKey)
        .slice(-IMAGE_DEFAULTS.MAX_REFERENCE_IMAGES)
        .map((img) => img.url)

      const referenceImages = [...uploadedRefs, ...generatedRefs]

      const hasCharacterImages = (ctx?.characterImages?.length ?? 0) > 0
      const hasStyleImages = (ctx?.styleImages?.length ?? 0) > 0

      const systemPrompt = buildImageSystemPrompt(contextText, hasCharacterImages, hasStyleImages)
      const prompt = buildShotImagePrompt(
        sceneDescription,
        generatedRefs.length > 0,
        uploadedRefs.length > 0,
      )

      const imageConfig: ImageConfig = {
        aspect_ratio: configStore.config.aspectRatio as ImageConfig['aspect_ratio'],
        image_size: IMAGE_DEFAULTS.IMAGE_SIZE,
      }

      const imageFb = withFallback('image')
      const result = await generateImage({
        apiKey: settingsStore.config.openRouterKey,
        ...imageFb,
        prompt,
        imageConfig,
        systemPrompt,
        referenceImages,
      })

      if (result.images.length > 0) {
        imageStore.setImage(shotKey, {
          url: result.images[0]!.url,
          prompt: sceneDescription,
          model: imageFb.model,
          createdAt: Date.now(),
        })
        imageStore.persistToSession()
      } else {
        imageStore.setError(shotKey, '模型未返回图片')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生图失败'
      imageStore.setError(shotKey, msg)
    } finally {
      imageStore.setLoading(shotKey, false)
    }
  }

  return { image, loading, error, visualContext, contextLoading, generate }
}

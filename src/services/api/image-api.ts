import type { ImageConfig } from '@/models/types'
import { openRouterFetch } from './openrouter-client'

export interface ImageGenerationOptions {
  apiKey: string
  model: string
  prompt: string
  imageConfig: ImageConfig
  systemPrompt?: string
  referenceImages?: string[]
  fallbackModels?: string[]
  onModelFallback?: (failedModel: string, nextModel: string) => void
}

export interface ImageGenerationResult {
  images: Array<{ url: string }>
  text?: string
}

function buildImageBody(
  model: string,
  options: ImageGenerationOptions,
): Record<string, unknown> {
  const { prompt, imageConfig, systemPrompt, referenceImages } = options
  const messages: Array<Record<string, unknown>> = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  const userContent: Array<Record<string, unknown>> = []
  if (referenceImages?.length) {
    for (const imgUrl of referenceImages) {
      userContent.push({ type: 'image_url', image_url: { url: imgUrl } })
    }
  }
  userContent.push({ type: 'text', text: prompt })
  messages.push({ role: 'user', content: userContent })

  return {
    model,
    messages,
    modalities: ['image', 'text'],
    stream: false,
    image_config: {
      aspect_ratio: imageConfig.aspect_ratio,
      image_size: imageConfig.image_size,
    },
  }
}

function parseImageResponse(data: Record<string, unknown>): ImageGenerationResult {
  const message = (data as { choices?: Array<{ message?: Record<string, unknown> }> })
    .choices?.[0]?.message
  const images: Array<{ url: string }> = []

  const rawImages = message?.images as Array<{ image_url?: { url?: string } }> | undefined
  if (rawImages?.length) {
    for (const img of rawImages) {
      const url = img?.image_url?.url
      if (url) images.push({ url })
    }
  }

  return {
    images,
    text: (message?.content as string) ?? undefined,
  }
}

export async function generateImage(
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const { apiKey, fallbackModels } = options
  const modelsToTry = [options.model, ...(fallbackModels ?? [])]

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]!
    const isLast = i === modelsToTry.length - 1

    try {
      const body = buildImageBody(currentModel, options)
      const response = await openRouterFetch(apiKey, body)
      const data = await response.json()
      return parseImageResponse(data)
    } catch (e) {
      if (!isLast) {
        options.onModelFallback?.(currentModel, modelsToTry[i + 1]!)
        continue
      }
      throw e
    }
  }

  throw new Error('所有候选图像模型均不可用')
}

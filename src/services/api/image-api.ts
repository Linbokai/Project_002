import type { ImageConfig } from '@/models/types'
import { openRouterFetch } from './openrouter-client'

export interface ImageGenerationOptions {
  apiKey: string
  model: string
  prompt: string
  imageConfig: ImageConfig
  systemPrompt?: string
  referenceImages?: string[]
}

export interface ImageGenerationResult {
  images: Array<{ url: string }>
  text?: string
}

export async function generateImage(
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const { apiKey, model, prompt, imageConfig, systemPrompt, referenceImages } = options

  const messages: Array<Record<string, unknown>> = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  const userContent: Array<Record<string, unknown>> = []

  if (referenceImages?.length) {
    for (const imgUrl of referenceImages) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imgUrl },
      })
    }
  }

  userContent.push({ type: 'text', text: prompt })
  messages.push({ role: 'user', content: userContent })

  const body: Record<string, unknown> = {
    model,
    messages,
    modalities: ['image', 'text'],
    stream: false,
    image_config: {
      aspect_ratio: imageConfig.aspect_ratio,
      image_size: imageConfig.image_size,
    },
  }

  const response = await openRouterFetch(apiKey, body)
  const data = await response.json()

  const message = data.choices?.[0]?.message
  const images: Array<{ url: string }> = []

  if (message?.images?.length) {
    for (const img of message.images) {
      const url = img?.image_url?.url
      if (url) images.push({ url })
    }
  }

  return {
    images,
    text: message?.content ?? undefined,
  }
}

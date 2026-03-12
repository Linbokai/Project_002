import type { ImageConfig, ApiConfig, ImageAspectRatio, ImageSize } from '@/models/types'
import { API_DEFAULTS, ARK_DEFAULTS } from '@/constants'
import { buildHeaders, parseApiError } from './openrouter-client'

export interface ImageGenerationOptions {
  config: ApiConfig
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

// ---- OpenRouter path (chat/completions with modalities) ----

function buildOpenRouterBody(
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

function parseOpenRouterResponse(data: Record<string, unknown>): ImageGenerationResult {
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

// ---- ARK path (/images/generations for seedream) ----

const ARK_SIZE_MAP: Record<ImageSize, Record<ImageAspectRatio, string>> = {
  '0.5K': {
    '1:1': '512x512', '16:9': '512x288', '9:16': '288x512',
    '4:3': '512x384', '3:4': '384x512', '3:2': '512x341',
    '2:3': '341x512', '21:9': '512x219', '4:5': '512x640', '5:4': '640x512',
  },
  '1K': {
    '1:1': '1024x1024', '16:9': '1024x576', '9:16': '576x1024',
    '4:3': '1024x768', '3:4': '768x1024', '3:2': '1024x683',
    '2:3': '683x1024', '21:9': '1024x439', '4:5': '1024x1280', '5:4': '1280x1024',
  },
  '2K': {
    '1:1': '2048x2048', '16:9': '2048x1152', '9:16': '1152x2048',
    '4:3': '2048x1536', '3:4': '1536x2048', '3:2': '2048x1365',
    '2:3': '1365x2048', '21:9': '2048x878', '4:5': '2048x2560', '5:4': '2560x2048',
  },
  '4K': {
    '1:1': '4096x4096', '16:9': '4096x2304', '9:16': '2304x4096',
    '4:3': '4096x3072', '3:4': '3072x4096', '3:2': '4096x2731',
    '2:3': '2731x4096', '21:9': '4096x1757', '4:5': '4096x5120', '5:4': '5120x4096',
  },
}

const ARK_MIN_PIXELS = 3686400 // API 要求最低像素数 (1920×1920)
const ARK_SIZE_TIERS: ImageSize[] = ['0.5K', '1K', '2K', '4K']

function toArkSize(imageConfig: ImageConfig): string {
  let tierIdx = ARK_SIZE_TIERS.indexOf(imageConfig.image_size)
  while (tierIdx < ARK_SIZE_TIERS.length) {
    const size = ARK_SIZE_MAP[ARK_SIZE_TIERS[tierIdx]!]?.[imageConfig.aspect_ratio]
    if (size) {
      const [w, h] = size.split('x').map(Number)
      if (w! * h! >= ARK_MIN_PIXELS) return size
    }
    tierIdx++
  }
  return '1920x1920'
}

function buildArkImageBody(
  model: string,
  options: ImageGenerationOptions,
): Record<string, unknown> {
  const { prompt, imageConfig, systemPrompt, referenceImages } = options

  let fullPrompt = prompt
  if (systemPrompt) {
    fullPrompt = `${systemPrompt}\n\n${prompt}`
  }

  const body: Record<string, unknown> = {
    model,
    prompt: fullPrompt,
    size: toArkSize(imageConfig),
    response_format: 'url',
    n: 1,
  }

  if (referenceImages?.length) {
    body.image_url = referenceImages[0]
  }

  return body
}

function parseArkImageResponse(data: Record<string, unknown>): ImageGenerationResult {
  const images: Array<{ url: string }> = []

  const rawData = (data as { data?: Array<{ url?: string; b64_json?: string }> }).data
  if (rawData?.length) {
    for (const item of rawData) {
      if (item.url) {
        images.push({ url: item.url })
      } else if (item.b64_json) {
        images.push({ url: `data:image/png;base64,${item.b64_json}` })
      }
    }
  }

  return { images }
}

// ---- Unified entry ----

export async function generateImage(
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const { config, fallbackModels } = options
  const isArk = config.provider === 'ark'
  const modelsToTry = [options.model, ...(fallbackModels ?? [])]

  const baseUrl = isArk ? ARK_DEFAULTS.BASE_URL : API_DEFAULTS.BASE_URL
  const apiKey = isArk ? config.arkKey : config.openRouterKey
  const headers = buildHeaders(apiKey, isArk)

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]!
    const isLast = i === modelsToTry.length - 1

    try {
      const url = isArk
        ? `${baseUrl}/images/generations`
        : `${baseUrl}/chat/completions`

      const body = isArk
        ? buildArkImageBody(currentModel, options)
        : buildOpenRouterBody(currentModel, options)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const msg = await parseApiError(response)
        throw new Error(msg)
      }

      const data = await response.json()
      return isArk ? parseArkImageResponse(data) : parseOpenRouterResponse(data)
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

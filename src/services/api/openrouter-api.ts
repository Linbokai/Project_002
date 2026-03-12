import { API_DEFAULTS, ARK_DEFAULTS } from '@/constants'
import type { ApiConfig } from '@/models/types'
import { buildHeaders, parseApiError } from './openrouter-client'
import { generateImage } from './image-api'

function getRequestMeta(config: ApiConfig): { url: string; headers: Record<string, string> } {
  const isArk = config.provider === 'ark'
  return {
    url: `${isArk ? ARK_DEFAULTS.BASE_URL : API_DEFAULTS.BASE_URL}/chat/completions`,
    headers: buildHeaders(isArk ? config.arkKey : config.openRouterKey, isArk),
  }
}

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onDone: (fullText: string) => void
  onError: (error: string) => void
}

interface ChatCompletionMessage {
  role: string
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

export interface RequestOptions {
  config: ApiConfig
  model: string
  messages: ChatCompletionMessage[]
  stream?: boolean
  temperature?: number
  maxTokens?: number
  fallbackModels?: string[]
  onModelFallback?: (failedModel: string, nextModel: string) => void
  signal?: AbortSignal
}

function buildBody(model: string, options: RequestOptions, stream: boolean) {
  return {
    model,
    messages: options.messages,
    stream,
    temperature: options.temperature ?? API_DEFAULTS.TEMPERATURE,
    max_tokens: options.maxTokens ?? API_DEFAULTS.MAX_TOKENS,
  }
}

const NON_RETRYABLE_STATUS = new Set([401, 402])

export async function streamChat(
  options: RequestOptions,
  callbacks: StreamCallbacks,
): Promise<void> {
  const { url, headers } = getRequestMeta(options.config)
  const modelsToTry = [options.model, ...(options.fallbackModels ?? [])]

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]!
    const isLast = i === modelsToTry.length - 1

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildBody(currentModel, options, true)),
        signal: options.signal,
      })
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        callbacks.onDone('')
        return
      }
      if (!isLast) {
        options.onModelFallback?.(currentModel, modelsToTry[i + 1]!)
        continue
      }
      callbacks.onError(e instanceof Error ? e.message : '请求失败')
      return
    }

    if (!response.ok) {
      if (!isLast && !NON_RETRYABLE_STATUS.has(response.status)) {
        options.onModelFallback?.(currentModel, modelsToTry[i + 1]!)
        continue
      }
      const msg = await parseApiError(response)
      callbacks.onError(msg)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      callbacks.onError('无法读取响应流')
      return
    }

    const decoder = new TextDecoder()
    let fullText = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              fullText += content
              callbacks.onChunk(content)
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      callbacks.onDone(fullText)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        callbacks.onDone(fullText)
        return
      }
      callbacks.onError(e instanceof Error ? e.message : '流式读取失败')
    }
    return
  }
}

export async function chatCompletion(
  options: RequestOptions,
): Promise<string> {
  const { url, headers } = getRequestMeta(options.config)
  const modelsToTry = [options.model, ...(options.fallbackModels ?? [])]

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i]!
    const isLast = i === modelsToTry.length - 1

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildBody(currentModel, options, false)),
      })
    } catch (e) {
      if (!isLast) {
        options.onModelFallback?.(currentModel, modelsToTry[i + 1]!)
        continue
      }
      throw e
    }

    if (!response.ok) {
      if (!isLast && !NON_RETRYABLE_STATUS.has(response.status)) {
        options.onModelFallback?.(currentModel, modelsToTry[i + 1]!)
        continue
      }
      const msg = await parseApiError(response)
      throw new Error(msg)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  throw new Error('所有候选模型均不可用')
}

export interface TestConnectionResult {
  ok: boolean
  error?: string
}

export async function testConnection(config: ApiConfig, model: string): Promise<TestConnectionResult> {
  const activeKey = config.provider === 'ark' ? config.arkKey : config.openRouterKey
  if (!activeKey) {
    return { ok: false, error: '未填写 API Key' }
  }
  if (!model) {
    return { ok: false, error: '未选择模型' }
  }

  try {
    const result = await chatCompletion({
      config,
      model,
      messages: [{ role: 'user', content: 'Hi' }],
      stream: false,
      maxTokens: 5,
    })
    return result.length > 0
      ? { ok: true }
      : { ok: false, error: '模型返回空响应' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未知错误'
    return { ok: false, error: msg }
  }
}

export async function testImageConnection(config: ApiConfig, model: string): Promise<TestConnectionResult> {
  const activeKey = config.provider === 'ark' ? config.arkKey : config.openRouterKey
  if (!activeKey) {
    return { ok: false, error: '未填写 API Key' }
  }
  if (!model) {
    return { ok: false, error: '未选择模型' }
  }

  try {
    const result = await generateImage({
      config,
      model,
      prompt: '一只白色的猫',
      imageConfig: { aspect_ratio: '1:1', image_size: '0.5K' },
    })
    return result.images.length > 0
      ? { ok: true }
      : { ok: false, error: '模型未返回图片' }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '未知错误'
    return { ok: false, error: msg }
  }
}

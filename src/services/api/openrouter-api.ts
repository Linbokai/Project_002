import { API_DEFAULTS } from '@/constants'
import type { ApiConfig } from '@/models/types'

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onDone: (fullText: string) => void
  onError: (error: string) => void
}

interface ChatCompletionMessage {
  role: string
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

interface RequestOptions {
  config: ApiConfig
  model: string
  messages: ChatCompletionMessage[]
  stream?: boolean
  temperature?: number
  maxTokens?: number
}

function buildHeaders(config: ApiConfig): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.openRouterKey}`,
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Script Workbench',
  }
}

function buildBody(options: RequestOptions) {
  return {
    model: options.model,
    messages: options.messages,
    stream: options.stream ?? true,
    temperature: options.temperature ?? API_DEFAULTS.TEMPERATURE,
    max_tokens: options.maxTokens ?? API_DEFAULTS.MAX_TOKENS,
  }
}

export async function streamChat(
  options: RequestOptions,
  callbacks: StreamCallbacks,
): Promise<void> {
  const url = `${API_DEFAULTS.BASE_URL}/chat/completions`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(options.config),
      body: JSON.stringify(buildBody({ ...options, stream: true })),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const msg = errorData?.error?.message ?? `HTTP ${response.status}`
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
    const msg = e instanceof Error ? e.message : '请求失败'
    callbacks.onError(msg)
  }
}

export async function chatCompletion(
  options: RequestOptions,
): Promise<string> {
  const url = `${API_DEFAULTS.BASE_URL}/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(options.config),
    body: JSON.stringify(buildBody({ ...options, stream: false })),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.error?.message ?? `HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export interface TestConnectionResult {
  ok: boolean
  error?: string
}

export async function testConnection(config: ApiConfig, model: string): Promise<TestConnectionResult> {
  if (!config.openRouterKey) {
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

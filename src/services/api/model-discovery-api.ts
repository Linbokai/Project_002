import { API_DEFAULTS } from '@/constants'
import type { OpenRouterModelInfo } from '@/models/types'

export async function fetchAvailableModels(
  apiKey: string,
): Promise<OpenRouterModelInfo[]> {
  const url = `${API_DEFAULTS.BASE_URL}/models`

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!response.ok) {
    throw new Error(`获取模型列表失败: HTTP ${response.status}`)
  }

  const json = await response.json()
  return json.data ?? []
}

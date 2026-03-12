import { API_DEFAULTS, APP_NAME } from '@/constants'
import type { KeyInfo } from '@/models/types'

export function buildHeaders(apiKey: string, isArk = false): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
  if (!isArk) {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = encodeURIComponent(APP_NAME)
  }
  return headers
}

export async function parseApiError(response: Response): Promise<string> {
  const errorData = await response.json().catch(() => null)
  return errorData?.error?.message ?? `HTTP ${response.status}`
}

export async function openRouterFetch(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  const url = `${API_DEFAULTS.BASE_URL}/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const msg = await parseApiError(response)
    throw new Error(msg)
  }

  return response
}

export async function fetchKeyInfo(apiKey: string): Promise<KeyInfo> {
  const url = `${API_DEFAULTS.BASE_URL}/key`

  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!response.ok) {
    const msg = await parseApiError(response)
    throw new Error(msg)
  }

  const json = await response.json()
  const d = json.data

  return {
    label: d.label,
    limit: d.limit,
    limitRemaining: d.limit_remaining,
    usage: d.usage,
    usageDaily: d.usage_daily,
    usageMonthly: d.usage_monthly,
    isFreeTier: d.is_free_tier,
  }
}

/**
 * 从可能包含多余文本的 AI 响应中提取 JSON 数组。
 * 先尝试清洗首尾非 JSON 内容，失败则尝试直接解析。
 */
export function parseJsonArray(response: string): unknown {
  const cleaned = response.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*$/, ']')
  try {
    return JSON.parse(cleaned)
  } catch {
    return JSON.parse(response)
  }
}

/**
 * 手动导入文本 → 解析为数组，失败返回空数组。
 */
export function safeParseJsonArray(text: string): unknown[] {
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

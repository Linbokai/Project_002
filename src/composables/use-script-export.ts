import { unref } from 'vue'
import { copyToClipboard, downloadText } from '@/utils'
import { buildSeedancePrompt } from '@/services/helpers/script-prompt-builder'
import { formatAsHtml, formatAsPlainText } from '@/services/helpers/export-formatter'
import { chatCompletion } from '@/services/api/openrouter-api'
import { useSettingsStore } from '@/stores/settings-store'
import { useChatStore } from '@/stores/chat-store'
import { MessageType } from '@/models/enums'
import { useResolvedModel } from '@/composables/use-resolved-model'

function formatExportFilename(gameName: string): string {
  const safe = (gameName || '脚本').replace(/[<>:"/\\|?*]/g, '_')
  const date = new Date().toISOString().slice(0, 10)
  return `${safe}_${date}.txt`
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function useScriptExport() {
  const settingsStore = useSettingsStore()
  const chatStore = useChatStore()
  const { withFallback } = useResolvedModel()

  async function copyScript(text: string): Promise<boolean> {
    return copyToClipboard(text)
  }

  function downloadScript(text: string, gameName: string): void {
    const filename = formatExportFilename(gameName)
    downloadText(text, filename)
  }

  async function convertToSeedance(
    script: string,
    lang: 'zh' | 'en',
  ): Promise<void> {
    const config = unref(settingsStore.config)
    if (!settingsStore.hasApiKey) {
      throw new Error('请先配置 API Key')
    }

    const label = lang === 'zh' ? '中文' : '英文'
    chatStore.addMessage({
      role: 'user',
      content: `将脚本转为 Seedance 视频提示词（${label}）`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.SeedancePrompt)

    try {
      const prompt = buildSeedancePrompt(script, lang, false)
      const response = await chatCompletion({
        config,
        ...withFallback('gen'),
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      })
      const result = response.trim()
      const last = chatStore.messages[chatStore.messages.length - 1]
      if (last && last.role === 'assistant') {
        last.content = result
      }
      chatStore.finishGeneration()
    } catch (e) {
      const msg = e instanceof Error ? e.message : '转化失败'
      chatStore.failGeneration(msg)
      throw e
    }
  }

  function downloadHtml(script: string, filename?: string): void {
    const html = formatAsHtml(script, filename)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    downloadBlob(blob, (filename ?? 'script') + '.html')
  }

  function downloadTxt(script: string, filename?: string): void {
    const txt = formatAsPlainText(script)
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, (filename ?? 'script') + '.txt')
  }

  return {
    copyScript,
    downloadScript,
    downloadHtml,
    downloadTxt,
    convertToSeedance,
  }
}

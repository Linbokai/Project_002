import { unref } from 'vue'
import { copyToClipboard, downloadText } from '@/utils'
import { buildSeedancePrompt } from '@/services/helpers/script-prompt-builder'
import { chatCompletion } from '@/services/api/openrouter-api'
import { useSettingsStore } from '@/stores/settings-store'
import { useChatStore } from '@/stores/chat-store'
import { MessageType } from '@/models/enums'

function formatExportFilename(gameName: string): string {
  const safe = (gameName || '脚本').replace(/[<>:"/\\|?*]/g, '_')
  const date = new Date().toISOString().slice(0, 10)
  return `${safe}_${date}.txt`
}

export function useScriptExport() {
  const settingsStore = useSettingsStore()
  const chatStore = useChatStore()

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
    if (!config.openRouterKey) {
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
        model: settingsStore.getModelForTask('gen'),
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

  return {
    copyScript,
    downloadScript,
    convertToSeedance,
  }
}

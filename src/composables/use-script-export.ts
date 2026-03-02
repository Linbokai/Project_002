import { ref, unref } from 'vue'
import { copyToClipboard, downloadText } from '@/utils'
import { buildSeedancePrompt } from '@/services/helpers/script-prompt-builder'
import { chatCompletion } from '@/services/api/openrouter-api'
import { useSettingsStore } from '@/stores/settings-store'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem } from '@/utils'

function formatExportFilename(gameName: string): string {
  const safe = (gameName || '脚本').replace(/[<>:"/\\|?*]/g, '_')
  const date = new Date().toISOString().slice(0, 10)
  return `${safe}_${date}.txt`
}

export function useScriptExport() {
  const settingsStore = useSettingsStore()

  const safeMode = ref<boolean>(
    getItem<boolean>(STORAGE_KEYS.SAFE_MODE, false),
  )

  function toggleSafeMode(): void {
    safeMode.value = !safeMode.value
    setItem(STORAGE_KEYS.SAFE_MODE, safeMode.value)
  }

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
  ): Promise<string> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      throw new Error('请先配置 API Key')
    }

    const prompt = buildSeedancePrompt(script, lang, safeMode.value)
    const response = await chatCompletion({
      config,
      model: settingsStore.getModelForTask('gen'),
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    })
    return response.trim()
  }

  return {
    copyScript,
    downloadScript,
    convertToSeedance,
    safeMode,
    toggleSafeMode,
  }
}

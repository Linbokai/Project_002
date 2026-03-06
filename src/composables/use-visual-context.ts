import { useImageStore } from '@/stores/image-store'
import { useSettingsStore } from '@/stores/settings-store'
import { chatCompletion } from '@/services/api/openrouter-api'
import { buildVisualContextExtractionPrompt } from '@/services/helpers/visual-context-builder'
import type { ScriptKey } from '@/models/types'
import { useResolvedModel } from '@/composables/use-resolved-model'

export function useVisualContext(scriptKey: ScriptKey) {
  const imageStore = useImageStore()
  const settingsStore = useSettingsStore()
  const { withFallback } = useResolvedModel()

  async function ensureVisualContext(scriptText: string): Promise<string> {
    const existing = imageStore.getContext(scriptKey)
    if (existing) return existing.text

    imageStore.setContextLoading(scriptKey, true)
    try {
      const prompt = buildVisualContextExtractionPrompt(scriptText)
      const result = await chatCompletion({
        config: settingsStore.config,
        ...withFallback('gen'),
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        temperature: 0.3,
      })

      const ctx = { text: result, extractedAt: Date.now(), isEdited: false }
      imageStore.setContext(scriptKey, ctx)
      return result
    } finally {
      imageStore.setContextLoading(scriptKey, false)
    }
  }

  return { ensureVisualContext }
}

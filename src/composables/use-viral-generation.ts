import { ref } from 'vue'
import { useChatStore } from '@/stores/chat-store'
import { useSettingsStore } from '@/stores/settings-store'
import { streamChat } from '@/services/api/openrouter-api'
import {
  buildViralPrompt,
  type ViralDirection,
} from '@/services/helpers/viral-prompt-builder'
import { MessageType } from '@/models/enums'
import { useToast } from '@/composables/use-toast'
import { useResolvedModel } from '@/composables/use-resolved-model'

export function useViralGeneration() {
  const chatStore = useChatStore()
  const settingsStore = useSettingsStore()
  const { showToast } = useToast()
  const { withFallback } = useResolvedModel()

  const viralDialogOpen = ref(false)

  async function generateViral(
    originalScript: string,
    direction: ViralDirection,
    count: number = 3
  ): Promise<void> {
    const config = settingsStore.config
    if (!config.openRouterKey) {
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const fb = withFallback('gen')
    if (!fb.model) {
      showToast('请先选择生成模型', 'destructive')
      return
    }

    const prompt = buildViralPrompt(originalScript, direction, count)

    const directionLabel =
      direction === 'theme'
        ? '换主题'
        : direction === 'style'
          ? '换风格'
          : direction === 'hook'
            ? '换钩子'
            : '混合裂变'
    chatStore.addMessage({
      role: 'user',
      content: `爆款裂变：${directionLabel} × ${count}个变体`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Script)

    const messages = [{ role: 'user', content: prompt }]

    await streamChat(
      {
        config,
        ...fb,
        messages,
        signal: chatStore.getSignal(),
      },
      {
        onChunk: (chunk) => chatStore.appendToStream(chunk),
        onDone: () => chatStore.finishGeneration(),
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      }
    )
  }

  return {
    viralDialogOpen,
    generateViral,
  }
}

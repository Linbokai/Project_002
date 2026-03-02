import { computed, unref } from 'vue'
import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { streamChat } from '@/services/api/openrouter-api'
import { buildSystemPrompt } from '@/services/helpers/script-prompt-builder'
import { GenerationStatus, MessageType } from '@/models/enums'
import { useToast } from '@/composables/use-toast'

const QUICK_ACTION_PROMPTS: Record<string, string> = {
  reroll: '换个完全不同的创意方向，重新生成脚本',
  hooks: '推荐5个适合当前主题的钩子开场方案',
  hero: '推荐3个适合当前游戏和主题的主角人设',
}

export function useChat() {
  const chatStore = useChatStore()
  const configStore = useConfigStore()
  const gameStore = useGameStore()
  const settingsStore = useSettingsStore()
  const { showToast } = useToast()

  const isGenerating = computed(
    () => chatStore.status === GenerationStatus.Generating,
  )

  async function runGeneration(userText: string, type: MessageType = MessageType.Script): Promise<void> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      chatStore.failGeneration('请先配置 API Key')
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const systemPrompt = buildSystemPrompt(
      unref(configStore.config),
      unref(gameStore.currentGame),
    )
    chatStore.addMessage({
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(type)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatStore.getMessagesForApi(),
    ]

    await streamChat(
      {
        config,
        model: settingsStore.getModelForTask('gen'),
        messages,
      },
      {
        onChunk: (chunk) => chatStore.appendToStream(chunk),
        onDone: () => chatStore.finishGeneration(),
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      },
    )
  }

  async function generateScript(): Promise<void> {
    await runGeneration('请根据以上配置生成买量视频脚本。')
  }

  async function sendMessage(userText: string): Promise<void> {
    await runGeneration(userText)
  }

  async function regenerate(): Promise<void> {
    const list = unref(chatStore.messages)
    let lastUserIndex = -1
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].role === 'user') {
        lastUserIndex = i
        break
      }
    }
    if (lastUserIndex === -1) return

    const lastUserMessage = list[lastUserIndex]
    chatStore.removeMessagesAfter(lastUserIndex)
    await runGeneration(lastUserMessage.content)
  }

  async function quickAction(action: 'reroll' | 'hooks' | 'hero'): Promise<void> {
    const prompt = QUICK_ACTION_PROMPTS[action]
    if (prompt) {
      const msgType = action === 'reroll' ? MessageType.Script : MessageType.General
      await runGeneration(prompt, msgType)
    }
  }

  return {
    sendMessage,
    generateScript,
    regenerate,
    quickAction,
    isGenerating,
  }
}

import { computed, unref } from 'vue'
import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useHistoryStore } from '@/stores/history-store'
import { useImageStore } from '@/stores/image-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { usePromptStore } from '@/stores/prompt-store'
import { streamChat } from '@/services/api/openrouter-api'
import { buildSystemPrompt } from '@/services/helpers/script-prompt-builder'
import { SCRIPT_TYPES } from '@/constants/script-types'
import {
  buildUeSystemPrompt,
  buildGameplayDirectionsPrompt,
  buildGameplayDetailPrompt,
} from '@/services/helpers/gameplay-prompt-builder'
import { GenerationStatus, MessageType, ProductionDirection, UeContentType } from '@/models/enums'
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
  const historyStore = useHistoryStore()
  const imageStore = useImageStore()
  const themeRadarStore = useThemeRadarStore()
  const gameplayRadarStore = useGameplayRadarStore()
  const promptStore = usePromptStore()
  const { showToast } = useToast()

  function saveSession() {
    const msgs = [...chatStore.messages]
    if (msgs.length === 0) return

    const gameName = gameStore.currentGame?.name ?? ''
    const isUe = configStore.config.direction === ProductionDirection.UeGameplay
    const themes = isUe
      ? gameplayRadarStore.getAllSelectedNames().join('、')
      : themeRadarStore.getAllSelectedNames().join('、')
    const firstUser = msgs.find((m) => m.role === 'user')
    const preview = firstUser?.content.slice(0, 80) ?? ''

    if (chatStore.currentSessionId) {
      historyStore.updateSession(chatStore.currentSessionId, { messages: msgs, preview, themes })
      imageStore.persistToSession(chatStore.currentSessionId)
    } else {
      const id = historyStore.addSession({ messages: msgs, gameName, themes, preview })
      chatStore.currentSessionId = id
      imageStore.bindSession(id)
      imageStore.persistToSession(id)
    }
  }

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

    const genConfig = unref(configStore.config)
    const currentGame = unref(gameStore.currentGame)
    const scriptTypeConfig = promptStore.getEffectiveConfig(genConfig.scriptType)
    const systemPrompt = genConfig.direction === ProductionDirection.UeGameplay
      ? buildUeSystemPrompt(genConfig, currentGame)
      : buildSystemPrompt(genConfig, currentGame, undefined, scriptTypeConfig)
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
        onDone: () => {
          chatStore.finishGeneration()
          saveSession()
        },
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      },
    )
  }

  async function generateScript(): Promise<void> {
    const genConfig = unref(configStore.config)

    if (
      genConfig.direction === ProductionDirection.UeGameplay
      && genConfig.ueContentType === UeContentType.Gameplay
    ) {
      await generateGameplayDirections()
      return
    }

    const scriptTypeName = SCRIPT_TYPES.find((t) => t.id === genConfig.scriptType)?.name ?? ''
    const prompt = genConfig.direction === ProductionDirection.UeGameplay
      ? '请根据以上配置生成3D/UE创意玩法买量脚本。先输出玩法策划简案，再写分镜脚本。'
      : `请根据以上配置，严格按照「${scriptTypeName}」脚本类型的输出格式和创作规则，生成买量视频脚本。`
    await runGeneration(prompt)
  }

  async function generateGameplayDirections(): Promise<void> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      chatStore.failGeneration('请先配置 API Key')
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const genConfig = unref(configStore.config)
    const currentGame = unref(gameStore.currentGame)
    const prompt = buildGameplayDirectionsPrompt(genConfig, currentGame)

    chatStore.addMessage({
      role: 'user',
      content: '生成创意玩法方向',
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.GameplayDirection)

    const messages = [
      { role: 'user', content: prompt },
    ]

    await streamChat(
      {
        config,
        model: settingsStore.getModelForTask('gen'),
        messages,
      },
      {
        onChunk: (chunk) => chatStore.appendToStream(chunk),
        onDone: () => {
          chatStore.finishGeneration()
          saveSession()
        },
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      },
    )
  }

  async function generateGameplayDetail(directionNumber: number): Promise<void> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      chatStore.failGeneration('请先配置 API Key')
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const genConfig = unref(configStore.config)
    const currentGame = unref(gameStore.currentGame)
    const userPrompt = buildGameplayDetailPrompt(directionNumber, genConfig, currentGame)

    const directionsContext = chatStore.getMessagesForApi()
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content)
      .join('\n\n')

    const systemPrompt = buildUeSystemPrompt(genConfig, currentGame, directionsContext)

    const dirLabel = ['一', '二', '三'][directionNumber - 1] ?? String(directionNumber)
    chatStore.addMessage({
      role: 'user',
      content: `选择方向${dirLabel}，生成完整脚本`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Script)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatStore.getMessagesForApi().slice(0, -1),
      { role: 'user', content: userPrompt },
    ]

    await streamChat(
      {
        config,
        model: settingsStore.getModelForTask('gen'),
        messages,
      },
      {
        onChunk: (chunk) => chatStore.appendToStream(chunk),
        onDone: () => {
          chatStore.finishGeneration()
          saveSession()
        },
        onError: (err) => {
          chatStore.failGeneration(err)
          showToast(err, 'destructive')
        },
      },
    )
  }

  async function sendMessage(userText: string): Promise<void> {
    await runGeneration(userText)
  }

  async function regenerate(): Promise<void> {
    const list = unref(chatStore.messages)
    let lastUserIndex = -1
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i]!.role === 'user') {
        lastUserIndex = i
        break
      }
    }
    if (lastUserIndex === -1) return

    const lastUserMessage = list[lastUserIndex]!
    chatStore.removeMessagesAfter(lastUserIndex - 1)
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
    generateGameplayDetail,
    regenerate,
    quickAction,
    isGenerating,
  }
}

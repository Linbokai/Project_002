import { computed, unref } from 'vue'
import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import { usePromptStore } from '@/stores/prompt-store'
import { useVariantStore } from '@/stores/variant-store'
import { streamChat } from '@/services/api/openrouter-api'
import { buildSystemPrompt } from '@/services/helpers/script-prompt-builder'
import { buildVariantPromptSuffix } from '@/services/helpers/variant-prompt-builder'
import { SCRIPT_TYPES } from '@/constants/script-types'
import {
  buildUeSystemPrompt,
  buildGameplayDirectionsPrompt,
  buildGameplayDetailPrompt,
} from '@/services/helpers/gameplay-prompt-builder'
import { API_DEFAULTS } from '@/constants'
import { GenerationStatus, MessageType, ProductionDirection, UeContentType } from '@/models/enums'
import { useToast } from '@/composables/use-toast'
import { useSessionPersistence } from '@/composables/use-session-persistence'
import { useResolvedModel } from '@/composables/use-resolved-model'

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
  const promptStore = usePromptStore()
  const variantStore = useVariantStore()
  const { showToast } = useToast()
  const { saveSession } = useSessionPersistence()
  const { withFallback } = useResolvedModel()

  const isGenerating = computed(
    () => chatStore.status === GenerationStatus.Generating,
  )

  async function runGeneration(userText: string, type: MessageType = MessageType.Script): Promise<void> {
    const config = unref(settingsStore.config)
    if (!settingsStore.hasApiKey) {
      chatStore.failGeneration('请先配置 API Key')
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const genConfig = unref(configStore.config)
    const currentGame = unref(gameStore.currentGame)
    const scriptTypeConfig = promptStore.getEffectiveConfig(genConfig.scriptType)
    const platformHint = configStore.platformPromptHint || undefined
    const systemPrompt = genConfig.direction === ProductionDirection.UeGameplay
      ? buildUeSystemPrompt(genConfig, currentGame)
      : buildSystemPrompt(genConfig, currentGame, platformHint, scriptTypeConfig)
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

    const isScriptGen = type === MessageType.Script
    await streamChat(
      {
        config,
        ...withFallback('gen'),
        messages,
        maxTokens: isScriptGen ? API_DEFAULTS.MAX_TOKENS_SCRIPT : undefined,
        signal: chatStore.getSignal(),
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

    if (variantStore.variantCount > 1) {
      await generateVariants()
      return
    }

    const scriptTypeName = SCRIPT_TYPES.find((t) => t.id === genConfig.scriptType)?.name ?? ''
    const prompt = `请根据以上配置，严格按照「${scriptTypeName}」脚本类型的输出格式和创作规则，生成买量视频脚本。`
    await runGeneration(prompt)
  }

  async function generateVariants(): Promise<void> {
    const config = unref(settingsStore.config)
    if (!settingsStore.hasApiKey) {
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const genConfig = unref(configStore.config)
    const currentGame = unref(gameStore.currentGame)
    const scriptTypeConfig = promptStore.getEffectiveConfig(genConfig.scriptType)
    const platformHint2 = configStore.platformPromptHint || undefined
    const baseSystemPrompt = genConfig.direction === ProductionDirection.UeGameplay
      ? buildUeSystemPrompt(genConfig, currentGame)
      : buildSystemPrompt(genConfig, currentGame, platformHint2, scriptTypeConfig)

    const count = variantStore.variantCount
    const variants = variantStore.startGeneration()

    chatStore.addMessage({
      role: 'user',
      content: `生成 ${count} 个脚本变体`,
      timestamp: Date.now(),
    })

    const scriptTypeName = SCRIPT_TYPES.find((t) => t.id === genConfig.scriptType)?.name ?? ''
    const userPrompt = `请根据以上配置，严格按照「${scriptTypeName}」脚本类型的输出格式和创作规则，生成买量视频脚本。`

    const tasks = variants.map((variant, index) => {
      const variantSuffix = buildVariantPromptSuffix(index, count)
      const messages = [
        { role: 'system', content: baseSystemPrompt + variantSuffix },
        { role: 'user', content: userPrompt },
      ]

      return streamChat(
        {
          config,
          ...withFallback('gen'),
          messages,
          signal: chatStore.getSignal(),
        },
        {
          onChunk: (chunk) => {
            const v = variantStore.variants.find((v) => v.id === variant.id)
            if (v) v.content += chunk
          },
          onDone: () => variantStore.finishVariant(variant.id),
          onError: (err) => {
            variantStore.updateVariant(variant.id, { generating: false, error: err })
            variantStore.finishVariant(variant.id)
          },
        },
      )
    })

    await Promise.allSettled(tasks)

    const first = variantStore.variants.find((v) => v.content && !v.error)
    if (first) {
      chatStore.addMessage({
        role: 'assistant',
        content: first.content,
        timestamp: Date.now(),
        type: MessageType.Script,
      })
    }
    saveSession()
  }

  async function generateGameplayDirections(): Promise<void> {
    const config = unref(settingsStore.config)
    if (!settingsStore.hasApiKey) {
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
        ...withFallback('gen'),
        messages,
        signal: chatStore.getSignal(),
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
    if (!settingsStore.hasApiKey) {
      chatStore.failGeneration('请先配置 API Key')
      showToast('请先配置 API Key', 'destructive')
      return
    }

    const genConfig = unref(configStore.config)
    const currentGame = unref(gameStore.currentGame)
    const userPrompt = buildGameplayDetailPrompt(directionNumber, genConfig, currentGame)

    const allApiMsgs = chatStore.getMessagesForApi()
    const lastAssistant = [...allApiMsgs].reverse().find((m) => m.role === 'assistant')
    const directionsContent = lastAssistant?.content ?? ''
    const systemPrompt = buildUeSystemPrompt(genConfig, currentGame)

    const dirLabel = ['一', '二', '三'][directionNumber - 1] ?? String(directionNumber)
    chatStore.addMessage({
      role: 'user',
      content: `选择方向${dirLabel}，生成完整脚本`,
      timestamp: Date.now(),
    })
    chatStore.startGeneration(MessageType.Script)

    const directionsRequestPrompt = buildGameplayDirectionsPrompt(genConfig, currentGame)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: directionsRequestPrompt },
      { role: 'assistant', content: directionsContent },
      { role: 'user', content: userPrompt },
    ]

    await streamChat(
      {
        config,
        ...withFallback('gen'),
        messages,
        maxTokens: API_DEFAULTS.MAX_TOKENS_SCRIPT,
        signal: chatStore.getSignal(),
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

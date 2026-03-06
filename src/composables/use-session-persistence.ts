import { useChatStore } from '@/stores/chat-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useHistoryStore } from '@/stores/history-store'
import { useImageStore } from '@/stores/image-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { ProductionDirection } from '@/models/enums'

export function useSessionPersistence() {
  const chatStore = useChatStore()
  const configStore = useConfigStore()
  const gameStore = useGameStore()
  const historyStore = useHistoryStore()
  const imageStore = useImageStore()
  const themeRadarStore = useThemeRadarStore()
  const gameplayRadarStore = useGameplayRadarStore()

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

  return { saveSession }
}

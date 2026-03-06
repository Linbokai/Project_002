import { useSettingsStore } from '@/stores/settings-store'
import { useGameStore } from '@/stores/game-store'
import { useHistoryStore } from '@/stores/history-store'
import type { ApiConfig, Game, ChatSession } from '@/models/types'
import { useToast } from '@/composables/use-toast'

interface ExportPayload {
  version: number
  exportedAt: number
  settings?: ApiConfig
  games?: Game[]
  sessions?: ChatSession[]
}

export function useDataIO() {
  const settingsStore = useSettingsStore()
  const gameStore = useGameStore()
  const historyStore = useHistoryStore()
  const { showToast } = useToast()

  function exportAll(): string {
    const payload: ExportPayload = {
      version: 1,
      exportedAt: Date.now(),
      settings: settingsStore.config,
      games: gameStore.games,
      sessions: historyStore.sessions,
    }
    return JSON.stringify(payload, null, 2)
  }

  function exportSettings(): string {
    return JSON.stringify({ version: 1, exportedAt: Date.now(), settings: settingsStore.config }, null, 2)
  }

  function exportGames(): string {
    return JSON.stringify({ version: 1, exportedAt: Date.now(), games: gameStore.games }, null, 2)
  }

  function exportSessions(): string {
    return JSON.stringify({ version: 1, exportedAt: Date.now(), sessions: historyStore.sessions }, null, 2)
  }

  function importData(jsonString: string): { success: boolean; message: string } {
    try {
      const payload = JSON.parse(jsonString) as ExportPayload
      if (!payload.version) {
        return { success: false, message: '无效的导入文件格式' }
      }

      let importedCount = 0

      if (payload.settings) {
        settingsStore.updateConfig(payload.settings)
        importedCount++
      }

      if (payload.games && Array.isArray(payload.games)) {
        for (const game of payload.games) {
          const existing = gameStore.games.find((g) => g.id === game.id)
          if (!existing) {
            gameStore.addGame(game)
            importedCount++
          }
        }
      }

      if (payload.sessions && Array.isArray(payload.sessions)) {
        for (const session of payload.sessions) {
          const existing = historyStore.getSession(session.id)
          if (!existing) {
            historyStore.addSession(session)
            importedCount++
          }
        }
      }

      return { success: true, message: `成功导入 ${importedCount} 项数据` }
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : '导入失败' }
    }
  }

  function downloadJson(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    showToast(`已导出: ${filename}`, 'success')
  }

  return { exportAll, exportSettings, exportGames, exportSessions, importData, downloadJson }
}

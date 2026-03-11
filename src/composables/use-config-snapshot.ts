import { useGameStore } from '@/stores/game-store'
import { useConfigStore } from '@/stores/config-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { useTemplateStore } from '@/stores/template-store'
import { useToast } from '@/composables/use-toast'
import { STORAGE_KEYS } from '@/constants'
import { setItem } from '@/utils'

interface ConfigSnapshot {
  version: 1
  exportedAt: string
  games: unknown[]
  selectedGameIndex: number
  generationConfig: unknown
  platformId: string
  customThemes: unknown[]
  customGameplays: unknown[]
  userTemplates: unknown[]
}

export function useConfigSnapshot() {
  const gameStore = useGameStore()
  const configStore = useConfigStore()
  const themeStore = useThemeRadarStore()
  const gameplayStore = useGameplayRadarStore()
  const templateStore = useTemplateStore()
  const { showToast } = useToast()

  function exportSnapshot(filename?: string): void {
    const snapshot: ConfigSnapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      games: JSON.parse(JSON.stringify(gameStore.games)),
      selectedGameIndex: gameStore.selectedIndex,
      generationConfig: JSON.parse(JSON.stringify(configStore.config)),
      platformId: configStore.platformId,
      customThemes: JSON.parse(JSON.stringify(themeStore.customThemes)),
      customGameplays: JSON.parse(JSON.stringify(gameplayStore.customGameplays)),
      userTemplates: JSON.parse(JSON.stringify(templateStore.userTemplates)),
    }

    const json = JSON.stringify(snapshot, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = filename ?? `工作台配置_${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('配置已导出，可分享给团队成员导入使用', 'success')
  }

  function applySnapshot(snapshot: ConfigSnapshot): void {
    if (snapshot.version !== 1) {
      showToast('配置文件版本不兼容', 'destructive')
      return
    }

    // Write persistent data to localStorage (stores read it on init)
    if (Array.isArray(snapshot.games)) {
      setItem(STORAGE_KEYS.GAMES, snapshot.games)
      setItem(STORAGE_KEYS.SELECTED_GAME, snapshot.selectedGameIndex ?? 0)
    }
    if (snapshot.generationConfig) {
      setItem(STORAGE_KEYS.GENERATION_CONFIG, snapshot.generationConfig)
    }
    if (snapshot.platformId) {
      setItem('sg_platform', snapshot.platformId)
    }
    if (Array.isArray(snapshot.userTemplates)) {
      setItem(STORAGE_KEYS.USER_TEMPLATES, snapshot.userTemplates)
    }

    // Custom themes / gameplays live only in memory — apply directly to reactive state
    if (Array.isArray(snapshot.customThemes)) {
      themeStore.customThemes.splice(0, themeStore.customThemes.length, ...(snapshot.customThemes as never[]))
    }
    if (Array.isArray(snapshot.customGameplays)) {
      gameplayStore.customGameplays.splice(0, gameplayStore.customGameplays.length, ...(snapshot.customGameplays as never[]))
    }

    // Reload to re-initialize stores that read localStorage on mount
    showToast('配置导入成功，页面即将刷新', 'success')
    setTimeout(() => window.location.reload(), 1200)
  }

  function importSnapshot(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const raw = e.target?.result as string
          const snapshot = JSON.parse(raw) as ConfigSnapshot
          applySnapshot(snapshot)
          resolve()
        } catch {
          showToast('配置文件解析失败，请确认文件格式正确', 'destructive')
          reject(new Error('parse error'))
        }
      }
      reader.onerror = () => {
        showToast('文件读取失败', 'destructive')
        reject(new Error('read error'))
      }
      reader.readAsText(file)
    })
  }

  function triggerImport(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) importSnapshot(file)
    }
    input.click()
  }

  return { exportSnapshot, triggerImport }
}

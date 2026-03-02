import { ref, watch, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings-store'
import { fetchKeyInfo } from '@/services/api/openrouter-client'
import type { KeyInfo } from '@/models/types'

const POLL_INTERVAL = 60_000

export function useBalance() {
  const settingsStore = useSettingsStore()

  const keyInfo = ref<KeyInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let timer: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    const apiKey = settingsStore.config.openRouterKey
    if (!apiKey) {
      keyInfo.value = null
      error.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      keyInfo.value = await fetchKeyInfo(apiKey)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function startPolling() {
    stopPolling()
    timer = setInterval(refresh, POLL_INTERVAL)
  }

  function stopPolling() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  watch(
    () => settingsStore.config.openRouterKey,
    (key) => {
      if (key) {
        refresh()
        startPolling()
      } else {
        stopPolling()
        keyInfo.value = null
        error.value = null
      }
    },
    { immediate: true },
  )

  onUnmounted(stopPolling)

  return { keyInfo, loading, error, refresh }
}

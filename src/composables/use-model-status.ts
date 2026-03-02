import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings-store'
import { testConnection } from '@/services/api/openrouter-api'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export function useModelStatus() {
  const settingsStore = useSettingsStore()

  const searchStatus = ref<ConnectionStatus>('disconnected')
  const genStatus = ref<ConnectionStatus>('disconnected')
  const visionStatus = ref<ConnectionStatus>('disconnected')

  const timers: Record<string, ReturnType<typeof setTimeout>> = {}

  async function testModel(
    task: 'search' | 'gen' | 'vision',
    statusRef: ReturnType<typeof ref<ConnectionStatus>>,
  ) {
    if (!settingsStore.hasApiKey) {
      statusRef.value = 'disconnected'
      return
    }

    const model = settingsStore.getModelForTask(task)
    if (!model) {
      statusRef.value = 'disconnected'
      return
    }

    statusRef.value = 'connecting'

    try {
      const result = await testConnection(settingsStore.config, model)
      statusRef.value = result.ok ? 'connected' : 'disconnected'
    } catch {
      statusRef.value = 'disconnected'
    }
  }

  function debouncedTest(
    task: 'search' | 'gen' | 'vision',
    statusRef: ReturnType<typeof ref<ConnectionStatus>>,
  ) {
    clearTimeout(timers[task])
    timers[task] = setTimeout(() => testModel(task, statusRef), 400)
  }

  function testAll() {
    testModel('search', searchStatus)
    testModel('gen', genStatus)
    testModel('vision', visionStatus)
  }

  watch(() => settingsStore.config.searchModel, () => debouncedTest('search', searchStatus))
  watch(() => settingsStore.config.genModel, () => debouncedTest('gen', genStatus))
  watch(() => settingsStore.config.visionModel, () => debouncedTest('vision', visionStatus))
  watch(() => settingsStore.config.openRouterKey, () => testAll())

  onMounted(() => testAll())

  return { searchStatus, genStatus, visionStatus, testAll }
}

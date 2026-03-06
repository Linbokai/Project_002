import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings-store'
import { testConnection } from '@/services/api/openrouter-api'
import { useResolvedModel } from '@/composables/use-resolved-model'
import type { TaskType } from '@/models/types'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export function useModelStatus() {
  const settingsStore = useSettingsStore()
  const { getModelForTask } = useResolvedModel()

  const searchStatus = ref<ConnectionStatus>('disconnected')
  const genStatus = ref<ConnectionStatus>('disconnected')
  const visionStatus = ref<ConnectionStatus>('disconnected')
  const imageStatus = ref<ConnectionStatus>('disconnected')

  const statusRefs: Record<TaskType, ReturnType<typeof ref<ConnectionStatus>>> = {
    search: searchStatus,
    gen: genStatus,
    vision: visionStatus,
    image: imageStatus,
  }

  const timers: Record<string, ReturnType<typeof setTimeout>> = {}

  async function testModel(
    task: TaskType,
    statusRef: ReturnType<typeof ref<ConnectionStatus>>,
  ) {
    if (!settingsStore.hasApiKey) {
      statusRef.value = 'disconnected'
      return
    }

    const model = getModelForTask(task)
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
    task: TaskType,
    statusRef: ReturnType<typeof ref<ConnectionStatus>>,
  ) {
    clearTimeout(timers[task])
    timers[task] = setTimeout(() => testModel(task, statusRef), 400)
  }

  function testAll() {
    for (const task of Object.keys(statusRefs) as TaskType[]) {
      testModel(task, statusRefs[task])
    }
  }

  // Watch resolved model per task — works for both manual and auto modes
  watch(() => getModelForTask('search'), () => debouncedTest('search', searchStatus))
  watch(() => getModelForTask('gen'), () => debouncedTest('gen', genStatus))
  watch(() => getModelForTask('vision'), () => debouncedTest('vision', visionStatus))
  watch(() => getModelForTask('image'), () => debouncedTest('image', imageStatus))
  watch(() => settingsStore.config.openRouterKey, () => testAll())

  onMounted(() => testAll())

  return { searchStatus, genStatus, visionStatus, imageStatus, testAll }
}

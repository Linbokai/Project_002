import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OpenRouterModelInfo, TaskType } from '@/models/types'

const CACHE_TTL = 30 * 60 * 1000
const FAILURE_TTL = 5 * 60 * 1000

interface FailedModelEntry {
  modelId: string
  failedAt: number
  error: string
}

export const useModelRoutingStore = defineStore('modelRouting', () => {
  const cachedModels = ref<OpenRouterModelInfo[]>([])
  const resolvedModels = ref<Record<TaskType, string>>({
    search: '',
    gen: '',
    vision: '',
    image: '',
  })
  const lastFetchTime = ref(0)
  const loading = ref(false)
  const failedModels = ref<FailedModelEntry[]>([])

  function setCachedModels(models: OpenRouterModelInfo[]) {
    cachedModels.value = models
    lastFetchTime.value = Date.now()
  }

  function setResolvedModels(resolved: Record<TaskType, string>) {
    resolvedModels.value = resolved
  }

  function setLoading(val: boolean) {
    loading.value = val
  }

  function isCacheValid(): boolean {
    return (
      cachedModels.value.length > 0 &&
      Date.now() - lastFetchTime.value < CACHE_TTL
    )
  }

  function invalidateCache() {
    lastFetchTime.value = 0
  }

  function markModelFailed(modelId: string, error: string) {
    failedModels.value = failedModels.value.filter((e) => e.modelId !== modelId)
    failedModels.value.push({ modelId, failedAt: Date.now(), error })
  }

  function getFailedModelIds(): string[] {
    const now = Date.now()
    failedModels.value = failedModels.value.filter(
      (e) => now - e.failedAt < FAILURE_TTL,
    )
    return failedModels.value.map((e) => e.modelId)
  }

  function clearFailedModels() {
    failedModels.value = []
  }

  return {
    cachedModels,
    resolvedModels,
    lastFetchTime,
    loading,
    failedModels,
    setCachedModels,
    setResolvedModels,
    setLoading,
    isCacheValid,
    invalidateCache,
    markModelFailed,
    getFailedModelIds,
    clearFailedModels,
  }
})

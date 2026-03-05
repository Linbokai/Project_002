import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OpenRouterModelInfo, TaskType } from '@/models/types'

const CACHE_TTL = 30 * 60 * 1000

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

  return {
    cachedModels,
    resolvedModels,
    lastFetchTime,
    loading,
    setCachedModels,
    setResolvedModels,
    setLoading,
    isCacheValid,
    invalidateCache,
  }
})

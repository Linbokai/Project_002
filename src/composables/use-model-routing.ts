import { useModelRoutingStore } from '@/stores/model-routing-store'
import { useSettingsStore } from '@/stores/settings-store'
import { fetchAvailableModels } from '@/services/api/model-discovery-api'
import {
  filterModelsByTask,
  scoreModels,
  pickBestModel,
} from '@/services/helpers/model-scorer'
import { API_DEFAULTS } from '@/constants'
import type { TaskType, RoutingProfile } from '@/models/types'

const TASK_TYPES: TaskType[] = ['search', 'gen', 'vision', 'image']

const FALLBACK_MODELS: Record<TaskType, string> = {
  search: API_DEFAULTS.SEARCH_MODEL,
  gen: API_DEFAULTS.GEN_MODEL,
  vision: API_DEFAULTS.VISION_MODEL,
  image: API_DEFAULTS.IMAGE_MODEL,
}

export function useModelRouting() {
  const routingStore = useModelRoutingStore()
  const settingsStore = useSettingsStore()

  async function refreshModels(): Promise<void> {
    if (routingStore.isCacheValid()) return

    const apiKey = settingsStore.config.openRouterKey
    if (!apiKey) return

    routingStore.setLoading(true)
    try {
      const models = await fetchAvailableModels(apiKey)
      routingStore.setCachedModels(models)
      recalculateRouting()
    } catch {
      routingStore.setResolvedModels({ ...FALLBACK_MODELS })
    } finally {
      routingStore.setLoading(false)
    }
  }

  function recalculateRouting(profile?: RoutingProfile): void {
    const activeProfile = profile ?? settingsStore.config.routingProfile
    const models = routingStore.cachedModels

    if (models.length === 0) {
      routingStore.setResolvedModels({ ...FALLBACK_MODELS })
      return
    }

    const resolved = {} as Record<TaskType, string>
    for (const task of TASK_TYPES) {
      const filtered = filterModelsByTask(models, task)
      if (filtered.length === 0) {
        resolved[task] = FALLBACK_MODELS[task]
        continue
      }
      const scores = scoreModels(filtered, task)
      const best = pickBestModel(scores, activeProfile)
      resolved[task] = best || FALLBACK_MODELS[task]
    }

    routingStore.setResolvedModels(resolved)
  }

  function resolveModel(task: TaskType): string {
    return routingStore.resolvedModels[task] || FALLBACK_MODELS[task]
  }

  return {
    refreshModels,
    recalculateRouting,
    resolveModel,
  }
}

import { useSettingsStore } from '@/stores/settings-store'
import { useModelRoutingStore } from '@/stores/model-routing-store'
import { useModelRouting } from '@/composables/use-model-routing'
import { useToast, type ToastVariant } from '@/composables/use-toast'
import { TASK_MODEL_OPTIONS } from '@/constants/model-options'
import type { TaskType } from '@/models/types'

function extractModelName(modelId: string): string {
  return modelId.split('/').pop() ?? modelId
}

export function useResolvedModel() {
  const settingsStore = useSettingsStore()
  const routingStore = useModelRoutingStore()
  const { getFallbackChain } = useModelRouting()

  let toastFn: ((msg: string, variant?: ToastVariant) => void) | null = null
  try {
    const { showToast } = useToast()
    toastFn = showToast
  } catch {
    // Not in a component context with toast provider
  }

  function getModelForTask(task: TaskType): string {
    if (settingsStore.config.routingMode === 'auto') {
      const resolved = routingStore.resolvedModels[task]
      if (resolved) return resolved
    }
    return settingsStore.getManualModel(task)
  }

  function getModelChainForTask(task: TaskType): string[] {
    if (settingsStore.config.routingMode === 'auto') {
      const chain = getFallbackChain(task)
      if (chain.length > 0) return chain
    }

    const primary = settingsStore.getManualModel(task)
    const failedIds = routingStore.getFailedModelIds()
    const alternatives = TASK_MODEL_OPTIONS[task]
      .filter((id) => id !== primary && !failedIds.includes(id))
      .slice(0, 2)
    return [primary, ...alternatives]
  }

  function handleModelFallback(failedModel: string, nextModel: string) {
    routingStore.markModelFailed(failedModel, 'request_failed')
    const msg = `${extractModelName(failedModel)} 不可用，已切换到 ${extractModelName(nextModel)}`
    toastFn?.(msg, 'default')
    return msg
  }

  function withFallback(task: TaskType) {
    const chain = getModelChainForTask(task)
    return {
      model: chain[0]!,
      fallbackModels: chain.slice(1),
      onModelFallback: (failed: string, next: string) => {
        handleModelFallback(failed, next)
      },
    }
  }

  return { getModelForTask, getModelChainForTask, handleModelFallback, withFallback }
}

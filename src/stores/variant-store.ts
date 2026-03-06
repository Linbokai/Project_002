import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScriptVariant, VariantCount } from '@/models/types/variant'
import { generateId } from '@/utils'
import { getAngleLabel } from '@/constants/variant-angles'

const VARIANT_LABELS = ['变体A', '变体B', '变体C', '变体D', '变体E']

export const useVariantStore = defineStore('variant', () => {
  const variants = ref<ScriptVariant[]>([])
  const variantCount = ref<VariantCount>(1)
  const isGenerating = ref(false)
  const selectedId = ref<string | null>(null)

  const hasVariants = computed(() => variants.value.length > 0)
  const allFinished = computed(() =>
    variants.value.length > 0 && variants.value.every((v) => !v.generating),
  )
  const selectedVariant = computed(() =>
    variants.value.find((v) => v.id === selectedId.value),
  )

  function setVariantCount(count: VariantCount) {
    variantCount.value = count
  }

  function startGeneration(): ScriptVariant[] {
    const count = variantCount.value
    isGenerating.value = true
    selectedId.value = null

    variants.value = Array.from({ length: count }, (_, i) => ({
      id: generateId(),
      label: VARIANT_LABELS[i] ?? `变体${i + 1}`,
      angle: getAngleLabel(i),
      content: '',
      generating: true,
    }))

    return variants.value
  }

  function updateVariant(id: string, partial: Partial<Pick<ScriptVariant, 'content' | 'generating' | 'error'>>) {
    const target = variants.value.find((v) => v.id === id)
    if (!target) return
    Object.assign(target, partial)
  }

  function finishVariant(id: string) {
    updateVariant(id, { generating: false })
    if (variants.value.every((v) => !v.generating)) {
      isGenerating.value = false
    }
  }

  function clearVariants() {
    variants.value = []
    isGenerating.value = false
    selectedId.value = null
  }

  function selectVariant(id: string) {
    selectedId.value = id
  }

  return {
    variants,
    variantCount,
    isGenerating,
    selectedId,
    hasVariants,
    allFinished,
    selectedVariant,
    setVariantCount,
    startGeneration,
    updateVariant,
    finishVariant,
    clearVariants,
    selectVariant,
  }
})

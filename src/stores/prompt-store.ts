import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ScriptType } from '@/models/enums'
import type { ScriptTypeConfig } from '@/constants/script-types'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem } from '@/utils'

export interface PromptOverride {
  role?: string
  format?: string
  rules?: string[]
}

type OverrideMap = Partial<Record<ScriptType, PromptOverride>>

export const usePromptStore = defineStore('prompt', () => {
  const overrides = ref<OverrideMap>(
    getItem<OverrideMap>(STORAGE_KEYS.PROMPT_OVERRIDES, {}),
  )

  function persist() {
    setItem(STORAGE_KEYS.PROMPT_OVERRIDES, overrides.value)
  }

  function getEffectiveConfig(scriptTypeId: ScriptType): ScriptTypeConfig | undefined {
    const base = SCRIPT_TYPES.find((t) => t.id === scriptTypeId)
    if (!base) return undefined

    const override = overrides.value[scriptTypeId]
    if (!override) return base

    return {
      ...base,
      role: override.role ?? base.role,
      format: override.format ?? base.format,
      rules: override.rules ?? base.rules,
    }
  }

  function setOverride(scriptTypeId: ScriptType, patch: PromptOverride) {
    overrides.value[scriptTypeId] = {
      ...overrides.value[scriptTypeId],
      ...patch,
    }
    persist()
  }

  function resetOverride(scriptTypeId: ScriptType) {
    delete overrides.value[scriptTypeId]
    persist()
  }

  function resetAll() {
    overrides.value = {}
    persist()
  }

  function hasOverride(scriptTypeId: ScriptType): boolean {
    return !!overrides.value[scriptTypeId]
  }

  return { overrides, getEffectiveConfig, setOverride, resetOverride, resetAll, hasOverride }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScriptTemplate, UserTemplate, TemplateConfig } from '@/models/types'
import { STORAGE_KEYS } from '@/constants'
import { SCRIPT_TEMPLATES, TEMPLATE_CATEGORIES } from '@/constants/script-templates'
import { getItem, setItem, generateId } from '@/utils'

export const useTemplateStore = defineStore('template', () => {
  const userTemplates = ref<UserTemplate[]>(
    getItem<UserTemplate[]>(STORAGE_KEYS.USER_TEMPLATES, []),
  )

  const builtInTemplates = computed(() => SCRIPT_TEMPLATES)
  const categories = computed(() => TEMPLATE_CATEGORIES)

  function getByCategory(categoryId: string): ScriptTemplate[] {
    return SCRIPT_TEMPLATES.filter((t) => t.category === categoryId)
  }

  const quickStartTemplates = computed(() =>
    SCRIPT_TEMPLATES.filter((t) => t.category === 'popular'),
  )

  function saveUserTemplate(name: string, description: string, config: TemplateConfig) {
    const tpl: UserTemplate = {
      id: generateId(),
      name,
      description,
      config: { ...config },
      createdAt: Date.now(),
    }
    userTemplates.value.push(tpl)
    setItem(STORAGE_KEYS.USER_TEMPLATES, userTemplates.value)
    return tpl
  }

  function removeUserTemplate(id: string) {
    userTemplates.value = userTemplates.value.filter((t) => t.id !== id)
    setItem(STORAGE_KEYS.USER_TEMPLATES, userTemplates.value)
  }

  function findTemplate(id: string): ScriptTemplate | UserTemplate | undefined {
    return SCRIPT_TEMPLATES.find((t) => t.id === id)
      ?? userTemplates.value.find((t) => t.id === id)
  }

  return {
    userTemplates,
    builtInTemplates,
    categories,
    quickStartTemplates,
    getByCategory,
    saveUserTemplate,
    removeUserTemplate,
    findTemplate,
  }
})

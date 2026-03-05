import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScriptTemplate, UserTemplate, TemplateConfig, GameCategory } from '@/models/types'
import { STORAGE_KEYS } from '@/constants'
import { SCRIPT_TEMPLATES, TEMPLATE_CATEGORIES, GAME_CATEGORY_FILTERS } from '@/constants/script-templates'
import { getItem, setItem, generateId } from '@/utils'

const USAGE_STORAGE_KEY = 'sg_template_usage'

export const useTemplateStore = defineStore('template', () => {
  const userTemplates = ref<UserTemplate[]>(
    getItem<UserTemplate[]>(STORAGE_KEYS.USER_TEMPLATES, []),
  )

  const usageMap = ref<Record<string, number>>(
    getItem<Record<string, number>>(USAGE_STORAGE_KEY, {}),
  )

  const builtInTemplates = computed(() => SCRIPT_TEMPLATES)
  const categories = computed(() => TEMPLATE_CATEGORIES)
  const gameCategoryFilters = computed(() => GAME_CATEGORY_FILTERS)

  function getByCategory(categoryId: string): ScriptTemplate[] {
    return SCRIPT_TEMPLATES.filter((t) => t.category === categoryId)
  }

  function getByCategoryAndGame(
    categoryId: string,
    gameCategory: GameCategory | 'all',
  ): ScriptTemplate[] {
    let list = SCRIPT_TEMPLATES.filter((t) => t.category === categoryId)
    if (gameCategory !== 'all') {
      list = list.filter((t) => t.gameCategory === gameCategory)
    }
    return list
  }

  function searchTemplates(query: string): ScriptTemplate[] {
    if (!query.trim()) return SCRIPT_TEMPLATES
    const q = query.toLowerCase()
    return SCRIPT_TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.preview && t.preview.toLowerCase().includes(q)),
    )
  }

  function getTemplatesByUsage(): ScriptTemplate[] {
    return [...SCRIPT_TEMPLATES].sort(
      (a, b) => (usageMap.value[b.id] ?? 0) - (usageMap.value[a.id] ?? 0),
    )
  }

  function getUsageCount(templateId: string): number {
    return usageMap.value[templateId] ?? 0
  }

  function trackUsage(templateId: string) {
    usageMap.value[templateId] = (usageMap.value[templateId] ?? 0) + 1
    setItem(USAGE_STORAGE_KEY, usageMap.value)
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
    gameCategoryFilters,
    quickStartTemplates,
    getByCategory,
    getByCategoryAndGame,
    searchTemplates,
    getTemplatesByUsage,
    getUsageCount,
    trackUsage,
    saveUserTemplate,
    removeUserTemplate,
    findTemplate,
  }
})

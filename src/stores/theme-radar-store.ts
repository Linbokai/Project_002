import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ThemeTopic, CustomTheme } from '@/models/types'
import { SearchPlatform } from '@/models/enums'

export const useThemeRadarStore = defineStore('themeRadar', () => {
  const platform = ref<SearchPlatform>(SearchPlatform.All)
  const searchResults = ref<ThemeTopic[]>([])
  const customThemes = ref<CustomTheme[]>([])
  const searching = ref(false)

  const selectedSearchResults = computed(() =>
    searchResults.value.filter((t) => t.selected),
  )

  const selectedCustomThemes = computed(() =>
    customThemes.value.filter((t) => t.selected),
  )

  const totalSelected = computed(() =>
    selectedSearchResults.value.length + selectedCustomThemes.value.length,
  )

  function setPlatform(p: SearchPlatform) {
    platform.value = p
  }

  function setSearching(value: boolean) {
    searching.value = value
  }

  function setSearchResults(results: ThemeTopic[]) {
    searchResults.value = results
  }

  function toggleSearchResult(id: string) {
    const item = searchResults.value.find((t) => t.id === id)
    if (item) item.selected = !item.selected
  }

  function addCustomTheme(theme: Omit<CustomTheme, 'id' | 'selected'>) {
    customThemes.value.push({
      ...theme,
      id: Date.now().toString(36),
      selected: true,
    })
  }

  function toggleCustomTheme(id: string) {
    const item = customThemes.value.find((t) => t.id === id)
    if (item) item.selected = !item.selected
  }

  function removeCustomTheme(id: string) {
    customThemes.value = customThemes.value.filter((t) => t.id !== id)
  }

  function getAllSelectedNames(): string[] {
    return [
      ...selectedSearchResults.value.map((t) => t.name),
      ...selectedCustomThemes.value.map((t) => t.name),
    ]
  }

  return {
    platform,
    searchResults,
    customThemes,
    searching,
    selectedSearchResults,
    selectedCustomThemes,
    totalSelected,
    setPlatform,
    setSearching,
    setSearchResults,
    toggleSearchResult,
    addCustomTheme,
    toggleCustomTheme,
    removeCustomTheme,
    getAllSelectedNames,
  }
})

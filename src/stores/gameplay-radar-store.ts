import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameplayTopic, CustomGameplay } from '@/models/types'
import { SearchRegion } from '@/models/enums'

export const useGameplayRadarStore = defineStore('gameplayRadar', () => {
  const region = ref<SearchRegion>(SearchRegion.Domestic)
  const domesticResults = ref<GameplayTopic[]>([])
  const overseasResults = ref<GameplayTopic[]>([])
  const customGameplays = ref<CustomGameplay[]>([])
  const searching = ref(false)

  const currentRegionResults = computed(() =>
    region.value === SearchRegion.Domestic
      ? domesticResults.value
      : overseasResults.value,
  )

  const selectedSearchResults = computed(() => [
    ...domesticResults.value.filter((t) => t.selected),
    ...overseasResults.value.filter((t) => t.selected),
  ])

  const selectedCustomGameplays = computed(() =>
    customGameplays.value.filter((t) => t.selected),
  )

  const totalSelected = computed(() =>
    selectedSearchResults.value.length + selectedCustomGameplays.value.length,
  )

  function setRegion(r: SearchRegion) {
    region.value = r
  }

  function setSearching(value: boolean) {
    searching.value = value
  }

  function setSearchResults(target: SearchRegion, results: GameplayTopic[]) {
    if (target === SearchRegion.Domestic) {
      domesticResults.value = results
    } else {
      overseasResults.value = results
    }
  }

  function toggleSearchResult(id: string) {
    const item =
      domesticResults.value.find((t) => t.id === id) ??
      overseasResults.value.find((t) => t.id === id)
    if (item) item.selected = !item.selected
  }

  function addCustomGameplay(gameplay: Omit<CustomGameplay, 'id' | 'selected'>) {
    customGameplays.value.push({
      ...gameplay,
      id: Date.now().toString(36),
      selected: true,
    })
  }

  function toggleCustomGameplay(id: string) {
    const item = customGameplays.value.find((t) => t.id === id)
    if (item) item.selected = !item.selected
  }

  function removeCustomGameplay(id: string) {
    customGameplays.value = customGameplays.value.filter((t) => t.id !== id)
  }

  function getAllSelectedNames(): string[] {
    return [
      ...selectedSearchResults.value.map((t) => t.name),
      ...selectedCustomGameplays.value.map((t) => t.name),
    ]
  }

  return {
    region,
    domesticResults,
    overseasResults,
    customGameplays,
    searching,
    currentRegionResults,
    selectedSearchResults,
    selectedCustomGameplays,
    totalSelected,
    setRegion,
    setSearching,
    setSearchResults,
    toggleSearchResult,
    addCustomGameplay,
    toggleCustomGameplay,
    removeCustomGameplay,
    getAllSelectedNames,
  }
})

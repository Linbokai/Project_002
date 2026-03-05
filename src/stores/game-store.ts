import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Game } from '@/models/types'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem, generateId } from '@/utils'

interface RawGame {
  id: string
  name: string
  type?: string
  genre?: string
  coreSellingPoints?: string[]
  sell?: string
  targetMarket?: string
  mainCompetitors?: string
  launchedPlatforms?: string
  historicalHits?: string
  gameAssets?: Game['gameAssets']
}

function migrateGame(raw: unknown): Game {
  const r = raw as RawGame
  const type = r.type ?? r.genre ?? ''
  const coreSellingPoints: string[] =
    r.coreSellingPoints != null && Array.isArray(r.coreSellingPoints)
      ? r.coreSellingPoints
      : typeof r.sell === 'string'
        ? r.sell.split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean)
        : []
  return {
    id: r.id,
    name: r.name,
    type,
    coreSellingPoints,
    targetMarket: r.targetMarket,
    mainCompetitors: r.mainCompetitors,
    launchedPlatforms: r.launchedPlatforms,
    historicalHits: r.historicalHits,
    gameAssets: r.gameAssets,
  }
}

export const useGameStore = defineStore('game', () => {
  const rawGames = getItem<unknown[]>(STORAGE_KEYS.GAMES, [])
  const games = ref<Game[]>(rawGames.map((r) => migrateGame(r)))
  const selectedIndex = ref<number>(getItem<number>(STORAGE_KEYS.SELECTED_GAME, -1))

  const currentGame = computed<Game | null>(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < games.value.length) {
      return games.value[selectedIndex.value] ?? null
    }
    return null
  })

  const hasGames = computed(() => games.value.length > 0)

  function persist() {
    setItem(STORAGE_KEYS.GAMES, games.value)
    setItem(STORAGE_KEYS.SELECTED_GAME, selectedIndex.value)
  }

  function addGame(data: Omit<Game, 'id'>) {
    games.value.push({ ...data, id: generateId() })
    selectedIndex.value = games.value.length - 1
    persist()
  }

  function updateGame(id: string, data: Partial<Omit<Game, 'id'>>) {
    const idx = games.value.findIndex((g) => g.id === id)
    if (idx !== -1) {
      Object.assign(games.value[idx]!, data)
      persist()
    }
  }

  function removeGame(id: string) {
    const idx = games.value.findIndex((g) => g.id === id)
    if (idx === -1) return
    games.value.splice(idx, 1)
    if (selectedIndex.value >= games.value.length) {
      selectedIndex.value = games.value.length - 1
    }
    persist()
  }

  function selectGame(index: number) {
    selectedIndex.value = index
    setItem(STORAGE_KEYS.SELECTED_GAME, index)
  }

  return { games, selectedIndex, currentGame, hasGames, addGame, updateGame, removeGame, selectGame }
})

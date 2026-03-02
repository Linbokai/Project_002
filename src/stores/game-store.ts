import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Game } from '@/models/types'
import { STORAGE_KEYS } from '@/constants'
import { getItem, setItem, generateId } from '@/utils'

export const useGameStore = defineStore('game', () => {
  const games = ref<Game[]>(getItem<Game[]>(STORAGE_KEYS.GAMES, []))
  const selectedIndex = ref<number>(getItem<number>(STORAGE_KEYS.SELECTED_GAME, -1))

  const currentGame = computed<Game | null>(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < games.value.length) {
      return games.value[selectedIndex.value]
    }
    return null
  })

  const hasGames = computed(() => games.value.length > 0)

  function persist() {
    setItem(STORAGE_KEYS.GAMES, games.value)
    setItem(STORAGE_KEYS.SELECTED_GAME, selectedIndex.value)
  }

  function addGame(name: string, genre: string, sell: string) {
    games.value.push({ id: generateId(), name, genre, sell })
    selectedIndex.value = games.value.length - 1
    persist()
  }

  function updateGame(id: string, data: Partial<Omit<Game, 'id'>>) {
    const idx = games.value.findIndex((g) => g.id === id)
    if (idx !== -1) {
      games.value[idx] = { ...games.value[idx], ...data }
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

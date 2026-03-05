import { ref, computed } from 'vue'
import { useHistoryStore } from '@/stores/history-store'
import { getItem, setItem } from '@/utils'

const FAVORITES_KEY = 'sg_favorites'

function loadFavorites(): Set<string> {
  const stored = getItem<string[]>(FAVORITES_KEY, [])
  return new Set(stored)
}

function saveFavorites(favs: Set<string>) {
  setItem(FAVORITES_KEY, [...favs])
}

export function useHistoryFilter() {
  const historyStore = useHistoryStore()

  const searchQuery = ref('')
  const activeFilter = ref<'all' | 'favorited' | string>('all')
  const favorites = ref<Set<string>>(loadFavorites())

  const gameNames = computed(() => {
    const names = new Set<string>()
    for (const s of historyStore.sessions) {
      if (s.gameName) names.add(s.gameName)
    }
    return [...names].sort()
  })

  const filteredSessions = computed(() => {
    let list = historyStore.sessions

    if (activeFilter.value === 'favorited') {
      list = list.filter((s) => favorites.value.has(s.id))
    } else if (activeFilter.value !== 'all') {
      list = list.filter((s) => s.gameName === activeFilter.value)
    }

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (s) =>
          s.gameName.toLowerCase().includes(q) ||
          s.themes.toLowerCase().includes(q) ||
          s.preview.toLowerCase().includes(q),
      )
    }

    return list
  })

  function toggleFavorite(id: string) {
    const next = new Set(favorites.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    favorites.value = next
    saveFavorites(next)
  }

  function isFavorited(id: string) {
    return favorites.value.has(id)
  }

  const stats = computed(() => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    return {
      total: historyStore.sessions.length,
      favorited: historyStore.sessions.filter((s) => favorites.value.has(s.id)).length,
      thisWeek: historyStore.sessions.filter((s) => s.createdAt >= weekAgo).length,
    }
  })

  return {
    searchQuery,
    activeFilter,
    filteredSessions,
    gameNames,
    toggleFavorite,
    isFavorited,
    stats,
  }
}

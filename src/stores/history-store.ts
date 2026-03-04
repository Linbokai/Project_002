import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatSession } from '@/models/types'
import { STORAGE_KEYS, HISTORY_MAX } from '@/constants'
import { getItem, setItem, generateId } from '@/utils'
import { deleteSessionImages, clearAllSessionImages } from '@/utils/image-db'

export const useHistoryStore = defineStore('history', () => {
  const sessions = ref<ChatSession[]>(
    getItem<ChatSession[]>(STORAGE_KEYS.HISTORY, []),
  )

  function persist() {
    setItem(STORAGE_KEYS.HISTORY, sessions.value)
  }

  function addSession(session: Omit<ChatSession, 'id' | 'createdAt'>) {
    const newSession: ChatSession = {
      ...session,
      id: generateId(),
      createdAt: Date.now(),
    }
    sessions.value.unshift(newSession)
    if (sessions.value.length > HISTORY_MAX) {
      const removed = sessions.value.slice(HISTORY_MAX)
      sessions.value = sessions.value.slice(0, HISTORY_MAX)
      for (const s of removed) deleteSessionImages(s.id)
    }
    persist()
    return newSession.id
  }

  function removeSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id)
    persist()
    deleteSessionImages(id)
  }

  function clearAll() {
    sessions.value = []
    persist()
    clearAllSessionImages()
  }

  function updateSession(id: string, patch: Partial<Pick<ChatSession, 'messages' | 'preview' | 'themes'>>) {
    const session = sessions.value.find((s) => s.id === id)
    if (session) {
      Object.assign(session, patch)
      persist()
    }
  }

  function getSession(id: string): ChatSession | undefined {
    return sessions.value.find((s) => s.id === id)
  }

  return { sessions, addSession, updateSession, removeSession, clearAll, getSession }
})

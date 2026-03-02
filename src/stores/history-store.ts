import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatSession } from '@/models/types'
import { STORAGE_KEYS, HISTORY_MAX } from '@/constants'
import { getItem, setItem, generateId } from '@/utils'

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
      sessions.value = sessions.value.slice(0, HISTORY_MAX)
    }
    persist()
    return newSession.id
  }

  function removeSession(id: string) {
    sessions.value = sessions.value.filter((s) => s.id !== id)
    persist()
  }

  function clearAll() {
    sessions.value = []
    persist()
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

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/models/types'
import { GenerationStatus, type MessageType } from '@/models/enums'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const status = ref<GenerationStatus>(GenerationStatus.Idle)
  const currentStreamText = ref('')
  const errorMessage = ref('')
  const currentSessionId = ref<string | null>(null)
  let abortController: AbortController | null = null

  function getSignal(): AbortSignal | undefined {
    return abortController?.signal
  }

  function addMessage(message: ChatMessage) {
    messages.value.push(message)
  }

  function appendToStream(chunk: string) {
    currentStreamText.value += chunk
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant') {
      last.content = currentStreamText.value
    }
  }

  function startGeneration(type?: MessageType) {
    abortController = new AbortController()
    status.value = GenerationStatus.Generating
    currentStreamText.value = ''
    errorMessage.value = ''
    addMessage({ role: 'assistant', content: '', timestamp: Date.now(), type })
  }

  function finishGeneration() {
    abortController = null
    status.value = GenerationStatus.Done
    currentStreamText.value = ''
  }

  function cancelGeneration() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    status.value = GenerationStatus.Done
    currentStreamText.value = ''
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant' && !last.content) {
      messages.value.pop()
    }
  }

  function failGeneration(error: string) {
    status.value = GenerationStatus.Error
    errorMessage.value = error
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant' && !last.content) {
      messages.value.pop()
    }
  }

  function clearMessages() {
    messages.value = []
    status.value = GenerationStatus.Idle
    currentStreamText.value = ''
    errorMessage.value = ''
    currentSessionId.value = null
  }

  function getMessagesForApi(): Array<{ role: string; content: string }> {
    return messages.value
      .filter((m) => m.content.length > 0)
      .map((m) => ({ role: m.role, content: m.content }))
  }

  function removeMessagesAfter(index: number) {
    messages.value.splice(index + 1)
  }

  return {
    messages,
    status,
    currentStreamText,
    errorMessage,
    currentSessionId,
    addMessage,
    appendToStream,
    startGeneration,
    finishGeneration,
    cancelGeneration,
    getSignal,
    failGeneration,
    clearMessages,
    getMessagesForApi,
    removeMessagesAfter,
  }
})

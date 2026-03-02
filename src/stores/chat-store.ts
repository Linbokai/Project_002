import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/models/types'
import { GenerationStatus } from '@/models/enums'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const status = ref<GenerationStatus>(GenerationStatus.Idle)
  const currentStreamText = ref('')
  const errorMessage = ref('')

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

  function startGeneration() {
    status.value = GenerationStatus.Generating
    currentStreamText.value = ''
    errorMessage.value = ''
    addMessage({ role: 'assistant', content: '', timestamp: Date.now() })
  }

  function finishGeneration() {
    status.value = GenerationStatus.Done
    currentStreamText.value = ''
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
    addMessage,
    appendToStream,
    startGeneration,
    finishGeneration,
    failGeneration,
    clearMessages,
    getMessagesForApi,
    removeMessagesAfter,
  }
})

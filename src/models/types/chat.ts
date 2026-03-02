import type { MessageType } from '@/models/enums'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  type?: MessageType
}

export interface VideoMetrics {
  roi3d?: number
  roi7d?: number
  spend?: number
  ctr?: number
  cvr?: number
  cpa?: number
  completionRate?: number
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  gameName: string
  themes: string
  preview: string
  createdAt: number
}

import type { MessageType, ScriptType } from '@/models/enums'

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

export interface ScriptVersion {
  id: string
  content: string
  label: string
  createdAt: number
  parentId?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  gameName: string
  themes: string
  preview: string
  createdAt: number
  scriptType?: ScriptType
  rating?: 1 | 2 | 3
  ratingNote?: string
  versions?: ScriptVersion[]
}

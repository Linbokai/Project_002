export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  meta?: MessageMeta
}

export interface MessageMeta {
  type?: 'video-analysis'
}

export interface VideoMetrics {
  roi?: number
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

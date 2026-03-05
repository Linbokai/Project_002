export interface Shot {
  id: number
  timeRange: string
  segment: string
  scale?: string
  scene: string
  voiceover: string
  textOverlay?: string
  camera?: string
  vfx?: string
  transition?: string
  sfx?: string
  notes?: string
  stylePreset?: 'realistic' | 'anime' | 'pixel' | 'cyberpunk' | 'ink'
  sortOrder?: number
}

export interface ParsedScript {
  title: string
  shots: Shot[]
  rawText: string
}

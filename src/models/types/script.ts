export interface Shot {
  id: number
  timeRange: string
  segment: string
  scene: string
  voiceover: string
  textOverlay?: string
  camera?: string
  transition?: string
  sfx?: string
  notes?: string
}

export interface ParsedScript {
  title: string
  shots: Shot[]
  rawText: string
}

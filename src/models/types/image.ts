export type ImageAspectRatio =
  | '1:1' | '16:9' | '9:16'
  | '4:3' | '3:4' | '3:2' | '2:3'
  | '21:9' | '4:5' | '5:4'

export type ImageSize = '0.5K' | '1K' | '2K' | '4K'

export interface ImageConfig {
  aspect_ratio: ImageAspectRatio
  image_size: ImageSize
}

export interface GeneratedImage {
  url: string
  prompt: string
  model: string
  createdAt: number
}

export interface VisualContext {
  text: string
  extractedAt: number
  isEdited: boolean
}

export type ShotImageKey = string
export type ScriptKey = string

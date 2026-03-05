export interface ScriptVariant {
  id: string
  label: string
  angle: string
  content: string
  generating: boolean
  error?: string
}

export type VariantCount = 1 | 3 | 5

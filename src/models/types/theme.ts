import type { ThemeCategory } from '@/models/enums'

export interface ThemeTopic {
  id: string
  name: string
  desc: string
  tag: string
  heat: string
  hooks: string[]
  cases: string[]
  selected: boolean
}

export interface PresetTheme {
  id: string
  name: string
  tier: 'T1' | 'T2' | 'T3'
  description: string
  category: ThemeCategory
  scenes: string[]
}

export interface CustomTheme {
  id: string
  name: string
  description: string
  category: ThemeCategory
  selected: boolean
}

export interface GameplayPreset {
  id: string
  name: string
  tier: 'T1' | 'T2' | 'T3'
  description: string
  visualHook: string
  coreLoop: string
  tags: string[]
}

export interface GameplayTopic {
  id: string
  name: string
  desc: string
  source: string
  heat: string
  hooks: string[]
  selected: boolean
}

export interface CustomGameplay {
  id: string
  name: string
  description: string
  selected: boolean
}

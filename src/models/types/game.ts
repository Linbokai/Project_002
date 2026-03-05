export interface Game {
  id: string
  name: string
  type: string
  coreSellingPoints: string[]
  targetMarket?: string
  mainCompetitors?: string
  launchedPlatforms?: string
  historicalHits?: string
  gameAssets?: GameAsset[]
}

export interface GameAsset {
  id: string
  type: 'screenshot' | 'character' | 'logo' | 'other'
  name: string
  url?: string
  addedAt: number
}

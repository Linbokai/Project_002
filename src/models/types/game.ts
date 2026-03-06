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
  performanceHistory?: PerformanceRecord[]
}

export interface GameAsset {
  id: string
  type: 'screenshot' | 'character' | 'logo' | 'other'
  name: string
  url?: string
  addedAt: number
}

export interface PerformanceRecord {
  id: string
  roi?: number
  ctr?: number
  cvr?: number
  spend?: number
  date: number
  scriptId?: string
  note?: string
}

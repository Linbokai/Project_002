export interface RhythmSegment {
  time: string
  role: string
  density: string
  shots: string
  emotion: string
}

export interface RhythmTemplate {
  duration: number
  segments: RhythmSegment[]
}

export const RHYTHM_TEMPLATES: RhythmTemplate[] = [
  {
    duration: 5,
    segments: [
      { time: '0-2s', role: '钩子', density: '极高', shots: '1-2次快切', emotion: '震惊/好奇' },
      { time: '2-4s', role: '爆点', density: '极高', shots: '1次', emotion: '爽/满足' },
      { time: '4-5s', role: 'CTA', density: '中', shots: '定格', emotion: '行动欲' },
    ],
  },
  {
    duration: 10,
    segments: [
      { time: '0-2s', role: '钩子', density: '极高', shots: '1-2次', emotion: '震惊/好奇' },
      { time: '2-5s', role: '升级', density: '高', shots: '2-3次', emotion: '期待升级' },
      { time: '5-8s', role: '高潮', density: '极高', shots: '2-3次快切', emotion: '爽到顶峰' },
      { time: '8-10s', role: 'CTA', density: '中', shots: '1次+定格', emotion: '行动欲' },
    ],
  },
  {
    duration: 15,
    segments: [
      { time: '0-3s', role: '钩子', density: '极高', shots: '1-2次', emotion: '震惊/好奇' },
      { time: '3-6s', role: '铺垫', density: '高', shots: '2次', emotion: '好奇加深' },
      { time: '6-10s', role: '升级', density: '高', shots: '3-4次', emotion: '紧张/期待' },
      { time: '10-13s', role: '高潮', density: '极高', shots: '2-3次快切', emotion: '爽感爆发' },
      { time: '13-15s', role: 'CTA', density: '中', shots: '定格', emotion: '行动欲' },
    ],
  },
  {
    duration: 30,
    segments: [
      { time: '0-3s', role: '钩子', density: '极高', shots: '1-2次', emotion: '震惊/好奇' },
      { time: '3-8s', role: '建立', density: '高', shots: '3-4次', emotion: '代入/好奇' },
      { time: '8-14s', role: 'A线展示', density: '高', shots: '4-5次', emotion: '紧张/兴奋' },
      { time: '14-20s', role: 'B线穿插', density: '中高', shots: '3-4次', emotion: '新鲜/期待' },
      { time: '20-26s', role: '高潮', density: '极高', shots: '4-5次快切', emotion: '爽感爆炸' },
      { time: '26-30s', role: 'CTA', density: '中', shots: '1次+定格', emotion: '行动欲' },
    ],
  },
  {
    duration: 60,
    segments: [
      { time: '0-3s', role: '钩子', density: '极高', shots: '1-2次', emotion: '震惊/好奇' },
      { time: '3-10s', role: '剧情建立', density: '高', shots: '4-5次', emotion: '代入/共鸣' },
      { time: '10-20s', role: 'A线展开', density: '中高', shots: '5-6次', emotion: '紧张/兴奋' },
      { time: '20-30s', role: 'B线展开', density: '中高', shots: '5-6次', emotion: '新鲜/惊喜' },
      { time: '30-40s', role: 'A/B交替', density: '高', shots: '6-8次快切', emotion: '节奏加速' },
      { time: '40-48s', role: '第一高潮', density: '极高', shots: '4-5次', emotion: '第一波爽感' },
      { time: '48-53s', role: '终极高潮', density: '极高', shots: '3-4次', emotion: '极致满足' },
      { time: '53-60s', role: 'CTA', density: '中', shots: '2次+定格', emotion: '行动欲/成就感' },
    ],
  },
]

import { ThemeCategory } from '@/models/enums'
import type { PresetTheme } from '@/models/types'

export const PRESET_THEMES: PresetTheme[] = [
  // T1 高热 - 平台数据
  { id: 'zombie', name: '丧尸末日', tier: 'T1', description: '末日生存题材，丧尸围城+求生压迫感', category: ThemeCategory.SubjectAesthetic, scenes: ['zombie', 'survive'], source: 'platform', trendScore: 95 },
  { id: 'tower', name: '塔防策略', tier: 'T1', description: '排兵布阵防守关卡，策略爽感', category: ThemeCategory.ThrillingFormula, scenes: ['tower'], source: 'platform', trendScore: 92 },
  { id: 'rescue', name: '拯救营救', tier: 'T1', description: '紧急救援场景，危机感+英雄感', category: ThemeCategory.EmotionalResonance, scenes: ['rescue'], source: 'platform', trendScore: 88 },
  { id: 'countdown', name: '倒计时挑战', tier: 'T1', description: '时间压迫下的极限操作', category: ThemeCategory.ThrillingFormula, scenes: ['countdown'], source: 'platform', trendScore: 86 },
  // T2 中热 - 平台+AI
  { id: 'bullet', name: '弹幕割草', tier: 'T2', description: '满屏弹幕割草，视觉冲击极强', category: ThemeCategory.SubjectAesthetic, scenes: ['bullet'], source: 'platform', trendScore: 78 },
  { id: 'boss', name: '巨型Boss战', tier: 'T2', description: '史诗级Boss对决，以小博大', category: ThemeCategory.SubjectAesthetic, scenes: ['boss'], source: 'ai', trendScore: 75 },
  { id: 'dungeon', name: '地牢探险', tier: 'T2', description: '地牢Roguelike，未知探索', category: ThemeCategory.SubjectAesthetic, scenes: ['dungeon'], source: 'platform', trendScore: 72 },
  { id: 'survive', name: '生存逃脱', tier: 'T2', description: '绝境求生逃脱，紧张刺激', category: ThemeCategory.ThrillingFormula, scenes: ['survive'], source: 'ai', trendScore: 68 },
  { id: 'ceo', name: '逆袭成长', tier: 'T2', description: '屌丝逆袭人生赢家', category: ThemeCategory.EmotionalResonance, scenes: ['ceo'], source: 'platform', trendScore: 65 },
  // T3 常青
  { id: 'asmr', name: '解压满足', tier: 'T3', description: 'ASMR解压/碾碎/切割满足感', category: ThemeCategory.EmotionalResonance, scenes: ['asmr'], source: 'platform', trendScore: 58 },
  { id: 'drama', name: '狗血反转', tier: 'T3', description: '剧情反转打脸，爽文套路', category: ThemeCategory.ContrastCuriosity, scenes: ['drama'], source: 'ai', trendScore: 55 },
  { id: 'nostalgia', name: '怀旧经典', tier: 'T3', description: '童年回忆杀/经典IP情怀', category: ThemeCategory.EmotionalResonance, scenes: ['nostalgia'], source: 'platform', trendScore: 52 },
  { id: 'merge', name: '合成进化', tier: 'T3', description: '合成+进化变强的满足感', category: ThemeCategory.ThrillingFormula, scenes: ['merge'], source: 'ai', trendScore: 48 },
  { id: 'pvp', name: 'PVP对决', tier: 'T3', description: '玩家对抗竞技，胜负悬念', category: ThemeCategory.ThrillingFormula, scenes: ['pvp'], source: 'platform', trendScore: 45 },
]

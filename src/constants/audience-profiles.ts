import { AudienceType } from '@/models/enums'

export interface AudienceProfile {
  id: AudienceType
  label: string
  description: string
}

export const AUDIENCE_PROFILES: AudienceProfile[] = [
  { id: AudienceType.Male1824, label: '男18-24', description: '学生/游戏宅，追求刺激和竞技' },
  { id: AudienceType.Male2535, label: '男25-35', description: '打工人/社畜，碎片时间解压' },
  { id: AudienceType.Male35Plus, label: '男35+', description: '中年解压，怀旧+休闲' },
  { id: AudienceType.Female1824, label: '女18-24', description: '二次元/追星，颜值+收集' },
  { id: AudienceType.Female2535, label: '女25-35', description: '宝妈/职场女性，休闲+社交' },
  { id: AudienceType.General, label: '泛人群', description: '下沉市场，简单易上手' },
  { id: AudienceType.Custom, label: '自定义', description: '手动输入目标画像' },
]

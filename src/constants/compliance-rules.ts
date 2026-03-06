export interface ComplianceRule {
  id: string
  platform: 'douyin' | 'kuaishou' | 'bilibili' | 'all'
  category: 'forbidden' | 'restricted' | 'caution'
  patterns: string[]
  description: string
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'absolute-claim',
    platform: 'all',
    category: 'forbidden',
    patterns: ['最好的', '第一名', '全网最', '史上最', '绝对', '100%', '零风险', '无副作用'],
    description: '禁止使用绝对化用语',
  },
  {
    id: 'guarantee-return',
    platform: 'all',
    category: 'forbidden',
    patterns: ['保证赚', '稳赚', '必中', '包赢', '永不亏', '翻倍回报'],
    description: '禁止虚假收益承诺',
  },
  {
    id: 'medical-claim',
    platform: 'all',
    category: 'forbidden',
    patterns: ['治愈', '根治', '药效', '疗效', '处方', '特效药'],
    description: '禁止医疗相关功效声明',
  },
  {
    id: 'price-misleading',
    platform: 'all',
    category: 'restricted',
    patterns: ['免费领', '不要钱', '0元购', '白嫖'],
    description: '价格误导性表述需谨慎',
  },
  {
    id: 'douyin-minor',
    platform: 'douyin',
    category: 'forbidden',
    patterns: ['未成年', '小学生', '中学生', '儿童专属'],
    description: '抖音禁止面向未成年人的游戏广告',
  },
  {
    id: 'kuaishou-violence',
    platform: 'kuaishou',
    category: 'restricted',
    patterns: ['血腥', '暴力', '杀戮', '屠杀', '残忍'],
    description: '快手限制暴力相关内容',
  },
  {
    id: 'bilibili-copyright',
    platform: 'bilibili',
    category: 'caution',
    patterns: ['盗版', '破解', '免费版', '修改版'],
    description: 'B站注意版权相关敏感词',
  },
  {
    id: 'urgency-excessive',
    platform: 'all',
    category: 'caution',
    patterns: ['最后一天', '仅限今天', '马上涨价', '错过不再'],
    description: '过度紧迫感表述需注意频率',
  },
]

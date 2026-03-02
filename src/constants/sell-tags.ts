export interface SellTagGroup {
  id: string
  name: string
  color: string
  colorClass: string
  position: string
  tags: string[]
}

export const SELL_TAG_GROUPS: SellTagGroup[] = [
  { id: 'main', name: '主线', color: 'blue', colorClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', position: '核心玩法循环——游戏有什么可以玩', tags: ['副本', '任务', '挂机', '冒险'] },
  { id: 'growth', name: '成长', color: 'green', colorClass: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300', position: '数值成长爽感——角色变强的可视化路径', tags: ['角色', '战斗(割草)', '营地', '研究院', '神器', '装备'] },
  { id: 'collect', name: '收集', color: 'yellow', colorClass: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300', position: '收集满足感——集齐角色/种族的驱动力', tags: ['角色收集', '种族'] },
  { id: 'social', name: '社交', color: 'purple', colorClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300', position: '社交归属+竞争——有人一起玩、排名争第一', tags: ['聊天框', '部落', '部落红包', '跨服战斗', 'PVP', '排行榜', '好友系统', '部落榜', '部落boss'] },
  { id: 'create', name: '创造', color: 'orange', colorClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300', position: '自由策略感——我的阵容我做主', tags: ['布阵'] },
  { id: 'gacha', name: '未知', color: 'red', colorClass: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300', position: '博彩刺激感——抽卡/开箱的悬念与惊喜', tags: ['普通许愿', '高级许愿', '种族许愿', '宝箱'] },
  { id: 'support', name: '辅助', color: 'gray', colorClass: 'bg-secondary text-secondary-foreground', position: '白嫖/福利——降低门槛+额外乐趣', tags: ['福利', '小游戏'] },
]

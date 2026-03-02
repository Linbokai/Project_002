export interface UeHookPattern {
  id: string
  name: string
  description: string
  gameplays: string[]
  example: string
}

export const UE_HOOK_PATTERNS: UeHookPattern[] = [
  {
    id: 'destruction_rebuild',
    name: '模型破碎重组',
    description: '物体/角色碎裂后瞬间重组为全新形态，视觉反差极强',
    gameplays: ['merge', 'pinball', 'asmr_satisfy', 'shooter'],
    example: '角色被打碎成碎片→碎片聚合→重组为更强形态',
  },
  {
    id: 'material_morph',
    name: '材质渐变揭示',
    description: '从粗糙低模渐变到精致高模，展示画面品质',
    gameplays: ['merge', 'tycoon', 'snake_io', 'runner'],
    example: '灰色泥塑体→金属质感渐变→最终华丽材质',
  },
  {
    id: 'camera_penetration',
    name: '镜头穿模',
    description: '镜头穿过墙壁/地面，揭示隐藏场景或内部结构',
    gameplays: ['dragon_zuma', 'tower_defense', 'sliding_puzzle', 'tycoon'],
    example: '镜头从外部穿透墙壁→进入地下密室→揭示Boss巢穴',
  },
  {
    id: 'particle_storm',
    name: '粒子风暴',
    description: '满屏粒子特效爆发，制造视觉过载的冲击感',
    gameplays: ['mowing', 'pinball', 'match3', 'shooter'],
    example: '技能释放瞬间→满屏粒子爆炸→敌人全部消散',
  },
  {
    id: 'physics_chain',
    name: '物理连锁',
    description: '物理碰撞引发多米诺骨牌式的连锁反应',
    gameplays: ['pinball', 'pull_pin', 'asmr_satisfy', 'tower_defense'],
    example: '弹球碰第一个→连续碰撞→整排障碍物依次崩塌',
  },
  {
    id: 'scale_explosion',
    name: '体量爆炸',
    description: '从极小到巨大的尺度变化，展示成长/膨胀的爽感',
    gameplays: ['snake_io', 'merge', 'mowing', 'idle'],
    example: '小蛇占屏幕1%→吞噬成长→最终占满全屏',
  },
  {
    id: 'time_lapse',
    name: '延时蒙太奇',
    description: '快速展示从无到有的建设/成长全过程',
    gameplays: ['tycoon', 'idle', 'tower_defense', 'merge'],
    example: '空地→加速建造→繁华城市的延时摄影',
  },
  {
    id: 'split_screen_contrast',
    name: '分屏对比',
    description: '同屏对比不同状态/选择的结果差异',
    gameplays: ['pull_pin', 'sort', 'runner', 'sliding_puzzle'],
    example: '左屏正确操作通关 vs 右屏错误操作全军覆没',
  },
  {
    id: 'bullet_time',
    name: '子弹时间',
    description: '关键时刻进入慢动作，放大打击感和决策瞬间',
    gameplays: ['shooter', 'mowing', 'pinball', 'dragon_zuma'],
    example: '最后一颗子弹→进入慢镜头→精准命中目标→正常速度恢复',
  },
  {
    id: 'flood_overwhelm',
    name: '海量堆叠',
    description: '大量同类元素持续涌入画面，制造密集冲击',
    gameplays: ['mowing', 'idle', 'tower_defense', 'snake_io'],
    example: '画面不断涌入越来越多的怪物，直到铺满全屏',
  },
]

export interface HookPattern {
  id: string
  name: string
  description: string
  scenes: string[]
  example: string
}

export const HOOK_PATTERNS: HookPattern[] = [
  { id: 'suspense', name: '悬念反问', description: '抛出让人想知道答案的问题', scenes: ['zombie', 'boss', 'dungeon', 'survive', 'pvp'], example: '"你见过一刀999万伤害的角色吗？"' },
  { id: 'number_shock', name: '数字冲击', description: '用巨大数字变化制造视觉冲击', scenes: ['bullet', 'ceo', 'merge', 'tower', 'countdown'], example: '角色1级→999级的极速变化' },
  { id: 'instant_fail', name: '故意失败', description: '角色第1秒就死亡，制造"不可能"感', scenes: ['zombie', 'dungeon', 'survive', 'countdown', 'rescue'], example: '角色出门0.5秒被秒杀' },
  { id: 'visual_overload', name: '视觉暴击', description: '第一帧满屏爆炸/宝箱/金币', scenes: ['bullet', 'tower', 'boss', 'merge', 'asmr'], example: '画面塞满弹幕和爆炸特效' },
  { id: 'reversal_preview', name: '反转预告', description: '先展示高潮，再倒回开头', scenes: ['drama', 'ceo', 'survive', 'pvp', 'boss'], example: '"30秒前我还是个废物..."' },
  { id: 'contrast', name: '对比冲突', description: '分屏或快切，用强烈反差制造冲突', scenes: ['ceo', 'rescue', 'drama', 'pvp', 'merge'], example: '左半屏穷酸 vs 右半屏土豪' },
  { id: 'forbidden', name: '禁忌好奇', description: '暗示"不该做"的事，利用好奇心', scenes: ['dungeon', 'drama', 'rescue', 'survive', 'countdown'], example: '"千万别点开这个宝箱..."' },
  { id: 'countdown_bomb', name: '倒计时紧迫', description: '倒数计时制造紧迫感', scenes: ['countdown', 'survive', 'boss', 'tower', 'pvp'], example: '3...2...1... 炸弹即将爆炸' },
  { id: 'asmr_crack', name: '解压碾碎', description: '极致解压/碾碎/切割画面', scenes: ['asmr', 'merge', 'bullet', 'tower'], example: '巨大碾压机碾碎一切' },
  { id: 'meme_hijack', name: '热梗劫持', description: '用当下最火的梗开场', scenes: ['drama', 'nostalgia', 'ceo', 'rescue'], example: '套用热门短视频模板/BGM' },
  { id: 'pov_fall', name: 'POV坠入', description: '第一人称坠落/穿越', scenes: ['dungeon', 'survive', 'zombie', 'boss'], example: 'POV镜头坠入深渊' },
  { id: 'one_take', name: '一镜穿越', description: '镜头不间断穿越多个场景', scenes: ['dungeon', 'tower', 'bullet', 'merge', 'boss'], example: '镜头从地牢穿到Boss房' },
  { id: 'scale_reveal', name: '尺度揭示', description: '先小场景，突然拉远揭示全貌', scenes: ['boss', 'tower', 'zombie', 'survive', 'bullet'], example: '先看到脚，镜头拉远露出巨型Boss' },
  { id: 'wrong_game', name: '货不对板', description: '开头像A类型，突然变成完全不同内容', scenes: ['drama', 'nostalgia', 'rescue', 'ceo', 'merge'], example: '看似恋爱游戏→突然变成割草' },
]

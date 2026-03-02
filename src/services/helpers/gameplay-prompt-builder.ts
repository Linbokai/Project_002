import type { GenerationConfig, Game } from '@/models/types'
import type { UeHookPattern } from '@/constants/ue-hook-patterns'
import { UE_HOOK_PATTERNS } from '@/constants/ue-hook-patterns'
import { UE_GAMEPLAY_PRESETS } from '@/constants/ue-gameplay-presets'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { AspectRatio, AudienceType, UeContentType } from '@/models/enums'
import { getRhythmTemplate, formatRhythmForPrompt } from './rhythm-engine'

export function buildUeSystemPrompt(
  config: GenerationConfig,
  game: Game | null,
  extraContext?: string,
): string {
  const sections: string[] = []

  sections.push(buildUeRoleSection(config))
  sections.push(buildUeHookSection(config))
  sections.push(buildRhythmSection(config.duration))

  if (config.ueContentType === UeContentType.Gameplay) {
    sections.push(buildGameplayDesignSection(config))
  }

  sections.push(buildUeContextSection(config, game))
  sections.push(buildUeScriptTypeSection(config))

  if (extraContext) {
    sections.push(`## 补充上下文\n${extraContext}`)
  }

  return sections.join('\n\n')
}

function buildUeRoleSection(config: GenerationConfig): string {
  if (config.ueContentType === UeContentType.Showcase) {
    return `## 角色
你是一位精通Unreal Engine的3D买量创意总监，拥有10年3D/CG广告制作经验。
你深谙次世代画面表现力对用户注意力的影响：光影、材质、粒子、镜头运动是你的核心武器。
你的信念：3D素材的前2秒视觉冲击决定了用户是否停留。`
  }

  return `## 角色
你同时是一位资深玩法策划和3D/UE买量创意总监。
你拥有10年游戏玩法设计经验，深刻理解什么玩法能让用户"一看就想玩"。
你同时精通UE级3D画面表现，能将玩法创意转化为极具吸引力的买量素材。
你的核心信念：
1. 好玩法 = 3秒能看懂 + 30秒能上瘾
2. 买量素材的本质是"让人想试一下"的冲动
3. 创意玩法 + 3D视觉冲击 = 最强吸量组合`
}

function buildUeHookSection(config: GenerationConfig): string {
  const hooks = matchUeHooks(config.selectedGameplays)
  const lines = [
    '## 第一原则：视觉钩子决定一切',
    '',
    '以下是根据当前玩法匹配的Top5 3D视觉钩子，务必从中选择最合适的1-2种用于开头：',
    '',
  ]

  hooks.forEach((h, i) => {
    lines.push(`${i + 1}. **${h.name}**：${h.description}`)
    lines.push(`   示例：${h.example}`)
    lines.push(`   适用玩法：${h.gameplays.join('、')}`)
  })

  return lines.join('\n')
}

function matchUeHooks(selectedGameplayIds: string[], topN = 5): UeHookPattern[] {
  if (selectedGameplayIds.length === 0) return UE_HOOK_PATTERNS.slice(0, topN)

  const scored = UE_HOOK_PATTERNS.map((hook) => {
    const overlap = hook.gameplays.filter((g) => selectedGameplayIds.includes(g)).length
    return { hook, score: overlap }
  })

  scored.sort((a, b) => b.score - a.score)
  const result = scored.slice(0, topN).map((s) => s.hook)

  if (result.length < topN) {
    const ids = new Set(result.map((h) => h.id))
    for (const hook of UE_HOOK_PATTERNS) {
      if (result.length >= topN) break
      if (!ids.has(hook.id)) result.push(hook)
    }
  }

  return result
}

function buildRhythmSection(duration: number): string {
  const template = getRhythmTemplate(duration)
  return `## 第二原则：节奏蓝图\n\n严格按以下节奏分配每个段落的时间和情绪：\n\n${formatRhythmForPrompt(template)}`
}

function buildGameplayDesignSection(config: GenerationConfig): string {
  const lines = [
    '## 第三原则：玩法策划思维',
    '',
    '在编写脚本之前，必须先从玩法策划的角度思考：',
    '',
    '### 核心问题',
    '1. **为什么好玩？** — 这个玩法的核心爽点是什么？用户的正反馈循环在哪？',
    '2. **怎样吸引下载？** — 看完视频后，什么驱动用户点击下载？是好奇心、挑战欲还是视觉满足？',
    '3. **差异化在哪？** — 和同类型素材相比，你的创意亮点是什么？',
    '',
    '### 策划输出要求',
    '在分镜脚本之前，先输出简短的玩法策划简案：',
    '- 核心循环：一句话描述"玩家做什么→得到什么→为什么继续"',
    '- 爽点设计：列出2-3个关键爽点时刻',
    '- 创新亮点：至少1个区别于同类素材的创意差异点',
  ]

  const selectedPresets = UE_GAMEPLAY_PRESETS.filter(
    (p) => config.selectedGameplays.includes(p.id),
  )

  if (selectedPresets.length > 0) {
    lines.push('')
    lines.push('### 当前选中的玩法参考')
    for (const preset of selectedPresets) {
      lines.push(`- **${preset.name}**：${preset.description}`)
      lines.push(`  核心循环：${preset.coreLoop}`)
      lines.push(`  推荐视觉钩子：${preset.visualHook}`)
    }
  }

  return lines.join('\n')
}

function buildUeContextSection(config: GenerationConfig, game: Game | null): string {
  const lines = ['## 任务上下文']

  if (game) {
    lines.push(`\n### 游戏信息\n- 游戏名称：${game.name}\n- 游戏类型：${game.genre}\n- 核心卖点：${game.sell}`)
  }

  const contentLabel = config.ueContentType === UeContentType.Showcase ? '展示类' : '创意玩法'
  lines.push(`\n### 素材类型\n${contentLabel}`)

  if (config.selectedGameplays.length > 0) {
    const names = config.selectedGameplays.map((id) => {
      const preset = UE_GAMEPLAY_PRESETS.find((p) => p.id === id)
      return preset ? preset.name : id
    })
    lines.push(`\n### 选中玩法\n${names.join('、')}`)
  }

  if (config.selectedSellTags.length > 0) {
    lines.push(`\n### 重点展示卖点\n${config.selectedSellTags.join('、')}`)
  }

  const audienceProfile = AUDIENCE_PROFILES.find((a) => a.id === config.audience)
  if (config.audience === AudienceType.Custom && config.customAudience) {
    lines.push(`\n### 目标用户\n${config.customAudience}`)
  } else if (audienceProfile) {
    lines.push(`\n### 目标用户\n${audienceProfile.label} — ${audienceProfile.description}`)
  }

  if (config.hero.value) {
    const modeLabel = config.hero.mode === 'game' ? '游戏角色' : config.hero.mode === 'trending' ? '热梗人物' : '自定义'
    lines.push(`\n### 主角人设\n${modeLabel}：${config.hero.value}`)
  }

  if (config.collabIP.enabled && config.collabIP.name) {
    lines.push(`\n### 联动IP\nIP名称：${config.collabIP.name}`)
    if (config.collabIP.info) {
      lines.push(`IP资料：${config.collabIP.info}`)
    }
  }

  lines.push(`\n### 视频参数\n- 时长：${config.duration}秒\n- 画面比例：${config.aspectRatio}`)
  lines.push(buildCompositionGuide(config.aspectRatio))

  lines.push('\n### 3D画面规范')
  lines.push('- 所有画面描述必须基于3D/UE引擎级别的表现力')
  lines.push('- 镜头运动需具体到运镜方式（推/拉/摇/移/跟/航拍/手持）和速度')
  lines.push('- 光影描述包含主光方向、色温、体积光、环境反射')
  lines.push('- 特效分层描述：前景粒子 / 中景主体 / 背景氛围')

  if (config.additionalRequirements) {
    lines.push(`\n### 补充要求\n${config.additionalRequirements}`)
  }

  return lines.join('\n')
}

function buildUeScriptTypeSection(config: GenerationConfig): string {
  const scriptType = SCRIPT_TYPES.find((t) => t.id === config.scriptType)
  if (!scriptType) return ''

  const lines = [
    `## 脚本类型：${scriptType.name}`,
    '',
    `### 角色要求\n${scriptType.role}`,
    '',
    `### 输出格式\n${scriptType.format}`,
    '',
    '### 创作规则',
    ...scriptType.rules.map((r) => `- ${r}`),
  ]

  return lines.join('\n')
}

function buildCompositionGuide(ratio: AspectRatio): string {
  switch (ratio) {
    case AspectRatio.Portrait:
      return '\n- 构图指南：竖屏9:16，人物/主体居中偏上，底部留CTA空间，注意3D模型在竖屏中的展示比例'
    case AspectRatio.Landscape:
      return '\n- 构图指南：横屏16:9，电影感构图，充分利用宽幅展示3D场景纵深和环境规模'
    case AspectRatio.Square:
      return '\n- 构图指南：方形1:1，信息集中在中心区域，3D模型适当放大，适合信息流展示'
  }
}

export function buildGameplaySearchPrompt(keyword: string): string {
  return `你是一位全球游戏市场分析师。请搜索海内外最新的热门游戏创意玩法，关键词："${keyword}"。

请返回5-8个相关的热门玩法/游戏，每个包含以下信息：
1. 玩法名称
2. 代表游戏（来源）
3. 所属市场（国内/海外/全球）
4. 热度评估（极高/高/中）
5. 核心创新点（一句话）
6. 适合的买量创意方向（一句话）

优先返回最近6个月内热度上升最快的玩法。包含国内和海外市场的内容。`
}

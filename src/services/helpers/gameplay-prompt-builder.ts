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
你是一位拥有10年经验的顶级游戏策划，同时具备买量创意能力。
你的核心思考方式：
1. 先想清楚"这个玩法为什么好玩" — 核心循环、上瘾机制、操作反馈、数值爽感
2. 再想"怎么用一段短视频让人一看就想玩" — 哪些玩法瞬间最有感染力
3. 最后才考虑画面表现 — 视觉只是服务于玩法展示的手段

你的信念：
- 买量素材的本质不是"好看"，而是"好玩到让人想试一下"
- 一个精妙的玩法设计胜过十个华丽的特效镜头
- 用户看完视频应该记住"这个玩法有意思"，而不是"这个画面很炫"`
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
    '## 第三原则：玩法策划思维（最核心）',
    '',
    '在编写脚本之前，你必须像一个顶级游戏策划一样思考透彻：',
    '',
    '### 玩法内核分析',
    '1. **核心循环**：玩家做什么→看到什么反馈→为什么想继续做？',
    '2. **上瘾机制**：靠什么让人上瘾？操作爽感（手感好）、数值膨胀（越来越强）、策略深度（越琢磨越有意思）、还是收集满足（想集齐）？',
    '3. **30秒上瘾点**：如果只给用户30秒体验，他在哪个瞬间会"上钩"？',
    '',
    '### 玩法展示节拍设计',
    '每个分镜必须对应一个明确的玩法节点，禁止出现纯氛围/纯视觉过场镜头：',
    '- **入门操作**：最简单的一步操作，让观众3秒看懂"这游戏怎么玩"',
    '- **正反馈爆发**：操作产生的即时爽感（消除、爆炸、升级、通关）',
    '- **难度升级**：复杂度提升，暗示"还有更多玩法深度"',
    '- **爽点高潮**：最满足的玩法瞬间（满屏清怪、完美连消、极限操作）',
    '- **下载钩子**：制造"我也想试试"的冲动',
    '',
    '### 策划输出要求',
    '在分镜脚本之前，先输出玩法策划简案：',
    '- **核心循环**：完整的"操作→反馈→动机"闭环',
    '- **上瘾机制**：这个玩法靠什么让用户想继续玩',
    '- **30秒体验设计**：用户依次经历哪些玩法节点，每个节点的情绪变化',
    '- **关键爽点**：2-3个最能触发下载冲动的玩法瞬间',
    '- **差异化设计**：与同类买量素材的核心区别',
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
    lines.push(`\n### 游戏信息\n- 游戏名称：${game.name}\n- 游戏类型：${game.type}\n- 核心卖点：${game.coreSellingPoints.join('、')}`)
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

  if (config.ueContentType === UeContentType.Showcase) {
    lines.push('\n### 3D画面规范（展示类重点）')
    lines.push('- 所有画面描述必须基于3D/UE引擎级别的表现力，充分展示次世代画面品质')
    lines.push('- 镜头运动需具体到运镜方式（推/拉/摇/移/跟/航拍/手持）和速度节奏')
    lines.push('- 光影描述包含主光方向、色温、体积光、God Ray、环境反射')
    lines.push('- 特效分层描述：前景粒子 / 中景主体 / 背景氛围')
    lines.push('- 材质质感需具体到皮肤SSS散射、金属反射、布料物理、毛发动态等细节')
  } else {
    lines.push('\n### 玩法展示规范（创意玩法重点）')
    lines.push('- 每个镜头必须服务于玩法展示，禁止纯氛围/纯视觉过场镜头')
    lines.push('- 画面描述以"玩家操作"和"游戏反馈"为中心，而非光影材质')
    lines.push('- 操作提示必须具体到手势/交互方式（如：手指滑动、点击、长按、拖拽）')
    lines.push('- 玩法反馈必须可视化（如：数值飘字、连击特效、升级动画、屏幕震动）')
    lines.push('- 画面简洁清晰，确保观众能一眼看懂"这个游戏在玩什么"')
  }

  if (config.additionalRequirements) {
    lines.push(`\n### 补充要求\n${config.additionalRequirements}`)
  }

  return lines.join('\n')
}

function buildUeScriptTypeSection(config: GenerationConfig): string {
  const scriptType = SCRIPT_TYPES.find((t) => t.id === config.scriptType)
  if (!scriptType) return ''

  const lines = [
    `## 最高优先级：脚本类型 —「${scriptType.name}」`,
    '',
    `> ⚠️ 你必须严格按照「${scriptType.name}」的输出格式和创作规则生成脚本。这是不可违反的硬性约束。`,
    '',
    `### 输出格式（必须逐字段输出，禁止合并或省略）`,
    scriptType.format,
    '',
    '### ⛔ 格式硬性禁令',
    '- 每个字段必须独占一行，一行只写一个字段',
    '- 禁止使用 | 管道符/竖线分隔字段',
    '- 禁止使用 markdown 表格格式',
    '- 禁止使用 <br> 等 HTML 标签',
    '- 禁止将多个字段合并到同一行',
    '',
    '### 创作规则（必须全部遵守）',
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

export function buildGameplayDirectionsPrompt(
  config: GenerationConfig,
  game: Game | null,
): string {
  const selectedPresets = UE_GAMEPLAY_PRESETS.filter(
    (p) => config.selectedGameplays.includes(p.id),
  )

  const gameInfo = game
    ? `游戏名称：${game.name}\n游戏类型：${game.type}\n核心卖点：${game.coreSellingPoints.join('、')}`
    : '（未指定游戏）'

  const presetInfo = selectedPresets.length > 0
    ? selectedPresets.map((p) => `- ${p.name}：${p.description}（核心循环：${p.coreLoop}）`).join('\n')
    : '（未选择预设玩法）'

  const audienceProfile = AUDIENCE_PROFILES.find((a) => a.id === config.audience)
  const audienceInfo = config.audience === AudienceType.Custom && config.customAudience
    ? config.customAudience
    : audienceProfile
      ? `${audienceProfile.label} — ${audienceProfile.description}`
      : '通用'

  return `你是一位资深游戏买量创意总监，同时精通玩法策划和3D/UE视觉表现。

请基于以下信息，输出 **3个差异化的创意玩法方向**，用于后续生成完整的买量分镜脚本。

## 游戏信息
${gameInfo}

## 已选玩法参考
${presetInfo}

## 目标用户
${audienceInfo}

## 视频参数
- 时长：${config.duration}秒
- 画面比例：${config.aspectRatio}

## 输出要求

请严格按以下格式输出3个方向：

### 方向一：[方向名称]
- **核心玩法循环**：一句话描述"玩家做什么→得到什么→为什么继续"
- **视觉钩子策略**：开头2-3秒用什么视觉冲击抓住用户
- **差异化亮点**：和同类素材相比的独特创意点
- **预期吸量优势**：为什么这个方向能吸引用户下载

### 方向二：[方向名称]
（同上格式）

### 方向三：[方向名称]
（同上格式）

要求：
1. 三个方向必须在创意角度上有明显差异（如：情感驱动 vs 挑战驱动 vs 好奇心驱动）
2. 每个方向的视觉钩子策略必须具体到可执行的3D画面描述
3. 结合当前游戏的核心卖点，确保方向与游戏调性匹配`
}

export function buildGameplayDetailPrompt(
  directionNumber: number,
  config: GenerationConfig,
  game: Game | null,
): string {
  const dirLabel = ['一', '二', '三'][directionNumber - 1] ?? String(directionNumber)

  return `用户已选择 **方向${dirLabel}**。

请基于该方向的创意构思，生成一份完整的创意玩法买量分镜脚本。

要求：
1. 先输出玩法策划简案（核心循环、上瘾机制、30秒体验设计、关键爽点、差异化设计）
2. 分镜按玩法节点组织：入门操作→正反馈爆发→难度升级→爽点高潮→下载钩子
3. 每个分镜必须标注"当前玩法节点"和"玩家操作/游戏反馈"
4. 画面描述简洁明确（1-2句），服务于玩法展示，不要写大段视觉描写
5. 开头2-3秒必须让观众看懂"这游戏在玩什么"
6. 脚本时长 ${config.duration} 秒，画面比例 ${config.aspectRatio}
${game ? `7. 结合游戏《${game.name}》的实际玩法内容和卖点` : ''}`
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

import type { GenerationConfig, Game } from '@/models/types'
import type { HookPattern } from '@/constants/hook-patterns'
import type { RhythmTemplate } from '@/constants/rhythm-templates'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { AspectRatio, AudienceType } from '@/models/enums'
import { matchHooks } from './hook-engine'
import { getRhythmTemplate, formatRhythmForPrompt } from './rhythm-engine'

export function buildSystemPrompt(
  config: GenerationConfig,
  game: Game | null,
  extraContext?: string,
): string {
  const sections: string[] = []

  sections.push(buildRoleSection())
  sections.push(buildHookSection(config))
  sections.push(buildRhythmSection(config.duration))
  sections.push(buildContextSection(config, game))
  sections.push(buildScriptTypeSection(config))

  if (extraContext) {
    sections.push(`## 补充上下文\n${extraContext}`)
  }

  return sections.join('\n\n')
}

function buildRoleSection(): string {
  return `## 角色
你是一位顶级手游买量创意总监，拥有10年买量视频创作经验。
你深谙各平台（抖音/快手/B站/TikTok/Facebook/YouTube）的用户注意力规律。
你的核心信念：前3秒决定一切——钩子不够强，后面全白费。`
}

function buildHookSection(config: GenerationConfig): string {
  const hooks: HookPattern[] = matchHooks(config.selectedThemes)
  const lines = ['## 第一原则：钩子决定一切', '', '以下是根据当前主题匹配的Top5钩子套路，务必从中选择最合适的1-2种用于开头：', '']

  hooks.forEach((h, i) => {
    lines.push(`${i + 1}. **${h.name}**：${h.description}`)
    lines.push(`   示例：${h.example}`)
    lines.push(`   适用场景：${h.scenes.join('、')}`)
  })

  return lines.join('\n')
}

function buildRhythmSection(duration: number): string {
  const template: RhythmTemplate = getRhythmTemplate(duration)
  return `## 第二原则：节奏蓝图\n\n严格按以下节奏分配每个段落的时间和情绪：\n\n${formatRhythmForPrompt(template)}`
}

function buildContextSection(config: GenerationConfig, game: Game | null): string {
  const lines = ['## 任务上下文']

  if (game) {
    lines.push(`\n### 游戏信息\n- 游戏名称：${game.name}\n- 游戏类型：${game.genre}\n- 核心卖点：${game.sell}`)
  }

  if (config.selectedSellTags.length > 0) {
    lines.push(`\n### 重点展示卖点\n${config.selectedSellTags.join('、')}`)
  }

  if (config.selectedThemes.length > 0) {
    lines.push(`\n### 吸量主题\n${config.selectedThemes.join('、')}`)
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

  if (config.additionalRequirements) {
    lines.push(`\n### 补充要求\n${config.additionalRequirements}`)
  }

  return lines.join('\n')
}

function buildScriptTypeSection(config: GenerationConfig): string {
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
      return '\n- 构图指南：竖屏9:16，人物居中偏上，底部留CTA空间，文字左右留安全边距'
    case AspectRatio.Landscape:
      return '\n- 构图指南：横屏16:9，电影感构图，三分法构图，画面信息量可更大'
    case AspectRatio.Square:
      return '\n- 构图指南：方形1:1，信息集中在中心区域，适合信息流展示'
  }
}

export function buildSeedancePrompt(script: string, lang: 'zh' | 'en', safeMode: boolean): string {
  const safetyRules = safeMode
    ? `\n\n安全约束（必须遵守）：
- 真实武器替换为能量法器/魔法武器
- 血腥画面替换为光点消散效果
- 丧尸等恐怖元素必须Q版化/卡通化
- 禁止出现真人肖像
- 禁止赌博、色情相关内容
- 怪物死亡统一表现为"化为光点消散+金币弹出"`
    : ''

  if (lang === 'en') {
    return `You are a Seedance 2.0 video generation prompt expert. Convert the following storyboard script into a single Seedance 2.0 English prompt (max 2000 characters). Focus on visual descriptions, camera movements, transitions, and pacing. Output ONLY the prompt text, no explanation.${safetyRules}\n\n--- Script ---\n${script}`
  }

  return `你是 Seedance 2.0 视频生成提示词专家。将以下分镜脚本压缩为一段 Seedance 2.0 中文提示词（不超过2000字符）。重点描述画面内容、镜头运动、转场和节奏。只输出提示词，不要解释。${safetyRules}\n\n--- 脚本 ---\n${script}`
}

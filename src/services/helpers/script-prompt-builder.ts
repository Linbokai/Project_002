import type { GenerationConfig, Game } from '@/models/types'
import type { HookPattern } from '@/constants/hook-patterns'
import type { RhythmTemplate } from '@/constants/rhythm-templates'
import { SCRIPT_TYPES, type ScriptTypeConfig } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { SEEDANCE_PROMPT_GUIDE } from '@/constants/seedance-reference'
import { AspectRatio, AudienceType } from '@/models/enums'
import { matchHooks } from './hook-engine'
import { getRhythmTemplate, formatRhythmForPrompt } from './rhythm-engine'

export function buildSystemPrompt(
  config: GenerationConfig,
  game: Game | null,
  extraContext?: string,
  scriptTypeOverride?: ScriptTypeConfig,
): string {
  const sections: string[] = []
  const scriptType = scriptTypeOverride ?? SCRIPT_TYPES.find((t) => t.id === config.scriptType)

  sections.push(buildRoleSection(scriptType?.role))
  sections.push(buildScriptTypeSection(config, scriptType))
  sections.push(buildHookSection(config))
  sections.push(buildRhythmSection(config.duration))
  sections.push(buildContextSection(config, game))

  if (extraContext) {
    sections.push(`## 补充上下文\n${extraContext}`)
  }

  return sections.join('\n\n')
}

function buildRoleSection(scriptRole?: string): string {
  const base = scriptRole
    ? `## 角色\n${scriptRole}`
    : `## 角色\n你是一位顶级手游买量创意总监，拥有10年买量视频创作经验。`
  return `${base}\n你深谙各平台（抖音/快手/B站/TikTok/Facebook/YouTube）的用户注意力规律。\n你的核心信念：前3秒决定一切——钩子不够强，后面全白费。`
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
    lines.push(`\n### 游戏信息\n- 游戏名称：${game.name}\n- 游戏类型：${game.type}\n- 核心卖点：${game.coreSellingPoints.join('、')}`)
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

  lines.push(`\n### 视频参数\n- 画面比例：${config.aspectRatio}`)
  lines.push(buildCompositionGuide(config.aspectRatio))

  if (config.additionalRequirements) {
    lines.push(`\n### 补充要求\n${config.additionalRequirements}`)
  }

  if (config.referenceNote) {
    lines.push(`\n### 爆款参考方向\n以下是用户提供的参考风格/钩子描述，请充分参考并融入脚本创作中：\n${config.referenceNote}`)
  }

  return lines.join('\n')
}

function buildScriptTypeSection(_config: GenerationConfig, scriptType?: ScriptTypeConfig): string {
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
    '正确示例（仅演示格式，非实际内容）：',
    '```',
    '## 0-3s 钩子',
    '- **景别**：特写',
    '- **画面**：角色冲入敌群',
    '- **镜头**：快速推近',
    '- **音效**：爆炸音效',
    '- **转场**：闪白',
    '```',
    '',
    '### 创作规则（必须全部遵守）',
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
    ? `\n\n## 安全约束（必须遵守）
- 真实武器替换为能量法器/魔法武器
- 血腥画面替换为光点消散效果
- 丧尸等恐怖元素必须Q版化/卡通化
- 禁止出现真人肖像
- 禁止赌博、色情相关内容
- 怪物死亡统一表现为"化为光点消散+金币弹出"`
    : ''

  if (lang === 'en') {
    return `You are a Seedance 2.0 video generation prompt engineer. Your task is to convert a storyboard script into a Seedance 2.0 prompt following the official format specification below.

## Seedance 2.0 Official Prompt Specification

${SEEDANCE_PROMPT_GUIDE}

## Conversion Rules

1. Use the storyboard script format with 【Style】【Duration】 headers and [timestamp] shot blocks
2. Translate all content into natural, vivid English
3. For each shot: specify shot name, camera type, physical scene details, character body language, and audio cues
4. Add consistency constraints and physics requirements at the end
5. Use specific style anchors (director name / film style) instead of vague terms like "cinematic"
6. Keep each shot segment to 3-5 seconds with precise timecodes
7. When referencing characters, use @[图片1], @[图片2], etc. to bind the corresponding character reference images (e.g. "@[图片1] as character reference")
8. Total prompt must not exceed 2000 characters
9. Output ONLY the final Seedance prompt — no explanation, no markdown wrapping${safetyRules}

## Source Script

${script}`
  }

  return `你是一位 Seedance 2.0 视频生成提示词工程师。你的任务是将分镜脚本转化为符合 Seedance 2.0 官方格式规范的视频生成提示词。

## Seedance 2.0 官方提示词规范

${SEEDANCE_PROMPT_GUIDE}

## 转化规则

1. 必须使用分镜脚本格式，包含【风格】【时长】头部和 [时间码] 镜头块
2. 每个镜头需写明：镜头名称、镜头类型、包含物理细节的场景描述、角色具体肢体语言、音效提示
3. 末尾必须添加一致性约束和物理要求
4. 用具体风格锚点（导演名/电影风格/艺术流派），不要用模糊的"电影感"
5. 每个镜头片段控制在 3-5 秒，时间码必须精确
6. 描述物理动作而非抽象概念（"碎石沿斜面滑落"而非"震撼的效果"）
7. 涉及角色时，使用 @[图片1]、@[图片2] 等格式绑定对应的角色参考图（如 "@[图片1] as character reference"）
8. 总提示词不超过 2000 字符
9. 只输出最终的 Seedance 提示词，不要解释、不要包裹 markdown${safetyRules}

## 原始脚本

${script}`
}

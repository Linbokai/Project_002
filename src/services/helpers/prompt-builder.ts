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

export function buildVideoAnalysisPrompt(metrics?: import('@/models/types').VideoMetrics): string {
  const metricsBlock = formatMetricsBlock(metrics)

  return `## 角色
你是一位在头部游戏公司工作10年的买量视频素材投放专家，操盘过月消耗千万级项目，深谙各渠道（抖音/快手/B站/TikTok/Facebook/YouTube）的素材数据规律。
你的分析必须站在**投放优化师**的实战视角——一切以数据效果为导向，拒绝空洞的创意点评。

## 任务
仔细观看视频的每一帧画面，输出以下3部分精准分析。${metricsBlock}

## 1. 买量策略分析
从投放效果角度拆解这条素材的核心策略：
- **前3秒钩子诊断**：属于哪种钩子类型（悬念/冲突/利益点/猎奇/共鸣），钩子强度评分（1-10），是否能在信息流中"停住拇指"
- **叙事结构**：采用的结构类型（线性/倒叙/AB对比/问题-方案），各段时间占比是否合理
- **吸量主题识别**：命中了哪些高CTR主题标签（如逆袭/装备炫耀/社交碾压/福利诱惑）
- **转化链路设计**：从吸引→兴趣→欲望→行动的链路是否完整，CTA设计是否有效
- **平台适配度**：该素材更适合哪个投放渠道，为什么

## 2. 可复用清单
提炼可直接套用到下一条素材的实战模板（每项给出具体的复用方式）：
- **钩子模板**：前3秒的开场公式，可直接填空套用
- **节奏模板**：时间分配比例和情绪曲线（可直接作为新素材的节奏蓝图）
- **转场手法**：值得复用的画面切换技巧
- **文案/口播金句**：有吸量潜力的文案句式
- **视觉元素**：特效、字幕样式、画面构图等可复用的视觉资产

## 3. 优化建议
给出**3-5条具体可执行的优化方向**，每条包含：
- 问题点（当前素材的具体短板）
- 优化方案（怎么改，改成什么样）
- 预期效果（改完预计对哪个指标有提升）

请用中文输出，格式清晰，语言简洁有力，少说废话多给干货。`
}

function formatMetricsBlock(metrics?: import('@/models/types').VideoMetrics): string {
  if (!metrics) return ''

  const lines: string[] = ['\n\n## 投放数据（请结合数据进行针对性分析）']
  if (metrics.roi != null) lines.push(`- ROI：${metrics.roi}`)
  if (metrics.spend != null) lines.push(`- 消耗：${metrics.spend} 元`)
  if (metrics.ctr != null) lines.push(`- 点击率(CTR)：${metrics.ctr}%`)
  if (metrics.cvr != null) lines.push(`- 转化率(CVR)：${metrics.cvr}%`)
  if (metrics.cpa != null) lines.push(`- CPA：${metrics.cpa} 元`)
  if (metrics.completionRate != null) lines.push(`- 完播率：${metrics.completionRate}%`)

  if (lines.length === 1) return ''

  lines.push('')
  lines.push('请重点结合以上数据指标，分析素材的数据表现瓶颈，并在优化建议中给出针对性的改进方案。')
  return lines.join('\n')
}

export function buildVideoOptimizationPrompt(
  goal: string,
  metrics?: import('@/models/types').VideoMetrics,
): string {
  const metricsRef = metrics
    ? `\n当前数据：${Object.entries(metrics).filter(([, v]) => v != null).map(([k, v]) => {
        const labels: Record<string, string> = { roi: 'ROI', spend: '消耗', ctr: 'CTR', cvr: 'CVR', cpa: 'CPA', completionRate: '完播率' }
        const units: Record<string, string> = { spend: '元', ctr: '%', cvr: '%', cpa: '元', completionRate: '%' }
        return `${labels[k] ?? k} ${v}${units[k] ?? ''}`
      }).join(' / ')}`
    : ''

  return `基于刚才的视频分析结果，我现在需要专项优化【${goal}】。${metricsRef}

请从以下维度给出深度优化方案：
1. **根因分析**：当前${goal}表现不佳的核心原因是什么（结合素材具体画面说明）
2. **Top 3 改动优先级**：最应该先改什么，按投产比排优先级
3. **具体执行方案**：每个改动点给出Before→After的对比描述，让制作团队能直接执行
4. **参考案例**：业内同类型素材在该指标上的常见做法

要求：方案必须具体到可执行层面，不要笼统建议。`
}

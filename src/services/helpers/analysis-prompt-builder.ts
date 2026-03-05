import type { VideoMetrics, GenerationConfig, Game } from '@/models/types'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { AudienceType } from '@/models/enums'

export function buildVideoAnalysisPrompt(metrics?: VideoMetrics): string {
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

## 量化评分（必须输出）
请对视频素材进行以下维度评分（每项1-10分），并以固定格式输出：

【评分】
- 钩子强度: X/10
- 节奏把控: X/10
- 卖点覆盖: X/10
- 平台适配: X/10
- 视觉质量: X/10
- 综合评分: X/10

请用中文输出，格式清晰，语言简洁有力，少说废话多给干货。`
}

function formatMetricsBlock(metrics?: VideoMetrics): string {
  if (!metrics) return ''

  const lines: string[] = ['\n\n## 投放数据（请结合数据进行针对性分析）']
  if (metrics.roi3d != null) lines.push(`- 3日ROI：${metrics.roi3d}`)
  if (metrics.roi7d != null) lines.push(`- 7日ROI：${metrics.roi7d}`)
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
  metrics?: VideoMetrics,
): string {
  const metricsRef = metrics
    ? `\n当前数据：${Object.entries(metrics).filter(([, v]) => v != null).map(([k, v]) => {
        const labels: Record<string, string> = { roi3d: '3日ROI', roi7d: '7日ROI', spend: '消耗', ctr: 'CTR', cvr: 'CVR', cpa: 'CPA', completionRate: '完播率' }
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

function formatConfigContext(config: GenerationConfig, game: Game | null): string {
  const parts: string[] = []

  if (game) {
    parts.push(`游戏：${game.name}（${game.genre}），卖点：${game.sell}`)
  }

  const scriptType = SCRIPT_TYPES.find((t) => t.id === config.scriptType)
  if (scriptType) {
    parts.push(`脚本类型：${scriptType.name}`)
  }

  parts.push(`视频时长：${config.duration}秒，画面比例：${config.aspectRatio}`)

  const audienceProfile = AUDIENCE_PROFILES.find((a) => a.id === config.audience)
  if (config.audience === AudienceType.Custom && config.customAudience) {
    parts.push(`目标受众：${config.customAudience}`)
  } else if (audienceProfile) {
    parts.push(`目标受众：${audienceProfile.label}`)
  }

  if (config.selectedThemes.length > 0) {
    parts.push(`吸量主题：${config.selectedThemes.join('、')}`)
  }
  if (config.selectedSellTags.length > 0) {
    parts.push(`展示卖点：${config.selectedSellTags.join('、')}`)
  }
  if (config.hero.value) {
    parts.push(`主角人设：${config.hero.value}`)
  }
  if (config.collabIP.enabled && config.collabIP.name) {
    parts.push(`联动IP：${config.collabIP.name}`)
  }
  if (config.additionalRequirements) {
    parts.push(`补充要求：${config.additionalRequirements}`)
  }

  return parts.join('\n- ')
}

export function buildScriptDirectionsPrompt(
  config: GenerationConfig,
  game: Game | null,
  metrics?: VideoMetrics,
): string {
  const configCtx = formatConfigContext(config, game)
  const metricsRef = metrics
    ? `\n\n投放数据：${Object.entries(metrics).filter(([, v]) => v != null).map(([k, v]) => {
        const labels: Record<string, string> = { roi3d: '3日ROI', roi7d: '7日ROI', spend: '消耗', ctr: 'CTR', cvr: 'CVR', cpa: 'CPA', completionRate: '完播率' }
        const units: Record<string, string> = { spend: '元', ctr: '%', cvr: '%', cpa: '元', completionRate: '%' }
        return `${labels[k] ?? k} ${v}${units[k] ?? ''}`
      }).join(' / ')}`
    : ''

  return `基于刚才的视频分析结果，我需要创作一条全新的买量视频脚本。

## 当前配置
- ${configCtx}${metricsRef}

## 任务
请结合以上视频分析中提炼的**可复用元素**和**优化建议**，同时基于当前的配置参数，给出 **3 个差异化的创意方向**。

每个方向必须包含：
1. **方向名称**（4-8字，一句话概括核心创意）
2. **核心策略**（用什么钩子类型 × 什么叙事结构 × 什么吸量主题，3句话说清楚）
3. **差异化切入点**（这个方向和其他两个的本质区别是什么，为什么值得一试）
4. **预期优势**（预计对哪些投放指标有正向影响，为什么）

## 输出要求
- 3 个方向之间必须有**本质差异**（不同的钩子类型 + 不同的叙事结构 + 不同的情绪调性）
- 每个方向都要吸取原视频的优点、规避原视频的短板
- 用中文输出，格式清晰，编号用 **方向一 / 方向二 / 方向三**`
}

export function buildDirectionDetailPrompt(
  directionNumber: number,
  config: GenerationConfig,
  game: Game | null,
): string {
  const configCtx = formatConfigContext(config, game)

  return `我选择了**方向${['一', '二', '三'][directionNumber - 1]}**，请基于这个方向生成完整的买量视频分镜脚本。

## 当前配置
- ${configCtx}

## 要求
1. 严格按照方向${['一', '二', '三'][directionNumber - 1]}的核心策略、钩子类型和叙事结构来创作
2. 吸收前面视频分析中提炼的可复用元素（节奏模板、转场手法、视觉元素等）
3. 针对原视频的短板进行优化改进
4. 输出完整的分镜脚本，包含每个镜头的时间、画面描述、台词/旁白、镜头运动、转场和音效`
}

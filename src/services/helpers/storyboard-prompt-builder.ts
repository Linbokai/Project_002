import type { Shot } from '@/models/types'

const GRID_POSITIONS = [
  '左上', '上中', '右上',
  '左中', '正中', '右中',
  '左下', '下中', '右下',
] as const

/**
 * 从分镜列表中选取关键镜头（保留首尾、中间等距采样）
 */
export function selectKeyShots(shots: Shot[], maxCount = 9): Shot[] {
  if (shots.length <= maxCount) return [...shots]

  const result: Shot[] = [shots[0]!]
  const remaining = maxCount - 2
  const step = (shots.length - 2) / (remaining + 1)

  for (let i = 1; i <= remaining; i++) {
    const idx = Math.round(i * step)
    result.push(shots[idx]!)
  }

  result.push(shots[shots.length - 1]!)
  return result
}

export function buildStoryboardGridSystemPrompt(aspectRatio: string, visualContext?: string): string {
  const ratioDesc = aspectRatio === '9:16' ? '竖长矩形（9:16 竖屏比例）'
    : aspectRatio === '16:9' ? '横宽矩形（16:9 横屏比例）'
    : '正方形（1:1 比例）'

  const parts = [
    `你是一位专业的电影分镜师和视觉概念艺术家。

## 任务
根据脚本分镜描述，绘制一张【3×3 九宫格分镜概览图】。

## 画面规则
1. 整张图为正方形（1:1），内部分为 3 行 × 3 列共 9 个格子，每格之间用细白线分隔
2. 每个格子的形状为${ratioDesc}，格子之间及四周留适当留白以保持整洁
3. 每个格子代表一个关键镜头，左上角标注镜号（如 #1, #2...）
4. 所有格子必须保持一致的画风、角色造型和配色
5. 每格的构图应体现对应的景别（特写/中景/远景/全景）
6. 画面风格：电影分镜稿质感，简洁有力，重点突出人物动态和场景氛围
7. 色彩：使用统一的色调体系，可以是单色调（如蓝灰）或有限色板
8. 如果镜头不足 9 个，剩余格子留空白或用浅灰填充`,
  ]

  if (visualContext) {
    parts.push(`## 视觉设定\n${visualContext}`)
  }

  return parts.join('\n\n')
}

export function buildStoryboardGridPrompt(
  shots: Shot[],
  gameName: string,
  hasReferenceImages: boolean,
  aspectRatio: string,
): string {
  const keyShots = selectKeyShots(shots)
  const panelCount = keyShots.length

  const panelDescriptions = keyShots.map((shot, i) => {
    const position = GRID_POSITIONS[i] ?? `格${i + 1}`
    const lines = [`格子${i + 1} (${position}) — #${shot.id} [${shot.timeRange || '—'}]`]

    if (shot.scale) lines.push(`景别：${shot.scale}`)
    lines.push(`画面：${shot.scene}`)
    if (shot.camera) lines.push(`镜头运动：${shot.camera}`)
    if (shot.vfx) lines.push(`特效：${shot.vfx}`)

    return lines.join('\n')
  }).join('\n\n')

  const refHint = hasReferenceImages
    ? '请严格参考提供的角色外观和画面风格参考图，确保九宫格中的角色形象和画面风格高度一致。\n\n'
    : ''

  return `${refHint}请为以下广告脚本绘制九宫格分镜概览。

游戏：${gameName}

## 分镜内容（共 ${shots.length} 个镜头，选取 ${panelCount} 个关键镜头）

${panelDescriptions}

## 要求
- 整张图为 1:1 正方形，内部 3×3 网格，每个格子比例为 ${aspectRatio}
- 保持角色和场景在不同格子间的视觉一致性
- 每格构图清晰地传达该镜头的关键动作和情绪
- 每格左上角标注镜号`
}

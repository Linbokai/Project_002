export type ViralDirection = 'theme' | 'style' | 'hook' | 'mixed'

const CHINESE_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

export function buildViralPrompt(
  originalScript: string,
  direction: ViralDirection,
  count: number,
): string {
  const directionInstructions: Record<ViralDirection, string> = {
    theme:
      '保留原脚本的结构、节奏和钩子，替换主题方向。例如原本是"末日生存"主题，换成"王国争霸"主题。',
    style:
      '保留原脚本的主题和核心卖点，替换叙事风格。例如从口播风格换成剧情反转风格。',
    hook:
      '保留原脚本的主体内容，替换开头钩子（前3-5秒）。用完全不同的注意力抓手。',
    mixed:
      '综合调整主题、风格和钩子，生成与原脚本差异化明显但保留核心卖点的全新版本。',
  }

  const variantHeaders = Array.from({ length: count }, (_, i) =>
    `### 变体${CHINESE_NUMERALS[i] ?? i + 1}：[差异化要点]`,
  ).join('\n')

  return `你是一个资深的游戏买量脚本策划，擅长爆款素材裂变。

## 任务
分析以下爆款脚本的成功要素，然后基于裂变方向生成 ${count} 个结构清晰的变体脚本。

## 原始爆款脚本
${originalScript}

## 裂变方向
${directionInstructions[direction]}

## 输出格式（必须严格遵守）

**第一部分：成功要素分析**
用 50 字以内总结原脚本的成功要素（结构、钩子、节奏、卖点）。

**第二部分：裂变变体**
输出 ${count} 个裂变变体，每个变体必须用三级标题分隔：

${variantHeaders}

每个变体内部按分镜段落输出，每段用时间段标题分隔（如 #### 0-3s 钩子），每个分镜包含以下字段（逐字段、逐行输出）：
- **景别**：特写/近景/中景/全景
- **画面**：1-2句简述场景内容
- **口播台词**：完整逐字稿（如原脚本有口播）
- **字幕**：屏幕上出现的重点文字（如有）
- **镜头**：运镜方式
- **音效**：音频标注
- **转场**：转场方式

每个变体保持与原脚本相似的分镜数量、总时长和节奏节拍。

## ⛔ 格式硬性禁令
- 每个变体必须用 ### 变体X：[差异化要点] 作为标题，禁止用 --- 或其他分隔方式
- 每个字段必须独占一行，一行只写一个字段
- 禁止使用 | 管道符/竖线分隔字段
- 禁止使用 markdown 表格格式
- 禁止使用 <br> 等 HTML 标签
- 禁止将多个字段合并到同一行

请开始：`
}

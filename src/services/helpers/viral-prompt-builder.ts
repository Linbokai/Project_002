export type ViralDirection = 'theme' | 'style' | 'hook' | 'mixed'

export function buildViralPrompt(
  originalScript: string,
  direction: ViralDirection,
  count: number
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

  return `你是一个资深的游戏买量脚本策划，擅长爆款素材裂变。

## 任务
分析以下爆款脚本的结构，然后基于裂变方向生成 ${count} 个变体。

## 原始爆款脚本
${originalScript}

## 裂变方向
${directionInstructions[direction]}

## 要求
1. 先用 50 字分析原脚本的成功要素（结构、钩子、节奏、卖点）
2. 然后生成 ${count} 个裂变变体
3. 每个变体用 --- 分隔
4. 每个变体保持与原脚本相似的长度和节奏
5. 标注每个变体的差异化要点

请开始：`
}

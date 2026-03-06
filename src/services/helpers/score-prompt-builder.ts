import { SCORE_DIMENSIONS } from '@/models/types/score'

const DIMENSION_DESCRIPTIONS = SCORE_DIMENSIONS.map(
  (d) => `- ${d.key}（${d.label}）：${d.description}`,
).join('\n')

const JSON_SCHEMA = `{
  "dimensions": [
    { "key": "attraction", "score": 85, "comment": "简短评价" },
    { "key": "rhythm", "score": 78, "comment": "简短评价" },
    { "key": "sellpoint", "score": 90, "comment": "简短评价" },
    { "key": "cta", "score": 72, "comment": "简短评价" },
    { "key": "creativity", "score": 80, "comment": "简短评价" }
  ],
  "summary": "一段整体评价文字",
  "suggestions": ["优化建议1", "优化建议2", "优化建议3"]
}`

export function buildScoreSystemPrompt(): string {
  return `你是一位资深短视频脚本评审专家。请从以下 5 个维度对用户提供的脚本进行打分（0-100），并给出优化建议。

## 评分维度
${DIMENSION_DESCRIPTIONS}

## 评分标准
- 90-100：优秀，行业标杆水平
- 75-89：良好，有少量可优化空间
- 60-74：一般，存在明显短板
- 0-59：待优化，需要大幅调整

## 输出要求
1. 每个维度给出 0-100 的整数分数和一句简短评价（15字以内）
2. 给出一段整体评价（50字以内）
3. 给出 3-5 条具体、可执行的优化建议
4. 必须严格按以下 JSON 格式输出，不要输出任何 JSON 之外的内容

\`\`\`json
${JSON_SCHEMA}
\`\`\``
}

export interface PerformanceContext {
  roi?: number
  ctr?: number
  cvr?: number
  note?: string
}

export function buildScoreUserPrompt(scriptContent: string, perfCtx?: PerformanceContext): string {
  let prompt = `请对以下短视频脚本进行评分：

---
${scriptContent}
---`

  if (perfCtx && (perfCtx.roi || perfCtx.ctr || perfCtx.cvr)) {
    const metrics: string[] = []
    if (perfCtx.roi) metrics.push(`ROI: ${perfCtx.roi}`)
    if (perfCtx.ctr) metrics.push(`CTR: ${perfCtx.ctr}%`)
    if (perfCtx.cvr) metrics.push(`CVR: ${perfCtx.cvr}%`)
    prompt += `\n\n## 历史投放数据参考\n${metrics.join('、')}`
    if (perfCtx.note) prompt += `\n备注：${perfCtx.note}`
    prompt += '\n请结合以上投放数据表现，在评分和建议中给出针对性的优化方向。'
  }

  return prompt
}

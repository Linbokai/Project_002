import { VARIANT_ANGLES } from '@/constants/variant-angles'

export function buildVariantPromptSuffix(variantIndex: number, totalVariants: number): string {
  const safeIndex = Math.min(variantIndex, VARIANT_ANGLES.length - 1)
  const angle = VARIANT_ANGLES[safeIndex]!

  return [
    '',
    `【变体生成指令 — 第 ${variantIndex + 1}/${totalVariants} 个变体】`,
    `创意角度：${angle.label}`,
    angle.instruction,
    '请严格按照上述创意角度来构思脚本的钩子开头、叙事节奏和卖点侧重，使其与其他变体形成差异化。',
  ].join('\n')
}

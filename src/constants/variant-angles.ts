export const VARIANT_ANGLES = [
  { label: '情感共鸣', instruction: '用情感共鸣打动观众，以感性故事或走心场景作为切入点，唤起观众的情绪认同，让他们产生"这说的就是我"的共鸣感。' },
  { label: '福利驱动', instruction: '以产品福利和用户利益为核心驱动力，开篇直击痛点并给出明确的好处承诺，用实际效果和优惠信息推动转化。' },
  { label: '悬念好奇', instruction: '用悬念和好奇心吸引观众停留，开头抛出一个出人意料的问题或反常识的结论，制造信息缺口让观众忍不住看下去。' },
  { label: '趣味搞笑', instruction: '用幽默轻松的方式传递卖点，通过搞笑场景、反转段子或夸张表演让观众在娱乐中接受产品信息，降低广告感。' },
  { label: '紧迫限时', instruction: '营造紧迫感和稀缺性，用限时优惠、库存告急或独家福利等手段激发观众"现在就要行动"的冲动。' },
] as const

export function getAngleLabel(variantIndex: number): string {
  const safeIndex = Math.min(variantIndex, VARIANT_ANGLES.length - 1)
  return VARIANT_ANGLES[safeIndex]!.label
}

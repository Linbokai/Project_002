import { RHYTHM_TEMPLATES } from '@/constants/rhythm-templates'
import type { RhythmTemplate } from '@/constants/rhythm-templates'

export function getRhythmTemplate(duration: number): RhythmTemplate {
  const match = RHYTHM_TEMPLATES.find((t) => t.duration === duration)
  return match ?? RHYTHM_TEMPLATES[2] // default: 15s
}

export function formatRhythmForPrompt(template: RhythmTemplate): string {
  const lines = [`节奏蓝图（${template.duration}秒，${template.segments.length}段）：`]
  for (const seg of template.segments) {
    lines.push(`  ${seg.time} [${seg.role}] 信息密度:${seg.density} 镜头:${seg.shots} 情绪:${seg.emotion}`)
  }
  return lines.join('\n')
}

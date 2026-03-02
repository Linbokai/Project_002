import type { Shot } from '@/models/types'

export function parseFrames(text: string): Shot[] {
  const shots = tryTimelineFormat(text)
    ?? tryBracketFormat(text)
    ?? tryShotNumberFormat(text)
    ?? tryNumberListFormat(text)
    ?? fallbackParagraphs(text)

  return shots.map((s, i) => ({ ...s, id: i + 1 }))
}

function tryTimelineFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /(\d+-\d+s?)[\s]*[【\[]([^\]】]+)[】\]]([\s\S]*?)(?=\d+-\d+s?[\s]*[【\[]|$)/g
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    timeRange: m[1],
    segment: m[2].trim(),
    scene: extractField(m[3], ['画面', '场景', 'scene']),
    voiceover: extractField(m[3], ['台词', '旁白', '口播', 'voiceover', 'VO']),
    textOverlay: extractField(m[3], ['字幕', '花字', '文字']),
    camera: extractField(m[3], ['镜头', 'camera']),
    transition: extractField(m[3], ['转场', 'transition']),
    sfx: extractField(m[3], ['音效', 'sfx', 'BGM']),
    notes: extractField(m[3], ['备注', 'notes']),
  }))
}

function tryBracketFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /[【\[]([^\]】]+)[】\]]([\s\S]*?)(?=[【\[]|$)/g
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m, i) => ({
    timeRange: '',
    segment: m[1].trim(),
    scene: m[2].trim(),
    voiceover: extractField(m[2], ['台词', '旁白', '口播']),
  }))
}

function tryShotNumberFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /(?:分镜|Shot|镜头)\s*(\d+)\s*[:：]([\s\S]*?)(?=(?:分镜|Shot|镜头)\s*\d+\s*[:：]|$)/gi
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    timeRange: '',
    segment: `分镜${m[1]}`,
    scene: m[2].trim(),
    voiceover: extractField(m[2], ['台词', '旁白', '口播']),
  }))
}

function tryNumberListFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /^\s*(\d+)[.、)\]]([\s\S]*?)(?=^\s*\d+[.、)\]]|\Z)/gm
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    timeRange: '',
    segment: `第${m[1]}段`,
    scene: m[2].trim(),
    voiceover: '',
  }))
}

function fallbackParagraphs(text: string): Omit<Shot, 'id'>[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  return paragraphs.map((p, i) => ({
    timeRange: '',
    segment: `段落${i + 1}`,
    scene: p.trim(),
    voiceover: '',
  }))
}

function extractField(text: string, keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(`${key}\\s*[:：]\\s*(.+?)(?=\\n|$)`, 'i')
    const m = text.match(re)
    if (m) return m[1].trim()
  }
  return ''
}

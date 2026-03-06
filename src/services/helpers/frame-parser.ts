import type { Shot } from '@/models/types'

const FIELD_DEFS = [
  { field: 'scale', keys: ['景别', '景', 'scale', 'framing'] },
  { field: 'scene', keys: ['画面', '场景', 'scene', '视觉'] },
  { field: 'voiceover', keys: ['口播台词', '台词', '旁白', '口播', 'voiceover', 'VO', '对白'] },
  { field: 'textOverlay', keys: ['字幕', '花字', '文字', '文案'] },
  { field: 'camera', keys: ['镜头', '镜头运动', '镜头路径', 'camera', '运镜', '机位'] },
  { field: 'vfx', keys: ['特效', '特效分层', 'vfx', 'effects'] },
  { field: 'transition', keys: ['转场', 'transition'] },
  { field: 'sfx', keys: ['音效', 'sfx', 'BGM', '音乐', 'BGM/情绪', 'BGM/音效'] },
  { field: 'notes', keys: ['备注', 'notes', '说明'] },
] as const

type FieldName = (typeof FIELD_DEFS)[number]['field']

const allKeysPattern = FIELD_DEFS.flatMap((d) => d.keys).join('|')
const fieldLabelRe = new RegExp(
  `^[ \\t]*(?:[-*•][ \\t]*)?(?:\\*{1,2})?(${allKeysPattern})(?:\\*{1,2})?\\s*[:：][ \\t]*`,
  'gim',
)

interface ExtractedFields {
  scale?: string
  scene: string
  voiceover: string
  textOverlay?: string
  camera?: string
  vfx?: string
  transition?: string
  sfx?: string
  notes?: string
}

function extractAllFields(block: string): ExtractedFields {
  const result: Record<string, string> = {}

  const labels: { field: FieldName; start: number; contentStart: number }[] = []
  let m: RegExpExecArray | null
  fieldLabelRe.lastIndex = 0

  while ((m = fieldLabelRe.exec(block)) !== null) {
    const matchedKey = m[1]!.toLowerCase()
    const def = FIELD_DEFS.find((d) => d.keys.some((k) => k.toLowerCase() === matchedKey))
    if (def) {
      labels.push({ field: def.field, start: m.index, contentStart: m.index + m[0].length })
    }
  }

  if (labels.length === 0) {
    return { scene: block.trim(), voiceover: '' }
  }

  const preamble = block.slice(0, labels[0]!.start).trim()
  const hasExplicitScene = labels.some((l) => l.field === 'scene')

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]!
    const end = i + 1 < labels.length ? labels[i + 1]!.start : block.length
    const value = block.slice(label.contentStart, end).trim()
    if (!result[label.field]) {
      result[label.field] = value
    }
  }

  if (!hasExplicitScene && preamble) {
    result.scene = preamble
  }

  return {
    scale: result.scale,
    scene: result.scene ?? '',
    voiceover: result.voiceover ?? '',
    textOverlay: result.textOverlay,
    camera: result.camera,
    vfx: result.vfx,
    transition: result.transition,
    sfx: result.sfx,
    notes: result.notes,
  }
}

export function parseFrames(text: string): Shot[] {
  const cleaned = text.replace(/\n---[\s\S]*$/, '')

  const shots = trySchemeFormat(cleaned)
    ?? tryTimelineFormat(cleaned)
    ?? tryBracketFormat(cleaned)
    ?? tryShotNumberFormat(cleaned)
    ?? tryNumberListFormat(cleaned)
    ?? fallbackParagraphs(cleaned)

  return shots.map((s, i) => ({ ...s, id: i + 1 }))
}

function trySchemeFormat(text: string): Omit<Shot, 'id'>[] | null {
  const schemeRe = /#{2,3}\s*(?:方案|变体)[一二三四五六七八九十\d]+[：:]\s*(.+)/g
  const schemeHeaders = [...text.matchAll(schemeRe)]
  if (schemeHeaders.length < 2) return null

  const shots: Omit<Shot, 'id'>[] = []

  for (let si = 0; si < schemeHeaders.length; si++) {
    const header = schemeHeaders[si]!
    const schemeName = header[1]!.trim()
    const start = header.index! + header[0].length
    const end = si + 1 < schemeHeaders.length ? schemeHeaders[si + 1]!.index! : text.length
    const body = text.slice(start, end)

    const subShots = tryTimelineLike(body)
    if (subShots) {
      subShots.forEach((s, i) => {
        shots.push({
          ...s,
          segment: i === 0 ? `${schemeName} · ${s.segment}` : s.segment,
        })
      })
    } else {
      shots.push({ timeRange: '', segment: schemeName, ...extractAllFields(body) })
    }
  }

  return shots.length > 0 ? shots : null
}

function tryTimelineLike(text: string): Omit<Shot, 'id'>[] | null {
  const re = /#{0,4}\s*(\d+-\d+s?)\s+([^\n]+)\n([\s\S]*?)(?=#{0,4}\s*\d+-\d+s?\s|$)/g
  const matches = [...text.matchAll(re)]
  if (matches.length < 1) return null

  return matches.map((m) => ({
    ...extractAllFields(m[3]!),
    timeRange: m[1]!,
    segment: m[2]!.trim(),
  }))
}

function tryTimelineFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /(\d+-\d+s?)[\s]*[【\[]([^\]】]+)[】\]]([\s\S]*?)(?=\d+-\d+s?[\s]*[【\[]|$)/g
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    ...extractAllFields(m[3]!),
    timeRange: m[1]!,
    segment: m[2]!.trim(),
  }))
}

function tryBracketFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /[【\[]([^\]】]+)[】\]]([\s\S]*?)(?=[【\[]|$)/g
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    ...extractAllFields(m[2]!),
    timeRange: '',
    segment: m[1]!.trim(),
  }))
}

function tryShotNumberFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /(?:分镜|Shot|镜头)\s*(\d+)\s*[:：]([\s\S]*?)(?=(?:分镜|Shot|镜头)\s*\d+\s*[:：]|$)/gi
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    ...extractAllFields(m[2]!),
    timeRange: '',
    segment: `分镜${m[1]!}`,
  }))
}

function tryNumberListFormat(text: string): Omit<Shot, 'id'>[] | null {
  const re = /^\s*(\d+)[.、)\]]([\s\S]*?)(?=^\s*\d+[.、)\]]|\Z)/gm
  const matches = [...text.matchAll(re)]
  if (matches.length < 2) return null

  return matches.map((m) => ({
    ...extractAllFields(m[2]!),
    timeRange: '',
    segment: `第${m[1]!}段`,
  }))
}

function fallbackParagraphs(text: string): Omit<Shot, 'id'>[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  return paragraphs.map((p, i) => ({
    timeRange: '',
    segment: `段落${i + 1}`,
    ...extractAllFields(p),
  }))
}

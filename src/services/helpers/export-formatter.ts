import type { Shot } from '@/models/types'

function escapeMarkdownPipe(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatAsMarkdown(
  scriptText: string,
  shots: Shot[],
  gameName: string,
): string {
  const lines: string[] = []

  lines.push(`# ${gameName || '脚本'} — 广告脚本`)
  lines.push(``)
  lines.push(`> 导出时间：${formatDate()}`)
  lines.push(``)
  lines.push(`## 脚本全文`)
  lines.push(``)
  lines.push(scriptText)
  lines.push(``)

  if (shots.length > 0) {
    lines.push(`## 分镜表`)
    lines.push(``)
    lines.push(
      `| 镜号 | 时间 | 段落 | 景别 | 画面描述 | 台词 | 字幕 | 备注 |`,
    )
    lines.push(
      `| :--: | :--: | :--: | :--: | ---- | ---- | ---- | ---- |`,
    )

    for (const shot of shots) {
      const row = [
        String(shot.id),
        shot.timeRange || '-',
        escapeMarkdownPipe(shot.segment || '-'),
        escapeMarkdownPipe(shot.scale || '-'),
        escapeMarkdownPipe(shot.scene || '-'),
        escapeMarkdownPipe(shot.voiceover || '-'),
        escapeMarkdownPipe(shot.textOverlay || '-'),
        escapeMarkdownPipe(shot.notes || '-'),
      ]
      lines.push(`| ${row.join(' | ')} |`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

const CSV_HEADERS = ['镜号', '时间', '段落', '景别', '画面描述', '台词', '字幕', '备注']
const BOM = '\uFEFF'

export function formatAsCsv(shots: Shot[]): string {
  const rows: string[] = []

  rows.push(CSV_HEADERS.map(escapeCsvField).join(','))

  for (const shot of shots) {
    const fields = [
      String(shot.id),
      shot.timeRange || '',
      shot.segment || '',
      shot.scale || '',
      shot.scene || '',
      shot.voiceover || '',
      shot.textOverlay || '',
      shot.notes || '',
    ]
    rows.push(fields.map(escapeCsvField).join(','))
  }

  return BOM + rows.join('\r\n')
}

export function formatAsHtml(script: string, title?: string): string {
  const heading = title ? `<h1>${title}</h1>` : ''
  const body = script
    .split('\n')
    .map(line => {
      if (line.startsWith('# ')) return `<h2>${line.slice(2)}</h2>`
      if (line.startsWith('## ')) return `<h3>${line.slice(3)}</h3>`
      if (line.startsWith('### ')) return `<h4>${line.slice(4)}</h4>`
      if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`
      if (line.startsWith('**') && line.endsWith('**')) return `<p><strong>${line.slice(2, -2)}</strong></p>`
      if (line.trim() === '') return '<br/>'
      return `<p>${line}</p>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title ?? '买量脚本'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #333; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2, h3, h4 { color: #555; margin-top: 24px; }
    li { margin: 4px 0; }
    p { margin: 8px 0; }
  </style>
</head>
<body>
${heading}
${body}
</body>
</html>`
}

export function formatAsPlainText(script: string): string {
  return script
    .replace(/#{1,4}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
}

export type ExportFormat = 'markdown' | 'csv' | 'html' | 'txt'

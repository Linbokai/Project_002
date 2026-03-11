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

export type ExportFormat = 'markdown' | 'csv' | 'html' | 'txt' | 'xls'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const XLS_COLUMNS = [
  { label: '镜号', width: 45 },
  { label: '时间', width: 65 },
  { label: '段落', width: 90 },
  { label: '景别', width: 65 },
  { label: '画面描述', width: 220 },
  { label: '台词', width: 220 },
  { label: '字幕', width: 160 },
  { label: '备注', width: 120 },
]

export function formatAsXls(shots: Shot[], gameName: string): string {
  const title = escapeXml(gameName || '脚本')

  const headerCells = XLS_COLUMNS.map(
    (col) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>`,
  ).join('')

  const colDefs = XLS_COLUMNS.map(
    (col) => `<Column ss:Width="${col.width}"/>`,
  ).join('')

  const dataRows = shots.map((shot) => {
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
    const cells = fields
      .map((v) => `<Cell ss:StyleID="cell"><Data ss:Type="String">${escapeXml(v)}</Data></Cell>`)
      .join('')
    return `<Row>${cells}</Row>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#4F81BD" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
    </Style>
    <Style ss:ID="cell">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${title}_分镜表">
    <Table>${colDefs}
      <Row ss:Height="24">${headerCells}</Row>
      ${dataRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`
}

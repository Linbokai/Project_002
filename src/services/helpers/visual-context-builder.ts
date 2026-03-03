export function buildVisualContextExtractionPrompt(scriptText: string): string {
  return `请从以下买量脚本中提取视觉设定信息，用于保证后续分镜生图时角色、场景、风格的一致性。

请提取并输出以下内容（使用简洁的描述，每项 1-3 句话）：

1. **角色外观**：主要角色的外貌特征、服装、发型、体型、标志性特征
2. **画面风格**：整体画风（2D/3D/写实/卡通）、色调、光影风格、渲染质感
3. **核心视觉元素**：反复出现的场景、道具、UI 元素、特效类型
4. **色彩方案**：主色调、辅助色、氛围色

只输出视觉设定内容，不要输出其他说明文字。

---
脚本内容：
${scriptText}`
}

export function buildImageSystemPrompt(
  visualContext: string,
  hasCharacterImages: boolean,
  hasStyleImages: boolean,
): string {
  const parts = [
    `你是一个专业的分镜稿（Storyboard）绘制助手。请按照以下要求绘制分镜画面：
- 画面风格为分镜稿/故事板，不是精致效果图或成品渲染
- 重点表达构图、景别、人物站位和动态、镜头感
- 画面简洁清晰，信息传达优先，让人一眼看懂场景内容
- 用简洁的色彩区分主体与背景，不需要精细的光影和材质渲染

请严格按照以下视觉设定保持角色和场景的一致性。`,
  ]

  if (hasCharacterImages || hasStyleImages) {
    const refs: string[] = []
    if (hasCharacterImages) refs.push('角色外观参考图')
    if (hasStyleImages) refs.push('画面风格参考图')
    parts.push(`用户已提供${refs.join('和')}，请参照其中的角色特征和整体风格。`)
  }

  parts.push(`视觉设定：\n${visualContext}`)
  return parts.join('\n\n')
}

export function buildShotImagePrompt(
  sceneDescription: string,
  hasReferences: boolean,
  hasUploadedRefs: boolean,
): string {
  const hints: string[] = []

  if (hasUploadedRefs) {
    hints.push('请严格参考提供的角色外观和画面风格参考图，保持人物形象和画面风格高度一致。')
  }
  if (hasReferences) {
    hints.push('请同时参考之前已生成的分镜图片，确保整体画面连贯性。')
  }

  const refHint = hints.length > 0 ? hints.join('\n') + '\n\n' : ''

  return `${refHint}请为以下分镜描述绘制一张分镜稿画面（Storyboard Frame）。
要求：构图清晰、景别明确、人物动态准确，分镜稿风格而非效果图。

${sceneDescription}`
}

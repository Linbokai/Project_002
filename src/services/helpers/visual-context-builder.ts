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

export function buildImageSystemPrompt(visualContext: string): string {
  return `你是一个专业的买量广告画面生成助手。请严格按照以下视觉设定生成图片，确保角色外观、画面风格和视觉元素与设定保持一致。

视觉设定：
${visualContext}`
}

export function buildShotImagePrompt(
  sceneDescription: string,
  hasReferences: boolean,
): string {
  const refHint = hasReferences
    ? '请参考上方提供的图片，保持角色外观和画面风格的一致性。\n\n'
    : ''

  return `${refHint}请为以下分镜画面描述生成一张参考图：

${sceneDescription}`
}

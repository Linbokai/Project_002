import { computed } from 'vue'
import { useImageStore } from '@/stores/image-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { generateImage } from '@/services/api/image-api'
import {
  buildStoryboardGridSystemPrompt,
  buildStoryboardGridPrompt,
  buildArkShotPrompt,
  selectKeyShots,
} from '@/services/helpers/storyboard-prompt-builder'
import { parseFrames } from '@/services/helpers/frame-parser'
import { IMAGE_DEFAULTS } from '@/constants'
import type { ScriptKey, ImageConfig } from '@/models/types'
import { useVisualContext } from '@/composables/use-visual-context'
import { useResolvedModel } from '@/composables/use-resolved-model'

// ---- Canvas 九宫格拼接 ----

const GRID_COLS = 3
const GRID_PADDING = 8
const GRID_BG = '#f5f5f4'
const LABEL_FONT = 'bold 28px sans-serif'
const LABEL_COLOR = '#fff'
const LABEL_BG = 'rgba(0,0,0,0.5)'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`图片加载失败: ${url.slice(0, 60)}`))
    img.src = url
  })
}

async function compositeGrid(imageUrls: string[], totalShots: number): Promise<string> {
  const rows = Math.ceil(Math.max(imageUrls.length, Math.min(totalShots, 9)) / GRID_COLS)
  const cols = GRID_COLS

  // 加载所有图片以获取单元格尺寸
  const images = await Promise.all(imageUrls.map(loadImage))
  const cellW = images[0]?.naturalWidth ?? 512
  const cellH = images[0]?.naturalHeight ?? 512

  const canvasW = cols * cellW + (cols + 1) * GRID_PADDING
  const canvasH = rows * cellH + (rows + 1) * GRID_PADDING

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = GRID_BG
  ctx.fillRect(0, 0, canvasW, canvasH)

  // 绘制每个格子
  const totalCells = rows * cols
  for (let i = 0; i < totalCells; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = GRID_PADDING + col * (cellW + GRID_PADDING)
    const y = GRID_PADDING + row * (cellH + GRID_PADDING)

    if (i < images.length) {
      ctx.drawImage(images[i]!, x, y, cellW, cellH)

      // 镜号标签
      const label = `#${i + 1}`
      ctx.font = LABEL_FONT
      const metrics = ctx.measureText(label)
      const pad = 6
      ctx.fillStyle = LABEL_BG
      ctx.fillRect(x, y, metrics.width + pad * 2, 36)
      ctx.fillStyle = LABEL_COLOR
      ctx.fillText(label, x + pad, y + 26)
    } else {
      // 空格子浅灰填充
      ctx.fillStyle = '#e7e5e4'
      ctx.fillRect(x, y, cellW, cellH)
    }
  }

  return canvas.toDataURL('image/png')
}

// ---- Composable ----

export function useStoryboardGrid(scriptKey: ScriptKey) {
  const imageStore = useImageStore()
  const settingsStore = useSettingsStore()
  const configStore = useConfigStore()
  const gameStore = useGameStore()
  const { ensureVisualContext } = useVisualContext(scriptKey)
  const { withFallback } = useResolvedModel()

  const gridImage = computed(() => imageStore.getGridImage(scriptKey))
  const loading = computed(() => imageStore.isGridLoading(scriptKey))
  const error = computed(() => imageStore.getGridError(scriptKey))

  /** ARK: 逐镜头生图 + Canvas 拼接 */
  async function generateGridArk(scriptContent: string): Promise<void> {
    const shots = parseFrames(scriptContent)
    if (shots.length === 0) {
      imageStore.setGridError(scriptKey, '未解析到分镜内容')
      return
    }

    const contextText = await ensureVisualContext(scriptContent)
    const ctx = imageStore.getContext(scriptKey)
    const uploadedRefs = [
      ...(ctx?.characterImages ?? []),
      ...(ctx?.styleImages ?? []),
    ].map((img) => img.url)

    const panelRatio = configStore.config.aspectRatio as ImageConfig['aspect_ratio']
    const gameName = gameStore.currentGame?.name ?? '游戏'
    const keyShots = selectKeyShots(shots)

    const imageConfig: ImageConfig = {
      aspect_ratio: panelRatio,
      image_size: IMAGE_DEFAULTS.IMAGE_SIZE,
    }

    const imageFb = withFallback('image')

    // 并发生成所有镜头（限制并发 3 个）
    const imageUrls: string[] = []
    const concurrency = 3
    for (let start = 0; start < keyShots.length; start += concurrency) {
      const batch = keyShots.slice(start, start + concurrency)
      const results = await Promise.all(
        batch.map((shot, j) =>
          generateImage({
            config: settingsStore.config,
            model: imageFb.model,
            prompt: buildArkShotPrompt(shot, start + j, gameName, contextText),
            imageConfig,
            referenceImages: uploadedRefs.length > 0 ? uploadedRefs : undefined,
          }),
        ),
      )
      for (const r of results) {
        if (r.images.length > 0) {
          imageUrls.push(r.images[0]!.url)
        }
      }
    }

    if (imageUrls.length === 0) {
      imageStore.setGridError(scriptKey, '所有镜头均未返回图片')
      return
    }

    const gridDataUrl = await compositeGrid(imageUrls, shots.length)

    imageStore.setGridImage(scriptKey, {
      url: gridDataUrl,
      prompt: `九宫格分镜概览 (${shots.length} 镜头，逐镜头拼接)`,
      model: imageFb.model,
      createdAt: Date.now(),
    })
    imageStore.persistToSession()
  }

  /** OpenRouter: 单次生成九宫格 */
  async function generateGridOpenRouter(scriptContent: string): Promise<void> {
    const shots = parseFrames(scriptContent)
    if (shots.length === 0) {
      imageStore.setGridError(scriptKey, '未解析到分镜内容')
      return
    }

    const contextText = await ensureVisualContext(scriptContent)
    const ctx = imageStore.getContext(scriptKey)
    const uploadedRefs = [
      ...(ctx?.characterImages ?? []),
      ...(ctx?.styleImages ?? []),
    ].map((img) => img.url)

    const panelRatio = configStore.config.aspectRatio
    const systemPrompt = buildStoryboardGridSystemPrompt(panelRatio, contextText)
    const prompt = buildStoryboardGridPrompt(
      shots,
      gameStore.currentGame?.name ?? '游戏',
      uploadedRefs.length > 0,
      panelRatio,
    )

    const imageConfig: ImageConfig = {
      aspect_ratio: '1:1',
      image_size: '2K',
    }

    const imageFb = withFallback('image')
    const result = await generateImage({
      config: settingsStore.config,
      ...imageFb,
      prompt,
      imageConfig,
      systemPrompt,
      referenceImages: uploadedRefs.length > 0 ? uploadedRefs : undefined,
    })

    if (result.images.length > 0) {
      imageStore.setGridImage(scriptKey, {
        url: result.images[0]!.url,
        prompt: `九宫格分镜概览 (${shots.length} 镜头)`,
        model: imageFb.model,
        createdAt: Date.now(),
      })
      imageStore.persistToSession()
    } else {
      imageStore.setGridError(scriptKey, '模型未返回图片')
    }
  }

  async function generateGrid(scriptContent: string): Promise<void> {
    if (imageStore.isGridLoading(scriptKey)) return

    imageStore.setGridLoading(scriptKey, true)
    try {
      if (settingsStore.config.provider === 'ark') {
        await generateGridArk(scriptContent)
      } else {
        await generateGridOpenRouter(scriptContent)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '九宫格生图失败'
      imageStore.setGridError(scriptKey, msg)
    } finally {
      imageStore.setGridLoading(scriptKey, false)
    }
  }

  return { gridImage, loading, error, generateGrid }
}

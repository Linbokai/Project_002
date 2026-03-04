import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { GeneratedImage, VisualContext, ShotImageKey, ScriptKey } from '@/models/types'
import { saveSessionImages, loadSessionImages } from '@/utils/image-db'

export const useImageStore = defineStore('image', () => {
  const imageMap = reactive(new Map<ShotImageKey, GeneratedImage>())
  const loadingSet = reactive(new Set<ShotImageKey>())
  const errorMap = reactive(new Map<ShotImageKey, string>())

  const contextMap = reactive(new Map<ScriptKey, VisualContext>())
  const contextLoadingSet = reactive(new Set<ScriptKey>())

  const gridImageMap = reactive(new Map<ScriptKey, GeneratedImage>())
  const gridLoadingSet = reactive(new Set<ScriptKey>())
  const gridErrorMap = reactive(new Map<ScriptKey, string>())

  let currentSessionId: string | null = null

  function getImage(key: ShotImageKey): GeneratedImage | undefined {
    return imageMap.get(key)
  }

  function setImage(key: ShotImageKey, image: GeneratedImage) {
    imageMap.set(key, image)
    errorMap.delete(key)
  }

  function isLoading(key: ShotImageKey): boolean {
    return loadingSet.has(key)
  }

  function setLoading(key: ShotImageKey, loading: boolean) {
    if (loading) {
      loadingSet.add(key)
      errorMap.delete(key)
    } else {
      loadingSet.delete(key)
    }
  }

  function getError(key: ShotImageKey): string | undefined {
    return errorMap.get(key)
  }

  function setError(key: ShotImageKey, msg: string) {
    errorMap.set(key, msg)
  }

  function getContext(scriptKey: ScriptKey): VisualContext | undefined {
    return contextMap.get(scriptKey)
  }

  function setContext(scriptKey: ScriptKey, ctx: VisualContext) {
    contextMap.set(scriptKey, ctx)
  }

  function isContextLoading(scriptKey: ScriptKey): boolean {
    return contextLoadingSet.has(scriptKey)
  }

  function setContextLoading(scriptKey: ScriptKey, loading: boolean) {
    if (loading) {
      contextLoadingSet.add(scriptKey)
    } else {
      contextLoadingSet.delete(scriptKey)
    }
  }

  function getGridImage(scriptKey: ScriptKey): GeneratedImage | undefined {
    return gridImageMap.get(scriptKey)
  }

  function setGridImage(scriptKey: ScriptKey, image: GeneratedImage) {
    gridImageMap.set(scriptKey, image)
    gridErrorMap.delete(scriptKey)
  }

  function isGridLoading(scriptKey: ScriptKey): boolean {
    return gridLoadingSet.has(scriptKey)
  }

  function setGridLoading(scriptKey: ScriptKey, loading: boolean) {
    if (loading) {
      gridLoadingSet.add(scriptKey)
      gridErrorMap.delete(scriptKey)
    } else {
      gridLoadingSet.delete(scriptKey)
    }
  }

  function getGridError(scriptKey: ScriptKey): string | undefined {
    return gridErrorMap.get(scriptKey)
  }

  function setGridError(scriptKey: ScriptKey, msg: string) {
    gridErrorMap.set(scriptKey, msg)
  }

  function getScriptImages(scriptKey: ScriptKey): GeneratedImage[] {
    const prefix = `${scriptKey}-`
    const images: GeneratedImage[] = []
    for (const [key, img] of imageMap) {
      if (key.startsWith(prefix)) {
        images.push(img)
      }
    }
    return images.sort((a, b) => a.createdAt - b.createdAt)
  }

  function getSnapshot(): { images: Record<string, GeneratedImage>; contexts: Record<string, VisualContext>; gridImages: Record<string, GeneratedImage> } {
    const images: Record<string, GeneratedImage> = {}
    for (const [k, v] of imageMap) images[k] = v
    const contexts: Record<string, VisualContext> = {}
    for (const [k, v] of contextMap) contexts[k] = v
    const gridImages: Record<string, GeneratedImage> = {}
    for (const [k, v] of gridImageMap) gridImages[k] = v
    return { images, contexts, gridImages }
  }

  function clearAll() {
    imageMap.clear()
    loadingSet.clear()
    errorMap.clear()
    contextMap.clear()
    contextLoadingSet.clear()
    gridImageMap.clear()
    gridLoadingSet.clear()
    gridErrorMap.clear()
    currentSessionId = null
  }

  async function loadSession(sessionId: string) {
    clearAll()
    currentSessionId = sessionId
    const data = await loadSessionImages(sessionId)
    if (!data) return
    for (const [k, v] of Object.entries(data.images)) imageMap.set(k, v)
    for (const [k, v] of Object.entries(data.contexts)) contextMap.set(k, v)
    if (data.gridImages) {
      for (const [k, v] of Object.entries(data.gridImages)) gridImageMap.set(k, v)
    }
  }

  async function persistToSession(sessionId?: string | null) {
    const id = sessionId ?? currentSessionId
    if (!id) return
    currentSessionId = id
    const { images, contexts, gridImages } = getSnapshot()
    await saveSessionImages(id, images, contexts, gridImages)
  }

  function bindSession(sessionId: string) {
    currentSessionId = sessionId
  }

  function getSessionId(): string | null {
    return currentSessionId
  }

  return {
    getImage,
    setImage,
    isLoading,
    setLoading,
    getError,
    setError,
    getContext,
    setContext,
    isContextLoading,
    setContextLoading,
    getGridImage,
    setGridImage,
    isGridLoading,
    setGridLoading,
    getGridError,
    setGridError,
    getScriptImages,
    getSnapshot,
    clearAll,
    loadSession,
    persistToSession,
    bindSession,
    getSessionId,
  }
})

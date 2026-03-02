import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { GeneratedImage, VisualContext, ShotImageKey, ScriptKey } from '@/models/types'

export const useImageStore = defineStore('image', () => {
  const imageMap = reactive(new Map<ShotImageKey, GeneratedImage>())
  const loadingSet = reactive(new Set<ShotImageKey>())
  const errorMap = reactive(new Map<ShotImageKey, string>())

  const contextMap = reactive(new Map<ScriptKey, VisualContext>())
  const contextLoadingSet = reactive(new Set<ScriptKey>())

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
    getScriptImages,
  }
})

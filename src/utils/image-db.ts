import type { GeneratedImage, VisualContext } from '@/models/types'

export interface ImageSessionData {
  sessionId: string
  images: Record<string, GeneratedImage>
  contexts: Record<string, VisualContext>
  gridImages?: Record<string, GeneratedImage>
}

const DB_NAME = 'sg_image_db'
const STORE_NAME = 'session_images'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveSessionImages(
  sessionId: string,
  images: Record<string, GeneratedImage>,
  contexts: Record<string, VisualContext>,
  gridImages?: Record<string, GeneratedImage>,
): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put({ sessionId, images, contexts, gridImages } satisfies ImageSessionData)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch (e) {
    console.error('[ImageDB] save failed', e)
  }
}

export async function loadSessionImages(
  sessionId: string,
): Promise<ImageSessionData | null> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(sessionId)
    const result = await new Promise<ImageSessionData | null>((resolve, reject) => {
      req.onsuccess = () => resolve((req.result as ImageSessionData) ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result
  } catch (e) {
    console.error('[ImageDB] load failed', e)
    return null
  }
}

export async function deleteSessionImages(sessionId: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(sessionId)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch (e) {
    console.error('[ImageDB] delete failed', e)
  }
}

export async function clearAllSessionImages(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch (e) {
    console.error('[ImageDB] clearAll failed', e)
  }
}

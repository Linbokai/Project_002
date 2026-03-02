import { ref } from 'vue'
import { VIDEO_FRAME_EXTRACTION } from '@/constants'

const { FPS, MAX_FRAMES, MAX_WIDTH, JPEG_QUALITY } = VIDEO_FRAME_EXTRACTION

const progress = ref(0)

export function useVideoFrames() {
  async function extractFrames(video: File): Promise<string[]> {
    progress.value = 0
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(video)
      const videoEl = document.createElement('video')
      videoEl.muted = true
      videoEl.playsInline = true
      videoEl.crossOrigin = 'anonymous'

      videoEl.onloadedmetadata = () => {
        const duration = videoEl.duration
        const totalFrames = Math.min(
          Math.floor(duration * FPS),
          MAX_FRAMES,
        )
        const frames: string[] = []
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('无法创建 canvas context'))
          return
        }

        let captured = 0
        const captureNext = (t: number) => {
          if (captured >= totalFrames) {
            URL.revokeObjectURL(url)
            videoEl.src = ''
            progress.value = 100
            resolve(frames)
            return
          }
          videoEl.currentTime = t
        }

        videoEl.onseeked = () => {
          let w = videoEl.videoWidth
          let h = videoEl.videoHeight
          if (w > MAX_WIDTH) {
            h = Math.round((h * MAX_WIDTH) / w)
            w = MAX_WIDTH
          }
          canvas.width = w
          canvas.height = h
          ctx.drawImage(videoEl, 0, 0, w, h)
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
          frames.push(dataUrl)
          captured++
          progress.value = Math.round((captured / totalFrames) * 100)
          const nextT = (captured / totalFrames) * duration
          captureNext(nextT)
        }

        videoEl.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('视频加载失败'))
        }

        captureNext(0)
      }

      videoEl.src = url
    })
  }

  return { extractFrames, progress }
}

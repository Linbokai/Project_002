import { inject } from 'vue'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToastApi {
  showToast: (message: string, variant?: ToastVariant) => void
  dismissToast: (id: number) => void
}

const TOAST_KEY = Symbol.for('toast')

export function useToast(): ToastApi {
  const api = inject<ToastApi>(TOAST_KEY)
  if (!api) {
    throw new Error('useToast must be used within a BaseToast provider')
  }
  return api
}

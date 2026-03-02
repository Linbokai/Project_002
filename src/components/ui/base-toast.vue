<script setup lang="ts">
import { ref, provide, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

const toasts = ref<ToastItem[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()
let idCounter = 0

const DEFAULT_DURATION = 3000

function show(message: string, variant: ToastVariant = 'default') {
  const id = ++idCounter
  toasts.value = [...toasts.value, { id, message, variant }]

  const timer = setTimeout(() => {
    dismiss(id)
    timers.delete(id)
  }, DEFAULT_DURATION)
  timers.set(id, timer)
}

function dismiss(id: number) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

const TOAST_KEY = Symbol.for('toast')

provide<{
  showToast: typeof show
  dismissToast: typeof dismiss
}>(TOAST_KEY, {
  showToast: show,
  dismissToast: dismiss
})

onUnmounted(() => {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
})

const variantBorderClasses: Record<ToastVariant, string> = {
  default: 'border-border',
  success: 'border-green-200 dark:border-green-800',
  destructive: 'border-destructive'
}
</script>

<template>
  <slot />
  <div
    class="fixed right-0 top-0 z-[100] flex flex-col gap-2 p-4"
    role="region"
    aria-label="通知"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-start gap-3 rounded-lg border bg-background p-4 text-foreground shadow-lg',
          variantBorderClasses[toast.variant]
        ]"
      >
        <span class="flex-1 text-sm">{{ toast.message }}</span>
        <button
          type="button"
          class="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="关闭"
          @click="dismiss(toast.id)"
        >
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-move {
  transition: transform 0.2s ease;
}
</style>

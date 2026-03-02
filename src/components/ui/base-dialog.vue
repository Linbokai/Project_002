<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    size?: 'default' | 'lg'
  }>(),
  { size: 'default' }
)

const emit = defineEmits<{
  close: []
}>()

function handleOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement)?.dataset?.dialogOverlay === 'true') {
    emit('close')
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

function handlePanelClick(e: MouseEvent) {
  e.stopPropagation()
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-show="open"
        data-dialog-overlay="true"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click="handleOverlayClick"
      >
        <Transition name="dialog-panel">
          <div
            v-show="open"
            :class="[
            'flex w-full flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg',
            size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
          ]"
            @click="handlePanelClick"
          >
            <div v-if="$slots.header" class="flex flex-col gap-1.5">
              <slot name="header" />
            </div>
            <slot />
            <div v-if="$slots.footer" class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-panel-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.dialog-panel-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dialog-panel-enter-from,
.dialog-panel-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

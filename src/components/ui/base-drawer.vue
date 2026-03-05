<script setup lang="ts">
import { watch, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const drawerRef = ref<HTMLElement | null>(null)
let startX = 0
let currentX = 0
let dragging = false

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0]!.clientX
  currentX = startX
  dragging = true
}

function onTouchMove(e: TouchEvent) {
  if (!dragging) return
  currentX = e.touches[0]!.clientX
  const dx = currentX - startX
  if (dx < 0 && drawerRef.value) {
    drawerRef.value.style.transform = `translateX(${dx}px)`
  }
}

function onTouchEnd() {
  if (!dragging) return
  dragging = false
  const dx = currentX - startX
  if (drawerRef.value) {
    drawerRef.value.style.transform = ''
  }
  if (dx < -80) {
    emit('close')
  }
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
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
    <Transition name="drawer">
      <div
        v-show="open"
        class="fixed inset-0 z-50"
      >
        <Transition name="drawer-overlay">
          <div
            v-show="open"
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            @click="emit('close')"
          />
        </Transition>

        <Transition name="drawer-panel">
          <aside
            v-show="open"
            ref="drawerRef"
            class="absolute inset-y-0 left-0 flex w-[85vw] max-w-sm flex-col bg-background shadow-xl"
            @touchstart.passive="onTouchStart"
            @touchmove.passive="onTouchMove"
            @touchend.passive="onTouchEnd"
          >
            <slot />
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-overlay-enter-active,
.drawer-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-overlay-enter-from,
.drawer-overlay-leave-to {
  opacity: 0;
}

.drawer-panel-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-panel-leave-active {
  transition: transform 0.2s ease-in;
}
.drawer-panel-enter-from,
.drawer-panel-leave-to {
  transform: translateX(-100%);
}
</style>

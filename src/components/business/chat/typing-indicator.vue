<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  stages?: string[]
}>(), {
  label: '思考中...',
  stages: () => [],
})

const currentStage = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const stageLabel = computed(() => {
  if (props.stages.length === 0) return props.label
  return props.stages[currentStage.value] ?? props.label
})

const stageProgress = computed(() => {
  if (props.stages.length === 0) return null
  return `${currentStage.value + 1}/${props.stages.length}`
})

onMounted(() => {
  if (props.stages.length > 1) {
    timer = setInterval(() => {
      if (currentStage.value < props.stages.length - 1) {
        currentStage.value++
      }
    }, 4000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex w-full max-w-[85%] flex-col gap-2">
    <div class="flex items-center gap-2">
      <div class="flex gap-1">
        <span
          class="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style="animation-delay: 0ms"
        />
        <span
          class="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style="animation-delay: 150ms"
        />
        <span
          class="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style="animation-delay: 300ms"
        />
      </div>
      <span class="text-xs text-muted-foreground">{{ stageLabel }}</span>
      <span v-if="stageProgress" class="text-[10px] text-muted-foreground/50">{{ stageProgress }}</span>
    </div>
    <!-- Stage Steps -->
    <div v-if="stages.length > 1" class="flex items-center gap-1 pl-7">
      <div
        v-for="(_, idx) in stages"
        :key="idx"
        class="h-1 flex-1 rounded-full transition-colors duration-500"
        :class="idx <= currentStage ? 'bg-brand/60' : 'bg-muted'"
      />
    </div>
  </div>
</template>

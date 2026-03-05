<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import type { ScoreDimension } from '@/models/types/score'

const props = defineProps<{
  dimensions: ScoreDimension[]
}>()

const animated = ref(false)
const progress = ref(0)
let animationFrame = 0

const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 75
const LEVELS = [20, 40, 60, 80, 100]
const LABEL_RADIUS = RADIUS + 20

function polarToXY(angleDeg: number, radius: number): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  }
}

const angleStep = computed(() => 360 / props.dimensions.length)

function getVertex(index: number, value: number): { x: number; y: number } {
  const r = (value / 100) * RADIUS
  return polarToXY(index * angleStep.value, r)
}

const gridPaths = computed(() =>
  LEVELS.map((level) => {
    const r = (level / 100) * RADIUS
    const points = props.dimensions
      .map((_, i) => {
        const { x, y } = polarToXY(i * angleStep.value, r)
        return `${x},${y}`
      })
      .join(' ')
    return `M ${points.split(' ').join(' L ')} Z`
  }),
)

const axisPaths = computed(() =>
  props.dimensions.map((_, i) => {
    const { x, y } = polarToXY(i * angleStep.value, RADIUS)
    return `M ${CENTER},${CENTER} L ${x},${y}`
  }),
)

const dataPath = computed(() => {
  const t = progress.value
  const points = props.dimensions
    .map((d, i) => {
      const { x, y } = getVertex(i, d.score * t)
      return `${x},${y}`
    })
    .join(' ')
  return `M ${points.split(' ').join(' L ')} Z`
})

const labels = computed(() =>
  props.dimensions.map((d, i) => {
    const { x, y } = polarToXY(i * angleStep.value, LABEL_RADIUS)
    const angle = i * angleStep.value
    let anchor: 'middle' | 'start' | 'end' = 'middle'
    if (angle > 10 && angle < 170) anchor = 'start'
    else if (angle > 190 && angle < 350) anchor = 'end'
    return { ...d, x, y, anchor }
  }),
)

function animateIn() {
  animated.value = false
  progress.value = 0
  cancelAnimationFrame(animationFrame)

  const duration = 600
  const start = performance.now()

  function step(now: number) {
    const elapsed = now - start
    const t = Math.min(elapsed / duration, 1)
    progress.value = easeOutCubic(t)
    if (t < 1) {
      animationFrame = requestAnimationFrame(step)
    } else {
      animated.value = true
    }
  }

  animationFrame = requestAnimationFrame(step)
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

onMounted(animateIn)
watch(() => props.dimensions, animateIn, { deep: true })
</script>

<template>
  <svg
    :width="SIZE"
    :height="SIZE"
    :viewBox="`0 0 ${SIZE} ${SIZE}`"
    class="block"
  >
    <!-- Grid levels -->
    <path
      v-for="(path, i) in gridPaths"
      :key="`grid-${i}`"
      :d="path"
      fill="none"
      class="stroke-border"
      stroke-width="0.5"
      opacity="0.4"
    />

    <!-- Axis lines -->
    <path
      v-for="(path, i) in axisPaths"
      :key="`axis-${i}`"
      :d="path"
      fill="none"
      class="stroke-border"
      stroke-width="0.5"
      opacity="0.3"
    />

    <!-- Data polygon -->
    <path
      :d="dataPath"
      fill="var(--brand)"
      fill-opacity="0.2"
      stroke="var(--brand)"
      stroke-width="1.5"
      stroke-linejoin="round"
    />

    <!-- Data points -->
    <circle
      v-for="(d, i) in dimensions"
      :key="`dot-${i}`"
      :cx="getVertex(i, d.score * progress).x"
      :cy="getVertex(i, d.score * progress).y"
      r="3"
      fill="var(--brand)"
    />

    <!-- Labels -->
    <text
      v-for="(l, i) in labels"
      :key="`label-${i}`"
      :x="l.x"
      :y="l.y"
      :text-anchor="l.anchor"
      dominant-baseline="central"
      class="fill-foreground text-[10px]"
    >
      {{ l.label }}
    </text>

    <!-- Scores -->
    <text
      v-for="(l, i) in labels"
      :key="`score-${i}`"
      :x="l.x"
      :y="l.y + 13"
      :text-anchor="l.anchor"
      dominant-baseline="central"
      class="fill-muted-foreground text-[9px]"
    >
      {{ l.score }}分
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AD_PLATFORMS } from '@/constants/ad-platforms'
import type { AdPlatform } from '@/constants/ad-platforms'

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  { modelValue: 'general' },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'apply-recommendation': [platform: AdPlatform]
}>()

const selectedPlatform = computed(() =>
  AD_PLATFORMS.find((p) => p.id === props.modelValue) ?? AD_PLATFORMS[AD_PLATFORMS.length - 1]!,
)

const recommendationLabel = computed(() => {
  const p = selectedPlatform.value
  if (!p || p.id === 'general') return ''
  const parts: string[] = []
  if (p.recommendedAspectRatio) {
    const ratioName =
      p.recommendedAspectRatio === '9:16'
        ? '竖屏'
        : p.recommendedAspectRatio === '16:9'
          ? '横屏'
          : '方屏'
    parts.push(ratioName)
  }
  if (p.recommendedDuration.length) {
    parts.push(p.recommendedDuration.map((d: number) => `${d}s`).join('/'))
  }
  if (p.rhythmStyle) {
    parts.push(p.rhythmStyle)
  }
  return parts.length ? `推荐 ${parts.join(' · ')}` : ''
})

function selectPlatform(platform: AdPlatform) {
  emit('update:modelValue', platform.id)
  if (platform.id !== 'general') {
    emit('apply-recommendation', platform)
  }
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="grid grid-cols-4 gap-1.5">
      <button
        v-for="platform in AD_PLATFORMS"
        :key="platform.id"
        type="button"
        class="flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-center transition-colors"
        :class="
          modelValue === platform.id
            ? 'border-brand bg-brand/10 text-brand'
            : 'border-border bg-background text-foreground hover:bg-accent'
        "
        @click="selectPlatform(platform)"
      >
        <span class="text-base leading-none">{{ platform.icon }}</span>
        <span class="text-[10px] leading-tight">{{ platform.name }}</span>
      </button>
    </div>

    <div
      v-if="recommendationLabel"
      class="flex items-center gap-1.5 rounded-md bg-brand/5 px-2.5 py-1.5 text-[11px] text-brand"
    >
      <span class="shrink-0">✨</span>
      <span>{{ recommendationLabel }}</span>
    </div>
  </div>
</template>

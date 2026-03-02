<script setup lang="ts">
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { SearchPlatform } from '@/models/enums'

const themeRadarStore = useThemeRadarStore()

const PLATFORMS: { value: SearchPlatform; label: string }[] = [
  { value: SearchPlatform.Douyin, label: '抖音' },
  { value: SearchPlatform.Kuaishou, label: '快手' },
  { value: SearchPlatform.Bilibili, label: 'B站' },
  { value: SearchPlatform.All, label: '全平台' },
]

function setPlatform(p: SearchPlatform) {
  themeRadarStore.setPlatform(p)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="p in PLATFORMS"
      :key="p.value"
      type="button"
      :class="[
        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
        themeRadarStore.platform === p.value
          ? 'bg-brand text-brand-foreground'
          : 'border border-input bg-transparent text-muted-foreground hover:border-brand/50 hover:text-foreground'
      ]"
      @click="setPlatform(p.value)"
    >
      {{ p.label }}
    </button>
  </div>
</template>

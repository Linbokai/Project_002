<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'disconnected' | 'connecting' | 'connected'
  }>(),
  {
    status: 'disconnected'
  }
)

const statusConfig = computed(() => {
  const configs = {
    disconnected: {
      dotClass: 'bg-destructive',
      animate: false,
      label: '未连接'
    },
    connecting: {
      dotClass: 'bg-chart-4',
      animate: true,
      label: '连接中'
    },
    connected: {
      dotClass: 'bg-chart-2',
      animate: false,
      label: '已连接'
    }
  }
  return configs[props.status]
})
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span
      :class="[
        'h-2 w-2 shrink-0 rounded-full',
        statusConfig.dotClass,
        statusConfig.animate && 'animate-pulse'
      ]"
      :aria-label="statusConfig.label"
    />
    <span class="text-sm text-muted-foreground">{{ statusConfig.label }}</span>
  </span>
</template>

<style scoped>
</style>

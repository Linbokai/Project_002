<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/use-theme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    class="inline-flex h-9 w-9 items-center justify-center rounded-md
           hover:bg-accent hover:text-accent-foreground
           focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
           transition-[color,background-color,box-shadow]"
    :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" :size="16" />
    <Moon v-else :size="16" />
  </button>
</template>

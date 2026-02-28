import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme-store'

export function useTheme() {
  const themeStore = useThemeStore()

  const isDark = computed(() => {
    if (themeStore.mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return themeStore.mode === 'dark'
  })

  function toggleTheme() {
    themeStore.setMode(isDark.value ? 'light' : 'dark')
  }

  function setMode(mode: 'light' | 'dark' | 'system') {
    themeStore.setMode(mode)
  }

  return { mode: computed(() => themeStore.mode), isDark, toggleTheme, setMode }
}

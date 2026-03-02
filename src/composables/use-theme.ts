import { computed, watch } from 'vue'
import { useThemeStore } from '@/stores/theme-store'
import type { ThemeMode } from '@/stores/theme-store'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemTheme() : mode
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

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

  function setMode(mode: ThemeMode) {
    themeStore.setMode(mode)
  }

  function init() {
    applyTheme(themeStore.mode)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (themeStore.mode === 'system') {
        applyTheme('system')
      }
    })
  }

  watch(() => themeStore.mode, (val) => applyTheme(val))

  return { mode: computed(() => themeStore.mode), isDark, toggleTheme, setMode, init }
}

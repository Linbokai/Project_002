import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'ai-model-hub-theme'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === 'system' ? getSystemTheme() : mode
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(
    (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system',
  )

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem(STORAGE_KEY, newMode)
    applyTheme(newMode)
  }

  function init() {
    applyTheme(mode.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'system') {
        applyTheme('system')
      }
    })
  }

  watch(mode, (val) => applyTheme(val))

  return { mode, setMode, init }
})

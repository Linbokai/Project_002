import { HOOK_PATTERNS } from '@/constants/hook-patterns'
import { PRESET_THEMES } from '@/constants/preset-themes'
import type { HookPattern } from '@/constants/hook-patterns'

export function matchHooks(selectedThemeNames: string[], topN = 5): HookPattern[] {
  const sceneIds = new Set<string>()

  for (const name of selectedThemeNames) {
    const preset = PRESET_THEMES.find(
      (t) => t.name === name || t.id === name,
    )
    if (preset) {
      preset.scenes.forEach((s) => sceneIds.add(s))
    }
  }

  if (sceneIds.size === 0) return HOOK_PATTERNS.slice(0, topN)

  const scored = HOOK_PATTERNS.map((hook) => {
    const overlap = hook.scenes.filter((s) => sceneIds.has(s)).length
    return { hook, score: overlap }
  })

  scored.sort((a, b) => b.score - a.score)

  const result = scored.slice(0, topN).map((s) => s.hook)

  if (result.length < topN) {
    const ids = new Set(result.map((h) => h.id))
    for (const hook of HOOK_PATTERNS) {
      if (result.length >= topN) break
      if (!ids.has(hook.id)) result.push(hook)
    }
  }

  return result
}

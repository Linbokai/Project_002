import { computed, unref } from 'vue'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useSettingsStore } from '@/stores/settings-store'
import { chatCompletion } from '@/services/api/openrouter-api'
import type { ThemeTopic } from '@/models/types'
import { SearchPlatform } from '@/models/enums'
import { generateId } from '@/utils'

const PLATFORM_LABELS: Record<SearchPlatform, string> = {
  [SearchPlatform.Douyin]: '抖音',
  [SearchPlatform.Kuaishou]: '快手',
  [SearchPlatform.Bilibili]: 'B站',
  [SearchPlatform.All]: '全平台',
}

const SEARCH_PROMPT_TEMPLATE = `搜索当前{platform}平台上最热门的手游买量视频趋势，包括：热门话题、爆款视频套路、热门角色/IP、竞品动态、有效的钩子套路。
请返回 JSON 数组格式，每个元素包含：name(主题名)、desc(描述)、tag(标签)、heat(热度)、hooks(钩子套路数组)、cases(案例数组)。
只输出纯 JSON，不要其他说明文字。格式示例：
[{"name":"xxx","desc":"xxx","tag":"xxx","heat":"高","hooks":["xxx"],"cases":["xxx"]}]`

function buildSearchPrompt(platform: SearchPlatform): string {
  const platformLabel = PLATFORM_LABELS[platform]
  return SEARCH_PROMPT_TEMPLATE.replace('{platform}', platformLabel)
}

function parseToThemeTopics(raw: unknown): ThemeTopic[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item, idx) => {
    const o = item as Record<string, unknown>
    return {
      id: (o.id as string) ?? generateId(),
      name: String(o.name ?? ''),
      desc: String(o.desc ?? ''),
      tag: String(o.tag ?? ''),
      heat: String(o.heat ?? ''),
      hooks: Array.isArray(o.hooks) ? o.hooks.map(String) : [],
      cases: Array.isArray(o.cases) ? o.cases.map(String) : [],
      selected: false,
    }
  })
}

export function useThemeSearch() {
  const themeRadarStore = useThemeRadarStore()
  const settingsStore = useSettingsStore()

  const isSearching = computed(() => unref(themeRadarStore.searching))

  async function searchHotTopics(): Promise<void> {
    const config = unref(settingsStore.config)
    if (!config.openRouterKey) {
      throw new Error('请先配置 API Key')
    }

    themeRadarStore.setSearching(true)
    try {
      const prompt = buildSearchPrompt(unref(themeRadarStore.platform))
      const response = await chatCompletion({
        config,
        model: settingsStore.getModelForTask('search'),
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      })

      let parsed: unknown
      const cleaned = response.replace(/^[\s\S]*?\[/, '[').replace(/\][\s\S]*$/, ']')
      try {
        parsed = JSON.parse(cleaned)
      } catch {
        parsed = JSON.parse(response)
      }
      const topics = parseToThemeTopics(parsed)
      themeRadarStore.setSearchResults(topics)
    } finally {
      themeRadarStore.setSearching(false)
    }
  }

  function getPromptForManualMode(): string {
    return buildSearchPrompt(unref(themeRadarStore.platform))
  }

  function importManualResult(text: string): ThemeTopic[] {
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return []
    }
    const topics = parseToThemeTopics(parsed)
    themeRadarStore.setSearchResults(topics)
    return topics
  }

  return {
    searchHotTopics,
    getPromptForManualMode,
    importManualResult,
    isSearching,
  }
}

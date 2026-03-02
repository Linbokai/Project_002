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

const SEARCH_PROMPT_TEMPLATE = `你是一位资深的短视频买量创意策划，深谙{platform}平台的流量密码。

请列出当前{platform}平台上**最火、最吸量的短视频内容题材/类型** 8~12 个。
要求：
- 聚焦具体的内容题材方向（如：丧尸末日、微恐悬疑、末日生存、狗血反转、逆袭打脸等），而非笼统的"热门话题"或"竞品动态"
- 这些题材是当下真正在跑量、完播率高、互动量大的爆款方向
- 按热度从高到低排列
- 每个题材给出该方向下被验证有效的钩子套路和爆款案例

返回纯 JSON 数组，每个元素：
- name: 题材名（2~4字，如"丧尸末日""微恐悬疑"）
- desc: 为什么这个题材火/吸量的核心原因（1~2句话）
- tag: 所属大类标签（如"恐怖向""情感向""爽感向""猎奇向""解压向"等）
- heat: 热度（"爆""高""中"）
- hooks: 该题材下 3~5 个被验证有效的开头钩子套路
- cases: 2~3 个该题材的爆款视频案例描述

只输出纯 JSON，不要任何其他说明文字。格式示例：
[{"name":"丧尸末日","desc":"末日求生压迫感+视觉冲击，完播率极高","tag":"恐怖向","heat":"爆","hooks":["开局被丧尸包围，只剩最后一颗子弹","你能在丧尸城市活过3天吗"],"cases":["某SLG丧尸围城素材单日消耗50w+"]}]`

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

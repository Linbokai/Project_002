import { computed, unref } from 'vue'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { useSettingsStore } from '@/stores/settings-store'
import { chatCompletion } from '@/services/api/openrouter-api'
import type { GameplayTopic } from '@/models/types'
import { SearchRegion } from '@/models/enums'
import { generateId } from '@/utils'
import { parseJsonArray, safeParseJsonArray } from '@/utils/json-parser'
import { useResolvedModel } from '@/composables/use-resolved-model'

const SEARCH_PROMPT_DOMESTIC = `你是一位资深国内手游市场分析师，精通国内买量创意趋势。

请搜索当前**国内市场**最新、最热门的**游戏创意玩法**，聚焦于抖音、快手、B站等平台买量素材中高转化的玩法机制。

要求：
- 聚焦具体的玩法机制（如：割草幸存者、弹球连锁、祖玛打龙、合成进化等），而非笼统的"休闲游戏"
- 这些玩法是当下国内买量素材中真正跑量、高转化、高吸量的方向
- 按热度从高到低排列
- 关注抖音/快手/B站等国内主流平台的投放趋势
- 每个玩法给出代表游戏和创新亮点

返回纯 JSON 数组（8~12个），每个元素：
- name: 玩法名（2~6字，如"割草幸存者""弹球连锁"）
- desc: 为什么这个玩法火/吸量的核心原因（1~2句话）
- source: 代表游戏/来源（如"弓箭传说""咸鱼之王"）
- heat: 热度（"极高""高""中"）
- hooks: 该玩法下 3~5 个被验证有效的视觉钩子

只输出纯 JSON，不要任何其他说明文字。格式示例：
[{"name":"割草幸存者","desc":"满屏清怪的视觉爽感+roguelike成长，留存数据极佳","source":"弓箭传说","heat":"极高","hooks":["满屏怪物被一次清空","从1级到999级的极速成长","Boss战最后一击的慢镜头"]}]`

const SEARCH_PROMPT_OVERSEAS = `You are a senior global mobile game market analyst, specializing in overseas UA creative trends.

请搜索当前**海外市场**最新、最热门的**游戏创意玩法**，聚焦于 TikTok、AppLovin、Unity Ads、Meta Ads 等海外买量渠道中高转化的玩法机制。

要求：
- 聚焦具体的玩法机制（如：Merge、Idle Tycoon、Match-3D、Tower Defense 等），而非笼统的"casual game"
- 这些玩法是当下海外买量素材中真正跑量、高 IPM、高 ROAS 的方向
- 按热度从高到低排列
- 关注 TikTok/Meta/AppLovin 等海外主流渠道的投放趋势
- 每个玩法给出代表游戏和创新亮点

返回纯 JSON 数组（8~12个），每个元素：
- name: 玩法名（2~6字，可中文或英文，如"Merge合成""Idle放置"）
- desc: 为什么这个玩法火/吸量的核心原因（1~2句话）
- source: 代表游戏/来源（如"Survivor.io""Royal Match"）
- heat: 热度（"极高""高""中"）
- hooks: 该玩法下 3~5 个被验证有效的视觉钩子

只输出纯 JSON，不要任何其他说明文字。格式示例：
[{"name":"Merge合成","desc":"拖拽合成的解压感+收集驱动，CPI极低且LTV稳定","source":"Merge Mansion","heat":"极高","hooks":["两个低级物品合成闪光高级物品","仓库从杂乱到整齐的延时对比","稀有道具合成时的金光特效"]}]`

const SEARCH_PROMPTS: Record<SearchRegion, string> = {
  [SearchRegion.Domestic]: SEARCH_PROMPT_DOMESTIC,
  [SearchRegion.Overseas]: SEARCH_PROMPT_OVERSEAS,
}

function parseToGameplayTopics(raw: unknown): GameplayTopic[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const o = item as Record<string, unknown>
    return {
      id: (o.id as string) ?? generateId(),
      name: String(o.name ?? ''),
      desc: String(o.desc ?? ''),
      source: String(o.source ?? ''),
      heat: String(o.heat ?? ''),
      hooks: Array.isArray(o.hooks) ? o.hooks.map(String) : [],
      selected: false,
    }
  })
}

export function useGameplaySearch() {
  const gameplayRadarStore = useGameplayRadarStore()
  const settingsStore = useSettingsStore()
  const { withFallback } = useResolvedModel()

  const isSearching = computed(() => unref(gameplayRadarStore.searching))

  async function searchHotGameplays(): Promise<void> {
    const config = unref(settingsStore.config)
    if (!settingsStore.hasApiKey) {
      throw new Error('请先配置 API Key')
    }

    const region = gameplayRadarStore.region
    const prompt = SEARCH_PROMPTS[region]

    gameplayRadarStore.setSearching(true)
    try {
      const response = await chatCompletion({
        config,
        ...withFallback('search'),
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      })

      const parsed = parseJsonArray(response)
      const topics = parseToGameplayTopics(parsed)
      gameplayRadarStore.setSearchResults(region, topics)
    } finally {
      gameplayRadarStore.setSearching(false)
    }
  }

  function getPromptForManualMode(): string {
    return SEARCH_PROMPTS[gameplayRadarStore.region]
  }

  function importManualResult(text: string): GameplayTopic[] {
    const parsed = safeParseJsonArray(text)
    if (!parsed.length) return []
    const topics = parseToGameplayTopics(parsed)
    gameplayRadarStore.setSearchResults(gameplayRadarStore.region, topics)
    return topics
  }

  return {
    searchHotGameplays,
    getPromptForManualMode,
    importManualResult,
    isSearching,
  }
}

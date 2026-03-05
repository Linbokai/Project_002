<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, Info } from 'lucide-vue-next'
import BaseButton from '@/components/ui/base-button.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import BaseBadge from '@/components/ui/base-badge.vue'
import ChipSelect from '@/components/ui/chip-select.vue'
import PlatformSelector from '@/components/business/theme-radar/platform-selector.vue'
import ThemeSearch from '@/components/business/theme-radar/theme-search.vue'
import PresetThemes from '@/components/business/theme-radar/preset-themes.vue'
import AddThemeForm from '@/components/business/theme-radar/add-theme-form.vue'
import ThemeCard from '@/components/business/theme-radar/theme-card.vue'
import GameplaySearch from '@/components/business/gameplay-radar/gameplay-search.vue'
import GameplayPresets from '@/components/business/gameplay-radar/gameplay-presets.vue'
import AddGameplayForm from '@/components/business/gameplay-radar/add-gameplay-form.vue'
import GameplayCard from '@/components/business/gameplay-radar/gameplay-card.vue'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { ProductionDirection, UeContentType, ScriptType, ScriptCategory, AudienceType, AspectRatio } from '@/models/enums'
import { SCRIPT_TYPES, SCRIPT_CATEGORIES } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { SELL_TAG_GROUPS } from '@/constants/sell-tags'

defineProps<{
  collapsed?: boolean
}>()

const configStore = useConfigStore()
const gameStore = useGameStore()
const themeRadarStore = useThemeRadarStore()
const gameplayRadarStore = useGameplayRadarStore()

const isUeDirection = computed(() => configStore.config.direction === ProductionDirection.UeGameplay)

const gameOptions = computed(() => {
  const list = gameStore.games.map((g) => ({ value: g.id, label: g.name }))
  if (!list.length) return [{ value: '', label: '未选择游戏' }]
  return list
})

const SCRIPT_2D_TYPES = [
  ScriptType.VoGuide, ScriptType.VoIntro, ScriptType.VoBenefit,
  ScriptType.ShowcaseCharacter, ScriptType.ShowcaseMap,
  ScriptType.CgStory, ScriptType.Skit,
  ScriptType.Hook5s,
]
const UE_TYPES = [
  ScriptType.UeShowcasePV, ScriptType.UeShowcaseMapRun,
  ScriptType.UeShowcaseCharacter, ScriptType.UeGameplayScript,
]

const scriptTypeOptions = computed(() => {
  const allowedIds = isUeDirection.value ? UE_TYPES : SCRIPT_2D_TYPES
  return SCRIPT_TYPES
    .filter((s) => allowedIds.includes(s.id))
    .map((s) => ({ value: s.id, label: s.name, description: s.description }))
})

const categoryOptions = SCRIPT_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.name,
  description: c.description,
}))

const activeCategory = computed(() => {
  const current = SCRIPT_TYPES.find((t) => t.id === configStore.config.scriptType)
  return current?.category ?? ScriptCategory.Voiceover
})

const filteredTypeOptions = computed(() =>
  SCRIPT_TYPES
    .filter((s) => s.category === activeCategory.value && SCRIPT_2D_TYPES.includes(s.id))
    .map((s) => ({ value: s.id, label: s.name, description: s.description })),
)

function onCategoryChange(catId: string) {
  const firstType = SCRIPT_TYPES.find(
    (s) => s.category === catId && SCRIPT_2D_TYPES.includes(s.id),
  )
  if (firstType) {
    configStore.updateConfig({ scriptType: firstType.id })
  }
}

const audienceOptions = AUDIENCE_PROFILES.map((p) => ({
  value: p.id,
  label: p.label,
  description: p.description,
}))

const radarTab = ref<'search' | 'preset' | 'custom'>('preset')

const radarSelectedCount = computed(() =>
  isUeDirection.value ? gameplayRadarStore.totalSelected : themeRadarStore.totalSelected,
)

const sectionOpen = ref({
  basic: true,
  radar: true,
  sellTags: false,
  advanced: false,
})

function toggleSection(key: keyof typeof sectionOpen.value) {
  sectionOpen.value[key] = !sectionOpen.value[key]
}

function switchDirection(dir: ProductionDirection) {
  const defaultScriptType = dir === ProductionDirection.UeGameplay
    ? ScriptType.UeGameplayScript
    : ScriptType.VoGuide
  configStore.updateConfig({ direction: dir, scriptType: defaultScriptType })
}

const aspectRatioItems: { value: AspectRatio; label: string }[] = [
  { value: AspectRatio.Portrait, label: '9:16' },
  { value: AspectRatio.Landscape, label: '16:9' },
  { value: AspectRatio.Square, label: '1:1' },
]

const durationItems = [5, 10, 15, 30, 60]

const sellTagCount = computed(() => configStore.config.selectedSellTags.length)
</script>

<template>
  <aside
    class="flex h-full shrink-0 flex-col border-r bg-card overflow-hidden transition-[width,border-color] duration-300"
    :class="collapsed ? 'border-transparent' : 'border-border'"
    :style="{ width: collapsed ? '0px' : 'clamp(300px, 28vw, 480px)' }"
  >
    <div class="flex-1 overflow-y-auto">

      <!-- ==================== Section 1: Basic Config ==================== -->
      <div class="border-b border-border">
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          @click="toggleSection('basic')"
        >
          <ChevronDown
            :size="16"
            class="shrink-0 text-muted-foreground transition-transform"
            :class="{ '-rotate-90': !sectionOpen.basic }"
          />
          <span class="text-sm font-semibold">基础配置</span>
        </button>

        <div v-show="sectionOpen.basic" class="flex flex-col gap-4 px-4 pb-4">
          <!-- Direction -->
          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-1 text-xs font-medium">
              制作方向
              <span class="group relative">
                <Info :size="12" class="text-muted-foreground/60" />
                <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">决定脚本的整体制作形式</span>
              </span>
            </label>
            <div class="flex gap-2">
              <div class="flex flex-1 flex-col gap-1">
                <BaseButton
                  :variant="!isUeDirection ? 'brand' : 'outline'"
                  size="sm"
                  class="w-full"
                  @click="switchDirection(ProductionDirection.Script2D)"
                >
                  2D视频脚本
                </BaseButton>
                <span class="text-center text-[11px] text-muted-foreground">真人实拍/录屏类视频</span>
              </div>
              <div class="flex flex-1 flex-col gap-1">
                <BaseButton
                  :variant="isUeDirection ? 'brand' : 'outline'"
                  size="sm"
                  class="w-full"
                  @click="switchDirection(ProductionDirection.UeGameplay)"
                >
                  3D/UE创意玩法
                </BaseButton>
                <span class="text-center text-[11px] text-muted-foreground">虚幻引擎3D画面视频</span>
              </div>
            </div>
          </div>

          <!-- Game -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium">游戏选择</label>
            <BaseSelect
              :model-value="configStore.config.gameId"
              :options="gameOptions"
              placeholder="选择游戏"
              @update:model-value="(v) => configStore.updateConfig({ gameId: v })"
            />
          </div>

          <!-- UE Content Type -->
          <div v-if="isUeDirection" class="flex flex-col gap-1.5">
            <label class="text-xs font-medium">素材类型</label>
            <div class="flex gap-2">
              <BaseButton
                :variant="configStore.config.ueContentType === UeContentType.Gameplay ? 'brand' : 'outline'"
                size="sm"
                class="flex-1"
                @click="configStore.updateConfig({ ueContentType: UeContentType.Gameplay, scriptType: ScriptType.UeGameplayScript })"
              >
                创意玩法
              </BaseButton>
              <BaseButton
                :variant="configStore.config.ueContentType === UeContentType.Showcase ? 'brand' : 'outline'"
                size="sm"
                class="flex-1"
                @click="configStore.updateConfig({ ueContentType: UeContentType.Showcase, scriptType: ScriptType.UeShowcasePV })"
              >
                展示类
              </BaseButton>
            </div>
          </div>

          <!-- Duration -->
          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-1 text-xs font-medium">
              视频时长
              <span class="group relative">
                <Info :size="12" class="text-muted-foreground/60" />
                <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">影响节奏模板和分镜数量</span>
              </span>
            </label>
            <div class="flex flex-wrap gap-1.5">
              <div v-for="d in durationItems" :key="d">
                <BaseButton
                  :variant="configStore.config.duration === d ? 'brand' : 'outline'"
                  size="sm"
                  class="min-w-[40px]"
                  @click="configStore.updateConfig({ duration: d })"
                >
                  {{ d }}s
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Aspect Ratio -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium">画面比例</label>
            <div class="flex flex-wrap gap-1.5">
              <BaseButton
                v-for="ar in aspectRatioItems"
                :key="ar.value"
                :variant="configStore.config.aspectRatio === ar.value ? 'brand' : 'outline'"
                size="sm"
                @click="configStore.updateConfig({ aspectRatio: ar.value })"
              >
                {{ ar.label }}
              </BaseButton>
            </div>
          </div>

          <!-- Script Type: 2D two-level / UE flat -->
          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-1 text-xs font-medium">
              脚本类型
              <span class="group relative">
                <Info :size="12" class="text-muted-foreground/60" />
                <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">决定脚本风格和叙事结构</span>
              </span>
            </label>
            <template v-if="!isUeDirection">
              <BaseSelect
                :model-value="activeCategory"
                :options="categoryOptions"
                placeholder="选择脚本大类"
                @update:model-value="onCategoryChange"
              />
              <BaseSelect
                :model-value="configStore.config.scriptType"
                :options="filteredTypeOptions"
                placeholder="选择具体类型"
                @update:model-value="(v) => configStore.updateConfig({ scriptType: v as ScriptType })"
              />
            </template>
            <BaseSelect
              v-else
              :model-value="configStore.config.scriptType"
              :options="scriptTypeOptions"
              placeholder="选择脚本类型"
              @update:model-value="(v) => configStore.updateConfig({ scriptType: v as ScriptType })"
            />
          </div>

          <!-- Audience -->
          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-1 text-xs font-medium">
              目标受众
              <span class="group relative">
                <Info :size="12" class="text-muted-foreground/60" />
                <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">影响用词风格和内容偏好</span>
              </span>
            </label>
            <BaseSelect
              :model-value="configStore.config.audience"
              :options="audienceOptions"
              placeholder="选择目标用户"
              @update:model-value="(v) => configStore.updateConfig({ audience: v as AudienceType })"
            />
            <BaseInput
              v-if="configStore.config.audience === AudienceType.Custom"
              :model-value="configStore.config.customAudience"
              placeholder="请输入自定义目标画像"
              @update:model-value="(v) => configStore.updateConfig({ customAudience: v })"
            />
          </div>
        </div>
      </div>

      <!-- ==================== Section 2: Theme / Gameplay Radar ==================== -->
      <div class="border-b border-border">
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          @click="toggleSection('radar')"
        >
          <ChevronDown
            :size="16"
            class="shrink-0 text-muted-foreground transition-transform"
            :class="{ '-rotate-90': !sectionOpen.radar }"
          />
          <span class="text-sm font-semibold">
            {{ isUeDirection ? '吸量玩法' : '吸量主题' }}
          </span>
          <BaseBadge v-if="radarSelectedCount > 0" variant="brand" class="ml-auto">
            已选 {{ radarSelectedCount }}
          </BaseBadge>
        </button>

        <div v-show="sectionOpen.radar" class="flex flex-col gap-3 px-4 pb-4">
          <p class="text-[11px] text-muted-foreground">
            选择 1-3 个热门{{ isUeDirection ? '玩法' : '主题' }}，AI 会围绕这些{{ isUeDirection ? '玩法' : '主题' }}写脚本
          </p>

          <!-- Radar Tabs -->
          <div class="flex rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              v-for="tab in ([
                { value: 'search', label: '搜索' },
                { value: 'preset', label: '预设' },
                { value: 'custom', label: '自定义' },
              ] as const)"
              :key="tab.value"
              type="button"
              class="flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                radarTab === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="radarTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Radar Content -->
          <div class="flex flex-col gap-3">
            <!-- Search Tab -->
            <template v-if="radarTab === 'search'">
              <template v-if="!isUeDirection">
                <PlatformSelector />
                <ThemeSearch />
                <div v-if="themeRadarStore.searchResults.length" class="space-y-2">
                  <h4 class="text-xs font-medium text-muted-foreground">搜索结果</h4>
                  <div class="grid gap-2">
                    <ThemeCard
                      v-for="item in themeRadarStore.searchResults"
                      :key="item.id"
                      :theme="item"
                      :selected="item.selected"
                      @toggle="themeRadarStore.toggleSearchResult(item.id)"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <GameplaySearch />
                <div v-if="gameplayRadarStore.currentRegionResults.length" class="space-y-2">
                  <h4 class="text-xs font-medium text-muted-foreground">搜索结果</h4>
                  <div class="grid gap-2">
                    <GameplayCard
                      v-for="item in gameplayRadarStore.currentRegionResults"
                      :key="item.id"
                      :gameplay="item"
                      :selected="item.selected"
                      @toggle="gameplayRadarStore.toggleSearchResult(item.id)"
                    />
                  </div>
                </div>
              </template>
            </template>

            <!-- Preset Tab -->
            <template v-if="radarTab === 'preset'">
              <template v-if="!isUeDirection">
                <PresetThemes tier="T1" />
                <PresetThemes tier="T2" />
                <PresetThemes tier="T3" />
              </template>
              <template v-else>
                <GameplayPresets tier="T1" />
                <GameplayPresets tier="T2" />
                <GameplayPresets tier="T3" />
              </template>
            </template>

            <!-- Custom Tab -->
            <template v-if="radarTab === 'custom'">
              <template v-if="!isUeDirection">
                <AddThemeForm />
                <div v-if="themeRadarStore.customThemes.length" class="space-y-2">
                  <h4 class="text-xs font-medium text-muted-foreground">已添加</h4>
                  <div class="grid gap-2">
                    <ThemeCard
                      v-for="item in themeRadarStore.customThemes"
                      :key="item.id"
                      :theme="item"
                      :selected="item.selected"
                      @toggle="themeRadarStore.toggleCustomTheme(item.id)"
                    />
                  </div>
                </div>
              </template>
              <template v-else>
                <AddGameplayForm />
                <div v-if="gameplayRadarStore.customGameplays.length" class="space-y-2">
                  <h4 class="text-xs font-medium text-muted-foreground">已添加</h4>
                  <div class="grid gap-2">
                    <GameplayCard
                      v-for="item in gameplayRadarStore.customGameplays"
                      :key="item.id"
                      :gameplay="item"
                      :selected="item.selected"
                      @toggle="gameplayRadarStore.toggleCustomGameplay(item.id)"
                    />
                  </div>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- ==================== Section 3: Sell Tags (promoted) ==================== -->
      <div class="border-b border-border">
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          @click="toggleSection('sellTags')"
        >
          <ChevronDown
            :size="16"
            class="shrink-0 text-muted-foreground transition-transform"
            :class="{ '-rotate-90': !sectionOpen.sellTags }"
          />
          <span class="text-sm font-semibold">卖点标签</span>
          <span class="group relative ml-0.5">
            <Info :size="12" class="text-muted-foreground/60" />
            <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">选择游戏的核心卖点，让脚本差异化更强</span>
          </span>
          <BaseBadge v-if="sellTagCount > 0" variant="brand" class="ml-auto">
            已选 {{ sellTagCount }}
          </BaseBadge>
        </button>

        <div v-show="sectionOpen.sellTags" class="flex flex-col gap-3 px-4 pb-4">
          <div
            v-for="group in SELL_TAG_GROUPS"
            :key="group.id"
            class="flex flex-col gap-1.5"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-medium">{{ group.name }}</span>
              <BaseBadge :class="group.colorClass" class="text-[10px]">{{ group.position }}</BaseBadge>
            </div>
            <ChipSelect
              :model-value="configStore.config.selectedSellTags"
              :options="group.tags"
              @update:model-value="(val) => configStore.updateConfig({ selectedSellTags: val })"
            />
          </div>
        </div>
      </div>

      <!-- ==================== Section 4: Advanced Settings ==================== -->
      <div>
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50"
          @click="toggleSection('advanced')"
        >
          <ChevronDown
            :size="16"
            class="shrink-0 text-muted-foreground transition-transform"
            :class="{ '-rotate-90': !sectionOpen.advanced }"
          />
          <span class="text-sm font-semibold">高级参数</span>
        </button>

        <div v-show="sectionOpen.advanced" class="flex flex-col gap-4 px-4 pb-4">
          <!-- Hero -->
          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-1 text-xs font-medium">
              主角人设
              <span class="group relative">
                <Info :size="12" class="text-muted-foreground/60" />
                <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">设定脚本中的出镜人物形象</span>
              </span>
            </label>
            <div class="flex flex-wrap gap-1.5">
              <BaseButton
                :variant="configStore.config.hero.mode === 'game' ? 'brand' : 'outline'"
                size="sm"
                @click="configStore.updateConfig({ hero: { ...configStore.config.hero, mode: 'game' } })"
              >
                游戏角色
              </BaseButton>
              <BaseButton
                :variant="configStore.config.hero.mode === 'trending' ? 'brand' : 'outline'"
                size="sm"
                @click="configStore.updateConfig({ hero: { ...configStore.config.hero, mode: 'trending' } })"
              >
                热梗人物
              </BaseButton>
              <BaseButton
                :variant="configStore.config.hero.mode === 'custom' ? 'brand' : 'outline'"
                size="sm"
                @click="configStore.updateConfig({ hero: { ...configStore.config.hero, mode: 'custom' } })"
              >
                自定义
              </BaseButton>
            </div>
            <BaseInput
              :model-value="configStore.config.hero.value"
              placeholder="人设描述"
              @update:model-value="(v) => configStore.updateConfig({ hero: { ...configStore.config.hero, value: v } })"
            />
          </div>

          <!-- Collab IP -->
          <div class="flex flex-col gap-1.5">
            <label class="flex items-center gap-1 text-xs font-medium">
              联动IP
              <span class="group relative">
                <Info :size="12" class="text-muted-foreground/60" />
                <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">添加联动 IP 信息融入脚本</span>
              </span>
            </label>
            <label class="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                :checked="configStore.config.collabIP.enabled"
                class="h-4 w-4 rounded border-input"
                @change="
                  configStore.updateConfig({
                    collabIP: {
                      ...configStore.config.collabIP,
                      enabled: !configStore.config.collabIP.enabled,
                    },
                  })
                "
              />
              <span class="text-xs">启用联动IP</span>
            </label>
            <template v-if="configStore.config.collabIP.enabled">
              <BaseInput
                :model-value="configStore.config.collabIP.name"
                placeholder="IP 名称"
                @update:model-value="
                  (v) =>
                    configStore.updateConfig({
                      collabIP: { ...configStore.config.collabIP, name: v },
                    })
                "
              />
              <BaseTextarea
                :model-value="configStore.config.collabIP.info"
                placeholder="IP 信息 / 联动说明"
                :rows="2"
                @update:model-value="
                  (v) =>
                    configStore.updateConfig({
                      collabIP: { ...configStore.config.collabIP, info: v },
                    })
                "
              />
            </template>
          </div>
        </div>
      </div>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import BaseTabs from '@/components/ui/base-tabs.vue'
import BaseBadge from '@/components/ui/base-badge.vue'
import ChipSelect from '@/components/ui/chip-select.vue'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { VideoDuration, AspectRatio, ScriptType, AudienceType, ProductionDirection, UeContentType } from '@/models/enums'
import { SCRIPT_TYPES } from '@/constants/script-types'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'
import { SELL_TAG_GROUPS } from '@/constants/sell-tags'

const SCRIPT_2D_TYPES = [
  ScriptType.VoGuide, ScriptType.VoIntro, ScriptType.VoBenefit,
  ScriptType.Showcase, ScriptType.CgStory, ScriptType.Hook5s, ScriptType.Skit,
]
const UE_TYPES = [
  ScriptType.UeShowcasePV, ScriptType.UeShowcaseMapRun,
  ScriptType.UeShowcaseCharacter, ScriptType.UeGameplayScript,
]

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const configStore = useConfigStore()
const gameStore = useGameStore()

const activeTab = ref('basic')

const isUeDirection = computed(() => configStore.config.direction === ProductionDirection.UeGameplay)

const tabs = [
  { value: 'basic', label: '基础配置' },
  { value: 'audience', label: '人设与画像' },
  { value: 'selltags', label: '卖点标签' },
]

const gameOptions = computed(() => {
  const list = gameStore.games.map((g) => ({ value: g.id, label: g.name }))
  if (!list.length) return [{ value: '', label: '未选择' }]
  return list
})

const audienceOptions = AUDIENCE_PROFILES.map((p) => ({ value: p.id, label: p.label }))

const scriptTypeOptions = computed(() => {
  const allowedIds = isUeDirection.value ? UE_TYPES : SCRIPT_2D_TYPES
  return SCRIPT_TYPES
    .filter((s) => allowedIds.includes(s.id))
    .map((s) => ({ value: s.id, label: s.name }))
})

const selectedTagCount = computed(() => configStore.config.selectedSellTags.length)

function switchDirection(dir: ProductionDirection) {
  const defaultScriptType = dir === ProductionDirection.UeGameplay
    ? ScriptType.UeGameplayScript
    : ScriptType.VoGuide
  configStore.updateConfig({ direction: dir, scriptType: defaultScriptType })
}

function handleReset() {
  configStore.resetConfig()
}

function handleDone() {
  emit('close')
}
</script>

<template>
  <BaseDialog :open="open" size="lg" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">参数配置</h2>
    </template>

    <div class="flex flex-col gap-4">
      <!-- 制作方向切换 -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">制作方向</label>
        <div class="flex gap-2">
          <BaseButton
            :variant="!isUeDirection ? 'brand' : 'outline'"
            size="sm"
            @click="switchDirection(ProductionDirection.Script2D)"
          >
            2D视频脚本
          </BaseButton>
          <BaseButton
            :variant="isUeDirection ? 'brand' : 'outline'"
            size="sm"
            @click="switchDirection(ProductionDirection.UeGameplay)"
          >
            3D/UE创意玩法
          </BaseButton>
        </div>
      </div>

      <BaseTabs v-model="activeTab" :tabs="tabs" />

      <!-- Tab 1: 基础配置 -->
      <div v-show="activeTab === 'basic'" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">游戏选择</label>
          <BaseSelect
            :model-value="configStore.config.gameId"
            :options="gameOptions"
            placeholder="选择游戏"
            @update:model-value="(v) => configStore.updateConfig({ gameId: v })"
          />
        </div>

        <!-- UE 素材类型 -->
        <div v-if="isUeDirection" class="flex flex-col gap-2">
          <label class="text-sm font-medium">素材类型</label>
          <div class="flex gap-2">
            <BaseButton
              :variant="configStore.config.ueContentType === UeContentType.Gameplay ? 'brand' : 'outline'"
              size="sm"
              @click="configStore.updateConfig({ ueContentType: UeContentType.Gameplay, scriptType: ScriptType.UeGameplayScript })"
            >
              创意玩法
            </BaseButton>
            <BaseButton
              :variant="configStore.config.ueContentType === UeContentType.Showcase ? 'brand' : 'outline'"
              size="sm"
              @click="configStore.updateConfig({ ueContentType: UeContentType.Showcase, scriptType: ScriptType.UeShowcasePV })"
            >
              展示类
            </BaseButton>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">视频时长</label>
          <div class="flex flex-wrap gap-2">
            <BaseButton
              v-for="d in [5, 10, 15, 30, 60]"
              :key="d"
              :variant="configStore.config.duration === d ? 'brand' : 'outline'"
              size="sm"
              @click="configStore.updateConfig({ duration: d })"
            >
              {{ d }}s
            </BaseButton>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">画面比例</label>
          <div class="flex flex-wrap gap-2">
            <BaseButton
              v-for="ratio in ['9:16', '16:9', '1:1']"
              :key="ratio"
              :variant="configStore.config.aspectRatio === ratio ? 'brand' : 'outline'"
              size="sm"
              @click="configStore.updateConfig({ aspectRatio: ratio })"
            >
              {{ ratio }}
            </BaseButton>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">脚本类型</label>
          <BaseSelect
            :model-value="configStore.config.scriptType"
            :options="scriptTypeOptions"
            placeholder="选择脚本类型"
            @update:model-value="(v) => configStore.updateConfig({ scriptType: v })"
          />
        </div>
      </div>

      <!-- Tab 2: 人设与画像 -->
      <div v-show="activeTab === 'audience'" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">目标用户</label>
          <BaseSelect
            :model-value="configStore.config.audience"
            :options="audienceOptions"
            placeholder="选择目标用户"
            @update:model-value="(v) => configStore.updateConfig({ audience: v })"
          />
          <BaseInput
            v-if="configStore.config.audience === AudienceType.Custom"
            :model-value="configStore.config.customAudience"
            placeholder="请输入自定义目标画像"
            @update:model-value="(v) => configStore.updateConfig({ customAudience: v })"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">主角人设</label>
          <div class="flex flex-wrap gap-2">
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
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">联动IP</label>
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
            <span class="text-sm">启用联动IP</span>
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

      <!-- Tab 3: 卖点标签 -->
      <div v-show="activeTab === 'selltags'" class="flex flex-col gap-4">
        <div v-if="selectedTagCount > 0" class="text-sm text-muted-foreground">
          已选 {{ selectedTagCount }} 个卖点标签
        </div>
        <div
          v-for="group in SELL_TAG_GROUPS"
          :key="group.id"
          class="flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ group.name }}</span>
            <BaseBadge :class="group.colorClass">{{ group.position }}</BaseBadge>
          </div>
          <ChipSelect
            :model-value="configStore.config.selectedSellTags"
            :options="group.tags"
            @update:model-value="(val) => configStore.updateConfig({ selectedSellTags: val })"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="handleReset">重置</BaseButton>
      <BaseButton variant="brand" @click="handleDone">完成</BaseButton>
    </template>
  </BaseDialog>
</template>

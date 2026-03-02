<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseTabs from '@/components/ui/base-tabs.vue'
import ConfigBasicTab from './config-basic-tab.vue'
import ConfigAudienceTab from './config-audience-tab.vue'
import ConfigSelltagsTab from './config-selltags-tab.vue'
import { useConfigStore } from '@/stores/config-store'
import { ScriptType, ProductionDirection } from '@/models/enums'
import { SCRIPT_TYPES } from '@/constants/script-types'

const SCRIPT_2D_TYPES = [
  ScriptType.VoGuide, ScriptType.VoIntro, ScriptType.VoBenefit,
  ScriptType.Showcase, ScriptType.CgStory, ScriptType.Hook5s, ScriptType.Skit,
]
const UE_TYPES = [
  ScriptType.UeShowcasePV, ScriptType.UeShowcaseMapRun,
  ScriptType.UeShowcaseCharacter, ScriptType.UeGameplayScript,
]

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const configStore = useConfigStore()
const activeTab = ref('basic')

const isUeDirection = computed(() => configStore.config.direction === ProductionDirection.UeGameplay)

const tabs = [
  { value: 'basic', label: '基础配置' },
  { value: 'audience', label: '人设与画像' },
  { value: 'selltags', label: '卖点标签' },
]

const scriptTypeOptions = computed(() => {
  const allowedIds = isUeDirection.value ? UE_TYPES : SCRIPT_2D_TYPES
  return SCRIPT_TYPES
    .filter((s) => allowedIds.includes(s.id))
    .map((s) => ({ value: s.id, label: s.name }))
})

function switchDirection(dir: ProductionDirection) {
  const defaultScriptType = dir === ProductionDirection.UeGameplay
    ? ScriptType.UeGameplayScript
    : ScriptType.VoGuide
  configStore.updateConfig({ direction: dir, scriptType: defaultScriptType })
}
</script>

<template>
  <BaseDialog :open="open" size="lg" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">参数配置</h2>
    </template>

    <div class="flex flex-col gap-4">
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

      <ConfigBasicTab
        v-show="activeTab === 'basic'"
        :is-ue-direction="isUeDirection"
        :script-type-options="scriptTypeOptions"
      />
      <ConfigAudienceTab v-show="activeTab === 'audience'" />
      <ConfigSelltagsTab v-show="activeTab === 'selltags'" />
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="configStore.resetConfig()">重置</BaseButton>
      <BaseButton variant="brand" @click="emit('close')">完成</BaseButton>
    </template>
  </BaseDialog>
</template>

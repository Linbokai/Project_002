<script setup lang="ts">
import BaseButton from '@/components/ui/base-button.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import { useConfigStore } from '@/stores/config-store'
import { useGameStore } from '@/stores/game-store'
import { ScriptType, UeContentType } from '@/models/enums'
import { computed } from 'vue'

const props = defineProps<{
  isUeDirection: boolean
  scriptTypeOptions: Array<{ value: string; label: string }>
}>()

const configStore = useConfigStore()
const gameStore = useGameStore()

const gameOptions = computed(() => {
  const list = gameStore.games.map((g) => ({ value: g.id, label: g.name }))
  if (!list.length) return [{ value: '', label: '未选择' }]
  return list
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium">游戏选择</label>
      <BaseSelect
        :model-value="configStore.config.gameId"
        :options="gameOptions"
        placeholder="选择游戏"
        @update:model-value="(v) => configStore.updateConfig({ gameId: v })"
      />
    </div>

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
</template>

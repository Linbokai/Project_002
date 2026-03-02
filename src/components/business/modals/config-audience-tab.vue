<script setup lang="ts">
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import { useConfigStore } from '@/stores/config-store'
import { AudienceType } from '@/models/enums'
import { AUDIENCE_PROFILES } from '@/constants/audience-profiles'

const configStore = useConfigStore()

const audienceOptions = AUDIENCE_PROFILES.map((p) => ({ value: p.id, label: p.label }))
</script>

<template>
  <div class="flex flex-col gap-4">
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
</template>

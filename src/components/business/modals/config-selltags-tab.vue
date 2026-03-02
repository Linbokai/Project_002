<script setup lang="ts">
import BaseBadge from '@/components/ui/base-badge.vue'
import ChipSelect from '@/components/ui/chip-select.vue'
import { useConfigStore } from '@/stores/config-store'
import { SELL_TAG_GROUPS } from '@/constants/sell-tags'
import { computed } from 'vue'

const configStore = useConfigStore()

const selectedTagCount = computed(() => configStore.config.selectedSellTags.length)
</script>

<template>
  <div class="flex flex-col gap-4">
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
</template>

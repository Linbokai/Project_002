<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config-store'
import { UE_GAMEPLAY_PRESETS } from '@/constants/ue-gameplay-presets'
import GameplayCard from './gameplay-card.vue'

const props = defineProps<{
  tier: 'T1' | 'T2' | 'T3'
}>()

const configStore = useConfigStore()

const filteredGameplays = computed(() =>
  UE_GAMEPLAY_PRESETS.filter((g) => g.tier === props.tier),
)

const tierLabels: Record<string, string> = {
  T1: 'T1 爆热',
  T2: 'T2 中热',
  T3: 'T3 常青',
}

function isSelected(id: string) {
  return configStore.config.selectedGameplays.includes(id)
}

function toggleGameplay(id: string) {
  configStore.toggleGameplay(id)
}
</script>

<template>
  <div class="space-y-3">
    <h3 class="text-sm font-medium text-muted-foreground">
      {{ tierLabels[tier] }}
    </h3>
    <div class="grid gap-2">
      <GameplayCard
        v-for="gp in filteredGameplays"
        :key="gp.id"
        :gameplay="gp"
        :selected="isSelected(gp.id)"
        @toggle="toggleGameplay(gp.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useConfigStore } from '@/stores/config-store'
import { UE_GAMEPLAY_PRESETS } from '@/constants/ue-gameplay-presets'

const props = defineProps<{
  tier: 'T1' | 'T2' | 'T3'
}>()

const configStore = useConfigStore()

const expanded = ref(props.tier === 'T1')

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
  <div>
    <button
      type="button"
      class="flex w-full items-center gap-1.5 py-1 text-left"
      @click="expanded = !expanded"
    >
      <ChevronDown
        :size="14"
        class="shrink-0 text-muted-foreground transition-transform"
        :class="{ '-rotate-90': !expanded }"
      />
      <span class="text-xs font-medium text-muted-foreground">
        {{ tierLabels[tier] }}
      </span>
      <span class="text-[10px] text-muted-foreground/60">
        ({{ filteredGameplays.length }})
      </span>
    </button>
    <div v-show="expanded" class="mt-1.5 flex flex-wrap gap-1.5">
      <span
        v-for="gp in filteredGameplays"
        :key="gp.id"
        class="preset-chip group relative"
      >
        <button
          type="button"
          :class="[
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isSelected(gp.id)
              ? 'border border-brand/30 bg-brand/10 text-brand'
              : 'border border-transparent bg-secondary text-secondary-foreground hover:border-border',
          ]"
          @click="toggleGameplay(gp.id)"
        >
          {{ gp.name }}
        </button>
        <div class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg opacity-0 transition-opacity group-hover:opacity-100 w-52">
          <p class="font-medium text-popover-foreground">{{ gp.name }}</p>
          <p class="mt-1 text-muted-foreground">{{ gp.description }}</p>
          <p v-if="gp.coreLoop" class="mt-1.5 text-muted-foreground">
            <span class="font-medium text-popover-foreground">核心循环：</span>{{ gp.coreLoop }}
          </p>
          <p v-if="gp.visualHook" class="mt-1 text-muted-foreground">
            <span class="font-medium text-popover-foreground">视觉钩子：</span>{{ gp.visualHook }}
          </p>
        </div>
      </span>
    </div>
  </div>
</template>

<style scoped>
.preset-chip:hover {
  z-index: 10;
}
</style>

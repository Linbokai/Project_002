<script setup lang="ts">
import { ref } from 'vue'
import { CheckSquare, Square, ChevronDown } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/base-badge.vue'
import type { GameplayPreset, GameplayTopic, CustomGameplay } from '@/models/types'

const props = withDefaults(
  defineProps<{
    gameplay: GameplayPreset | GameplayTopic | CustomGameplay
    selected?: boolean
  }>(),
  { selected: false }
)

const emit = defineEmits<{
  toggle: []
}>()

const expanded = ref(false)

function isGameplayTopic(g: GameplayPreset | GameplayTopic | CustomGameplay): g is GameplayTopic {
  return 'hooks' in g && 'source' in g
}

function isGameplayPreset(g: GameplayPreset | GameplayTopic | CustomGameplay): g is GameplayPreset {
  return 'tier' in g && 'coreLoop' in g
}

function hasDetails(): boolean {
  if (isGameplayTopic(props.gameplay)) {
    return (props.gameplay.hooks?.length ?? 0) > 0
  }
  if (isGameplayPreset(props.gameplay)) {
    return !!props.gameplay.coreLoop || !!props.gameplay.visualHook
  }
  return false
}

function getDescription(): string {
  if ('description' in props.gameplay) return props.gameplay.description
  return props.gameplay.desc ?? ''
}

function handleClick() {
  emit('toggle')
}
</script>

<template>
  <div
    :class="[
      'cursor-pointer rounded-md px-2 py-1.5 transition-colors',
      selected
        ? 'bg-brand/8 text-foreground'
        : 'hover:bg-muted/60'
    ]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.space.prevent="handleClick"
  >
    <div class="flex items-center gap-2">
      <component
        :is="selected ? CheckSquare : Square"
        :size="15"
        class="shrink-0"
        :class="selected ? 'text-brand' : 'text-muted-foreground/50'"
      />
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <span class="truncate text-xs font-medium">{{ gameplay.name }}</span>
          <BaseBadge
            v-if="isGameplayTopic(gameplay) && gameplay.heat"
            variant="secondary"
            class="shrink-0 text-[10px] leading-none px-1 py-0"
          >
            {{ gameplay.heat }}
          </BaseBadge>
        </div>
        <p class="mt-0.5 truncate text-[11px] text-muted-foreground">
          {{ getDescription() }}
        </p>
      </div>
      <button
        v-if="hasDetails()"
        type="button"
        class="shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-foreground"
        @click.stop="expanded = !expanded"
      >
        <ChevronDown
          :size="13"
          :class="['transition-transform', expanded && 'rotate-180']"
        />
      </button>
    </div>
    <div
      v-if="expanded"
      class="mt-1.5 ml-[23px] space-y-1.5 rounded bg-muted/40 p-2 text-[11px]"
    >
      <template v-if="isGameplayTopic(gameplay)">
        <div v-if="gameplay.hooks?.length">
          <p class="font-medium text-muted-foreground">视觉钩子</p>
          <ul class="mt-0.5 list-inside list-disc space-y-0.5">
            <li v-for="(h, i) in gameplay.hooks" :key="i">{{ h }}</li>
          </ul>
        </div>
        <p v-if="gameplay.source" class="text-muted-foreground">
          来源：{{ gameplay.source }}
        </p>
      </template>
      <template v-else-if="isGameplayPreset(gameplay)">
        <div v-if="gameplay.coreLoop">
          <p class="font-medium text-muted-foreground">核心循环</p>
          <p class="mt-0.5">{{ gameplay.coreLoop }}</p>
        </div>
        <div v-if="gameplay.visualHook">
          <p class="font-medium text-muted-foreground">推荐视觉钩子</p>
          <p class="mt-0.5">{{ gameplay.visualHook }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

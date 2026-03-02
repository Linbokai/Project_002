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
  return props.gameplay.description ?? (props.gameplay as GameplayTopic).desc ?? ''
}

function getTier(): string | null {
  if (!isGameplayPreset(props.gameplay)) return null
  return props.gameplay.tier
}

function handleClick() {
  emit('toggle')
}
</script>

<template>
  <div
    :class="[
      'cursor-pointer rounded-lg border p-3 transition-colors',
      selected
        ? 'border-brand bg-brand/5'
        : 'border-border hover:border-border/80'
    ]"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter.space.prevent="handleClick"
  >
    <div class="flex items-start gap-2">
      <component
        :is="selected ? CheckSquare : Square"
        :size="18"
        class="mt-0.5 shrink-0"
        :class="selected ? 'text-brand' : 'text-muted-foreground'"
      />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-sm font-medium">{{ gameplay.name }}</span>
          <BaseBadge
            v-if="getTier()"
            :variant="
              getTier() === 'T1'
                ? 'destructive'
                : getTier() === 'T2'
                  ? 'secondary'
                  : 'outline'
            "
          >
            {{ getTier() }}
          </BaseBadge>
          <BaseBadge
            v-if="isGameplayTopic(gameplay) && gameplay.heat"
            variant="secondary"
          >
            {{ gameplay.heat }}
          </BaseBadge>
        </div>
        <p class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {{ getDescription() }}
        </p>
        <p
          v-if="isGameplayTopic(gameplay) && gameplay.source"
          class="mt-0.5 text-xs text-muted-foreground"
        >
          来源：{{ gameplay.source }}
        </p>
        <div v-if="hasDetails()" class="mt-2">
          <button
            type="button"
            class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            @click.stop="expanded = !expanded"
          >
            <ChevronDown
              :class="['transition-transform', expanded && 'rotate-180']"
              :size="14"
            />
            {{ expanded ? '收起' : '展开详情' }}
          </button>
          <div
            v-if="expanded"
            class="mt-2 space-y-2 rounded border border-border/50 bg-muted/30 p-2 text-xs"
          >
            <template v-if="isGameplayTopic(gameplay)">
              <div v-if="gameplay.hooks?.length">
                <p class="font-medium text-muted-foreground">视觉钩子</p>
                <ul class="mt-1 list-inside list-disc space-y-0.5">
                  <li v-for="(h, i) in gameplay.hooks" :key="i">{{ h }}</li>
                </ul>
              </div>
            </template>
            <template v-else-if="isGameplayPreset(gameplay)">
              <div v-if="gameplay.coreLoop">
                <p class="font-medium text-muted-foreground">核心循环</p>
                <p class="mt-1">{{ gameplay.coreLoop }}</p>
              </div>
              <div v-if="gameplay.visualHook">
                <p class="font-medium text-muted-foreground">推荐视觉钩子</p>
                <p class="mt-1">{{ gameplay.visualHook }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

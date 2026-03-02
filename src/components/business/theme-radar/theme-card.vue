<script setup lang="ts">
import { ref } from 'vue'
import { CheckSquare, Square, ChevronDown } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/base-badge.vue'
import type { PresetTheme, ThemeTopic, CustomTheme } from '@/models/types'

const props = withDefaults(
  defineProps<{
    theme: PresetTheme | ThemeTopic | CustomTheme
    selected?: boolean
  }>(),
  { selected: false }
)

const emit = defineEmits<{
  toggle: []
}>()

const expanded = ref(false)

function isThemeTopic(t: PresetTheme | ThemeTopic | CustomTheme): t is ThemeTopic {
  return 'hooks' in t && 'cases' in t
}

function isPresetTheme(t: PresetTheme | ThemeTopic | CustomTheme): t is PresetTheme {
  return 'tier' in t
}

const hasDetails = () => {
  if (!isThemeTopic(props.theme)) return false
  const t = props.theme as ThemeTopic
  return (t.hooks?.length ?? 0) > 0 || (t.cases?.length ?? 0) > 0
}

const description = () => {
  if (isThemeTopic(props.theme)) return (props.theme as ThemeTopic).desc
  if (isPresetTheme(props.theme)) return (props.theme as PresetTheme).description
  return (props.theme as CustomTheme).description
}

const tier = () => {
  if (!isPresetTheme(props.theme)) return null
  return (props.theme as PresetTheme).tier
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
          <span class="font-medium text-sm">{{ theme.name }}</span>
          <BaseBadge
            v-if="tier()"
            :variant="
              tier() === 'T1'
                ? 'destructive'
                : tier() === 'T2'
                  ? 'secondary'
                  : 'outline'
            "
          >
            {{ tier() }}
          </BaseBadge>
        </div>
        <p class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {{ description() }}
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
            v-if="expanded && isThemeTopic(theme)"
            class="mt-2 space-y-2 rounded border border-border/50 bg-muted/30 p-2 text-xs"
          >
            <div v-if="(theme as ThemeTopic).hooks?.length">
              <p class="font-medium text-muted-foreground">钩子套路</p>
              <ul class="mt-1 list-inside list-disc space-y-0.5">
                <li
                  v-for="(h, i) in (theme as ThemeTopic).hooks"
                  :key="i"
                >
                  {{ h }}
                </li>
              </ul>
            </div>
            <div v-if="(theme as ThemeTopic).cases?.length">
              <p class="font-medium text-muted-foreground">案例</p>
              <ul class="mt-1 list-inside list-disc space-y-0.5">
                <li
                  v-for="(c, i) in (theme as ThemeTopic).cases"
                  :key="i"
                >
                  {{ c }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

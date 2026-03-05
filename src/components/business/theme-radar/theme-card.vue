<script setup lang="ts">
import { ref } from 'vue'
import { CheckSquare, Square, ChevronDown } from 'lucide-vue-next'
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
          <span class="truncate text-xs font-medium">{{ theme.name }}</span>
        </div>
        <p class="mt-0.5 truncate text-[11px] text-muted-foreground">
          {{ description() }}
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
      v-if="expanded && isThemeTopic(theme)"
      class="mt-1.5 ml-[23px] space-y-1.5 rounded bg-muted/40 p-2 text-[11px]"
    >
      <div v-if="(theme as ThemeTopic).hooks?.length">
        <p class="font-medium text-muted-foreground">钩子套路</p>
        <ul class="mt-0.5 list-inside list-disc space-y-0.5">
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
        <ul class="mt-0.5 list-inside list-disc space-y-0.5">
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
</template>

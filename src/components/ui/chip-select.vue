<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    options: string[]
    modelValue: string[]
  }>(),
  {
    options: () => [],
    modelValue: () => []
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const selectedSet = computed(() => new Set(props.modelValue))

function toggle(option: string) {
  const set = new Set(props.modelValue)
  if (set.has(option)) {
    set.delete(option)
  } else {
    set.add(option)
  }
  emit('update:modelValue', Array.from(set))
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt"
      type="button"
      :class="[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        selectedSet.has(opt)
          ? 'border border-brand/30 bg-brand/10 text-brand'
          : 'border border-transparent bg-secondary text-secondary-foreground hover:border-border'
      ]"
      @click="toggle(opt)"
    >
      {{ opt }}
    </button>
  </div>
</template>

<style scoped>
</style>

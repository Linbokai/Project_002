<script setup lang="ts">
import type { VariantCount } from '@/models/types/variant'

const props = defineProps<{
  count: VariantCount
}>()

const emit = defineEmits<{
  'update:count': [value: VariantCount]
}>()

const options: VariantCount[] = [1, 3, 5]

function select(value: VariantCount) {
  if (value !== props.count) {
    emit('update:count', value)
  }
}
</script>

<template>
  <div class="inline-flex items-center rounded-md border border-border/60 bg-muted/30 p-0.5">
    <button
      v-for="opt in options"
      :key="opt"
      :class="[
        'relative rounded-[5px] px-2.5 py-1 text-xs font-medium transition-all',
        count === opt
          ? 'bg-brand text-brand-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      ]"
      @click="select(opt)"
    >
      {{ opt }}x
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'brand' | 'destructive' | 'outline'
  }>(),
  {
    variant: 'default'
  }
)

const variantClasses = computed(() => {
  const base =
    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors'
  const variants: Record<string, string> = {
    default:
      'bg-primary text-primary-foreground shadow-xs hover:bg-primary/80',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    brand: 'border border-brand/20 bg-brand/10 text-brand',
    destructive:
      'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80',
    outline: 'border text-foreground'
  }
  return `${base} ${variants[props.variant]}`
})
</script>

<template>
  <span :class="variantClasses">
    <slot />
  </span>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    variant?:
      | 'default'
      | 'brand'
      | 'secondary'
      | 'outline'
      | 'ghost'
      | 'destructive'
      | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false
  }
)

const variantClasses = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
  const variants: Record<string, string> = {
    default:
      'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
    brand: 'bg-brand text-brand-foreground shadow-xs hover:bg-brand/90',
    secondary:
      'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
    outline:
      'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:scale-[0.97]',
    ghost:
      'hover:bg-accent hover:text-accent-foreground active:scale-[0.97]',
    destructive:
      'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
    link:
      'text-primary underline-offset-4 hover:underline'
  }
  return `${base} ${variants[props.variant]}`
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6 text-base',
    icon: 'h-9 w-9'
  }
  return sizes[props.size]
})

const isDisabled = computed(
  () => props.disabled || props.loading
)
</script>

<template>
  <button
    type="button"
    :class="[variantClasses, sizeClasses]"
    :disabled="isDisabled"
  >
    <Loader2
      v-if="loading"
      :size="16"
      class="animate-spin shrink-0"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>

<style scoped>
</style>

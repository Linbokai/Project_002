<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
}>(), {
  label: '思考中...',
})
</script>

<template>
  <div class="flex w-full max-w-[85%] flex-col gap-2">
    <div class="flex items-center gap-2">
      <div class="flex gap-1">
        <span
          class="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style="animation-delay: 0ms"
        />
        <span
          class="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style="animation-delay: 150ms"
        />
        <span
          class="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style="animation-delay: 300ms"
        />
      </div>
      <span class="text-xs text-muted-foreground">{{ label }}</span>
    </div>
  </div>
</template>

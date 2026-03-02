<script setup lang="ts">
export interface TabItem {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    tabs: TabItem[]
    modelValue?: string
  }>(),
  {
    modelValue: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectTab(value: string) {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="w-full">
    <div
      class="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="[
          'inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          modelValue === tab.value
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:text-foreground'
        ]"
        role="tab"
        :aria-selected="modelValue === tab.value"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>

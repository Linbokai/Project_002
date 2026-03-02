<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

export interface SelectOption {
  value: string
  label: string
  description?: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: SelectOption[]
    placeholder?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    placeholder: '选择...'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({ top: '0px', left: '0px', minWidth: '0px' })

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label ?? props.placeholder
})

function updateDropdownPosition() {
  if (!triggerRef.value || !isOpen.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const viewportH = window.innerHeight
  const maxDropdownH = 240 // max-h-60 = 15rem = 240px
  const gap = 4
  const spaceBelow = viewportH - rect.bottom - gap
  const spaceAbove = rect.top - gap
  const openAbove = spaceBelow < maxDropdownH && spaceAbove > spaceBelow

  if (openAbove) {
    dropdownStyle.value = {
      bottom: `${viewportH - rect.top + gap}px`,
      top: 'auto',
      left: `${rect.left}px`,
      minWidth: `${rect.width}px`,
    }
  } else {
    dropdownStyle.value = {
      top: `${rect.bottom + gap}px`,
      bottom: 'auto',
      left: `${rect.left}px`,
      minWidth: `${rect.width}px`,
    }
  }
}

watch(isOpen, (open) => {
  if (open) {
    updateDropdownPosition()
  }
})

function toggle() {
  isOpen.value = !isOpen.value
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    isOpen.value &&
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(target)
  ) {
    isOpen.value = false
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div class="relative w-full">
    <button
      ref="triggerRef"
      type="button"
      :class="[
        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,border-color,box-shadow]',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        !modelValue && 'text-muted-foreground'
      ]"
      @click="toggle"
    >
      <span class="truncate">{{ selectedLabel }}</span>
      <ChevronDown :size="16" class="shrink-0 opacity-50" />
    </button>
    <Teleport to="body">
      <div
        v-show="isOpen"
        ref="dropdownRef"
        class="fixed z-50 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        :style="dropdownStyle"
      >
        <div
          v-for="opt in options"
          :key="opt.value"
          :class="[
            'relative flex cursor-pointer select-none flex-col rounded-sm px-2 py-1.5',
            'hover:bg-accent hover:text-accent-foreground',
            opt.value === modelValue && 'bg-accent text-accent-foreground'
          ]"
          @click="selectOption(opt)"
        >
          <span class="text-sm">{{ opt.label }}</span>
          <span v-if="opt.description" class="text-[11px] text-muted-foreground">{{ opt.description }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
</style>

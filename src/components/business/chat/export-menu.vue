<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Download, Copy, FileText, FileSpreadsheet, FileDown, Check } from 'lucide-vue-next'
import BaseButton from '@/components/ui/base-button.vue'
import { parseFrames } from '@/services/helpers/frame-parser'
import { formatAsMarkdown, formatAsCsv } from '@/services/helpers/export-formatter'

const props = defineProps<{
  scriptText: string
  gameName: string
}>()

const emit = defineEmits<{
  exported: []
}>()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const copied = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (isOpen.value && menuRef.value && !menuRef.value.contains(e.target as Node)) {
    close()
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function dateSuffix(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.scriptText)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    /* clipboard not available */
  }
  close()
  emit('exported')
}

function handleDownloadTxt() {
  const name = props.gameName || '脚本'
  downloadBlob(props.scriptText, `${name}_${dateSuffix()}.txt`, 'text/plain;charset=utf-8')
  close()
  emit('exported')
}

function handleDownloadMarkdown() {
  const shots = parseFrames(props.scriptText)
  const md = formatAsMarkdown(props.scriptText, shots, props.gameName)
  const name = props.gameName || '脚本'
  downloadBlob(md, `${name}_${dateSuffix()}.md`, 'text/markdown;charset=utf-8')
  close()
  emit('exported')
}

function handleDownloadCsv() {
  const shots = parseFrames(props.scriptText)
  const csv = formatAsCsv(shots)
  const name = props.gameName || '脚本'
  downloadBlob(csv, `${name}_分镜_${dateSuffix()}.csv`, 'text/csv;charset=utf-8')
  close()
  emit('exported')
}

const menuItems = [
  { label: '复制脚本', icon: Copy, action: handleCopy },
  { label: '下载 TXT', icon: FileText, action: handleDownloadTxt },
  { label: '下载 Markdown', icon: FileDown, action: handleDownloadMarkdown },
  { label: '下载 CSV', icon: FileSpreadsheet, action: handleDownloadCsv },
] as const
</script>

<template>
  <div ref="menuRef" class="relative">
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      @click="toggle"
    >
      <template v-if="copied">
        <Check :size="12" />
        已复制
      </template>
      <template v-else>
        <Download :size="12" />
        导出
      </template>
    </BaseButton>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-border bg-popover py-1 shadow-md"
      >
        <button
          v-for="item in menuItems"
          :key="item.label"
          type="button"
          class="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          @click="item.action()"
        >
          <component :is="item.icon" :size="13" class="shrink-0 opacity-60" />
          {{ item.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

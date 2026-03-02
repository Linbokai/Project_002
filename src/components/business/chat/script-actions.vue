<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import { Copy, Download, Languages, Shield, ShieldOff } from 'lucide-vue-next'
import { useScriptExport } from '@/composables/use-script-export'

const props = defineProps<{
  scriptText: string
  gameName: string
}>()

const {
  copyScript,
  downloadScript,
  convertToSeedance,
  safeMode,
  toggleSafeMode,
} = useScriptExport()

const seedanceZhLoading = ref(false)
const seedanceEnLoading = ref(false)
const copied = ref(false)

async function handleCopy() {
  const ok = await copyScript(props.scriptText)
  if (ok) {
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  }
}

function handleDownload() {
  downloadScript(props.scriptText, props.gameName)
}

async function handleSeedance(lang: 'zh' | 'en') {
  if (lang === 'zh') {
    seedanceZhLoading.value = true
  } else {
    seedanceEnLoading.value = true
  }
  try {
    const result = await convertToSeedance(props.scriptText, lang)
    await copyScript(result)
  } finally {
    seedanceZhLoading.value = false
    seedanceEnLoading.value = false
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5 pt-2">
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      aria-label="复制"
      @click="handleCopy"
    >
      <Copy :size="12" />
      {{ copied ? '已复制' : 'Copy' }}
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      aria-label="下载"
      @click="handleDownload"
    >
      <Download :size="12" />
      Download
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      :loading="seedanceZhLoading"
      :disabled="seedanceZhLoading || seedanceEnLoading"
      aria-label="Seedance 中文"
      @click="handleSeedance('zh')"
    >
      <Languages :size="12" />
      Seedance中
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      :loading="seedanceEnLoading"
      :disabled="seedanceZhLoading || seedanceEnLoading"
      aria-label="Seedance 英文"
      @click="handleSeedance('en')"
    >
      <Languages :size="12" />
      Seedance英
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      :title="safeMode ? '安全模式已开（点击关闭）' : '安全模式已关（点击开启）'"
      aria-label="切换安全模式"
      @click="toggleSafeMode"
    >
      <Shield v-if="safeMode" :size="12" />
      <ShieldOff v-else :size="12" />
      {{ safeMode ? '安全模式开' : '安全模式关' }}
    </BaseButton>
  </div>
</template>

<style scoped>
</style>

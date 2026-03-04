<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import { Copy, Download, Languages, Shield, ShieldOff } from 'lucide-vue-next'
import { useScriptExport } from '@/composables/use-script-export'
import { useToast } from '@/composables/use-toast'

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
const { showToast } = useToast()

const seedanceZhLoading = ref(false)
const seedanceEnLoading = ref(false)
const seedanceZhDone = ref(false)
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
    await convertToSeedance(props.scriptText, lang)
    if (lang === 'zh') seedanceZhDone.value = true
    showToast('视频提示词已生成，请在聊天窗口查看', 'success')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '转化失败'
    showToast(msg, 'destructive')
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
      title="复制脚本内容到剪贴板"
      aria-label="复制脚本"
      @click="handleCopy"
    >
      <Copy :size="12" />
      {{ copied ? '已复制' : '复制脚本' }}
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      title="下载脚本为文本文件"
      aria-label="下载脚本"
      @click="handleDownload"
    >
      <Download :size="12" />
      下载脚本
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      :loading="seedanceZhLoading"
      :disabled="seedanceZhLoading || seedanceEnLoading"
      title="将脚本转换为 Seedance 2.0 视频生成平台的提示词格式"
      aria-label="转为Seedance提示词"
      @click="handleSeedance('zh')"
    >
      <Languages :size="12" />
      转为Seedance提示词
    </BaseButton>
    <BaseButton
      v-if="seedanceZhDone"
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      :loading="seedanceEnLoading"
      :disabled="seedanceZhLoading || seedanceEnLoading"
      title="Convert script to Seedance 2.0 prompt in English"
      aria-label="Seedance Prompt (EN)"
      @click="handleSeedance('en')"
    >
      <Languages :size="12" />
      Seedance Prompt (EN)
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      class="h-7 px-2 text-xs"
      title="开启后自动替换脚本中的暴力/敏感内容，适合平台审核严格的渠道"
      aria-label="切换安全模式"
      @click="toggleSafeMode"
    >
      <Shield v-if="safeMode" :size="12" />
      <ShieldOff v-else :size="12" />
      {{ safeMode ? '安全模式：开' : '安全模式：关' }}
    </BaseButton>
  </div>
</template>

<style scoped>
</style>

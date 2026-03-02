<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import StatusIndicator from '@/components/ui/status-indicator.vue'
import { useSettingsStore } from '@/stores/settings-store'
import { testConnection } from '@/services/api/openrouter-api'
import { SEARCH_MODELS, GEN_MODELS, VISION_MODELS } from '@/constants/model-options'
import { useToast } from '@/composables/use-toast'
import type { ApiConfig } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const { showToast } = useToast()

const apiKey = ref('')
const searchModel = ref('')
const genModel = ref('')
const visionModel = ref('')
const searchStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const genStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const testing = ref(false)

const searchModelOptions = SEARCH_MODELS.map((m) => ({ value: m.id, label: m.name }))
const genModelOptions = GEN_MODELS.map((m) => ({ value: m.id, label: m.name }))
const visionModelOptions = VISION_MODELS.map((m) => ({ value: m.id, label: m.name }))

watch(
  () => props.open,
  (open) => {
    if (open) {
      apiKey.value = settingsStore.config.openRouterKey
      searchModel.value = settingsStore.config.searchModel
      genModel.value = settingsStore.config.genModel
      visionModel.value = settingsStore.config.visionModel
      searchStatus.value = 'disconnected'
      genStatus.value = 'disconnected'
    }
  },
  { immediate: true },
)

async function handleTestConnection() {
  const config: ApiConfig = {
    openRouterKey: apiKey.value,
    searchModel: searchModel.value,
    genModel: genModel.value,
    visionModel: visionModel.value,
  }
  searchStatus.value = 'connecting'
  genStatus.value = 'connecting'
  testing.value = true

  try {
    const [searchResult, genResult] = await Promise.all([
      testConnection(config, config.searchModel),
      testConnection(config, config.genModel),
    ])

    searchStatus.value = searchResult.ok ? 'connected' : 'disconnected'
    genStatus.value = genResult.ok ? 'connected' : 'disconnected'

    if (searchResult.ok && genResult.ok) {
      showToast('所有模型连接成功', 'success')
    } else {
      const errors: string[] = []
      if (!searchResult.ok) errors.push(`搜索: ${searchResult.error}`)
      if (!genResult.ok) errors.push(`生成: ${genResult.error}`)
      showToast(`连接失败 — ${errors.join('；')}`, 'destructive')
    }
  } catch (e) {
    searchStatus.value = 'disconnected'
    genStatus.value = 'disconnected'
    const msg = e instanceof Error ? e.message : '测试连接时发生未知错误'
    showToast(msg, 'destructive')
  } finally {
    testing.value = false
  }
}

function handleCancel() {
  emit('close')
}

function handleSave() {
  settingsStore.updateConfig({
    openRouterKey: apiKey.value,
    searchModel: searchModel.value,
    genModel: genModel.value,
    visionModel: visionModel.value,
  })
  showToast('API 配置已保存', 'success')
  emit('close')
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">API 配置</h2>
    </template>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">OpenRouter API Key</label>
        <BaseInput v-model="apiKey" type="password" placeholder="请输入 API Key" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">搜索模型</label>
        <BaseSelect v-model="searchModel" :options="searchModelOptions" placeholder="选择搜索模型" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">生成模型</label>
        <BaseSelect v-model="genModel" :options="genModelOptions" placeholder="选择生成模型" />
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">视觉模型</label>
        <BaseSelect v-model="visionModel" :options="visionModelOptions" placeholder="选择视觉模型" />
      </div>

      <div class="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
        <div class="text-sm font-medium">连接测试</div>
        <div class="flex flex-wrap items-center gap-6">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">搜索</span>
            <StatusIndicator :status="searchStatus" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">生成</span>
            <StatusIndicator :status="genStatus" />
          </div>
          <BaseButton variant="outline" size="sm" :loading="testing" :disabled="testing" @click="handleTestConnection">
            测试连接
          </BaseButton>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="handleCancel">取消</BaseButton>
      <BaseButton variant="brand" @click="handleSave">保存</BaseButton>
    </template>
  </BaseDialog>
</template>

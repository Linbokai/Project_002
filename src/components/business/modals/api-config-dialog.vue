<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sparkles, Eye, EyeOff, Wallet, Lock } from 'lucide-vue-next'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import BaseTabs from '@/components/ui/base-tabs.vue'
import StatusIndicator from '@/components/ui/status-indicator.vue'
import { useSettingsStore } from '@/stores/settings-store'
import { useModelRoutingStore } from '@/stores/model-routing-store'
import { useModelRouting } from '@/composables/use-model-routing'
import { testConnection, testImageConnection } from '@/services/api/openrouter-api'
import { fetchKeyInfo } from '@/services/api/openrouter-client'
import { SEARCH_MODELS, GEN_MODELS, VISION_MODELS, IMAGE_MODELS } from '@/constants/model-options'
import { useToast } from '@/composables/use-toast'
import type { ApiConfig, KeyInfo, RoutingMode, RoutingProfile, TaskType, Provider } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const routingStore = useModelRoutingStore()
const { refreshModels, recalculateRouting, resolveModel } = useModelRouting()
const { showToast } = useToast()

// Provider selection
const provider = ref<Provider>('ark')

// OpenRouter lock
const orUnlocked = ref(false)
const showOrLock = ref(false)
const orPassword = ref('')
const orPasswordError = ref(false)

function handleOrButtonClick() {
  if (orUnlocked.value) {
    switchProvider('openrouter')
  } else {
    showOrLock.value = true
    orPassword.value = ''
    orPasswordError.value = false
  }
}

function submitOrPassword() {
  if (orPassword.value === 'BT2026') {
    orUnlocked.value = true
    showOrLock.value = false
    orPasswordError.value = false
    switchProvider('openrouter')
  } else {
    orPasswordError.value = true
    orPassword.value = ''
  }
}

function cancelOrLock() {
  showOrLock.value = false
  orPassword.value = ''
  orPasswordError.value = false
}

// OpenRouter fields
const apiKey = ref('')
const showApiKey = ref(false)
const searchModel = ref('')
const genModel = ref('')
const visionModel = ref('')
const imageModel = ref('')
const routingMode = ref<RoutingMode>('manual')
const routingProfile = ref<RoutingProfile>('balanced')

// ARK fields
const arkKey = ref('')
const showArkKey = ref(false)
const arkGenModel = ref('')
const arkVisionModel = ref('')
const arkImageModel = ref('')

// OpenRouter test statuses
const orSearchStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const orGenStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const orVisionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const orImageStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const orTesting = ref(false)

// ARK test statuses
const arkGenStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const arkVisionStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const arkImageStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
const arkTesting = ref(false)

const keyInfo = ref<KeyInfo | null>(null)
const loadingKeyInfo = ref(false)

const searchModelOptions = SEARCH_MODELS.map((m) => ({ value: m.id, label: m.name }))
const genModelOptions = GEN_MODELS.map((m) => ({ value: m.id, label: m.name }))
const visionModelOptions = VISION_MODELS.map((m) => ({ value: m.id, label: m.name }))
const imageModelOptions = IMAGE_MODELS.map((m) => ({ value: m.id, label: m.name }))

const modeTabs = [
  { value: 'manual', label: '手动选择' },
  { value: 'auto', label: '智能推荐' },
]

const profileCards: { value: RoutingProfile; label: string; desc: string }[] = [
  { value: 'balanced', label: '性价比之王', desc: '质量与成本的最佳平衡' },
  { value: 'quality', label: '质量最强', desc: '不计成本追求最好效果' },
  { value: 'economy', label: '极速省钱', desc: '最低成本快速出结果' },
]

const taskLabels: { task: TaskType; label: string }[] = [
  { task: 'search', label: '搜索热点' },
  { task: 'gen', label: '写脚本' },
  { task: 'vision', label: '看视频' },
  { task: 'image', label: '画参考图' },
]

watch(
  () => props.open,
  (open) => {
    if (open) {
      provider.value = settingsStore.config.provider ?? 'ark'
      // OpenRouter
      apiKey.value = settingsStore.config.openRouterKey
      showApiKey.value = false
      searchModel.value = settingsStore.config.searchModel
      genModel.value = settingsStore.config.genModel
      visionModel.value = settingsStore.config.visionModel
      imageModel.value = settingsStore.config.imageModel
      routingMode.value = settingsStore.config.routingMode ?? 'manual'
      routingProfile.value = settingsStore.config.routingProfile ?? 'balanced'
      // ARK
      arkKey.value = settingsStore.config.arkKey ?? ''
      showArkKey.value = false
      arkGenModel.value = settingsStore.config.arkGenModel ?? ''
      arkVisionModel.value = settingsStore.config.arkVisionModel ?? ''
      arkImageModel.value = settingsStore.config.arkImageModel ?? ''
      // Reset statuses
      resetOrStatuses()
      resetArkStatuses()
      keyInfo.value = null

      if (routingMode.value === 'auto') {
        refreshModels()
      }
      if (apiKey.value) {
        loadKeyInfo()
      }
    }
  },
  { immediate: true },
)

watch(routingMode, (mode) => {
  if (mode === 'auto') {
    refreshModels()
  }
})

watch(routingProfile, (profile) => {
  if (routingMode.value === 'auto') {
    recalculateRouting(profile)
  }
})

function resetOrStatuses() {
  orSearchStatus.value = 'disconnected'
  orGenStatus.value = 'disconnected'
  orVisionStatus.value = 'disconnected'
  orImageStatus.value = 'disconnected'
}

function resetArkStatuses() {
  arkGenStatus.value = 'disconnected'
  arkVisionStatus.value = 'disconnected'
  arkImageStatus.value = 'disconnected'
}

function switchProvider(p: Provider) {
  provider.value = p
  resetOrStatuses()
  resetArkStatuses()
}

async function loadKeyInfo() {
  if (!apiKey.value) return
  loadingKeyInfo.value = true
  try {
    keyInfo.value = await fetchKeyInfo(apiKey.value)
  } catch {
    keyInfo.value = null
  } finally {
    loadingKeyInfo.value = false
  }
}

function formatUsd(val: number | null | undefined): string {
  if (val == null) return '--'
  return `$${val.toFixed(2)}`
}

function getResolvedModelName(task: TaskType): string {
  const modelId = resolveModel(task)
  if (!modelId) return '未选择'
  const model = routingStore.cachedModels.find((m) => m.id === modelId)
  return model?.name ?? formatModelId(modelId)
}

function formatModelId(id: string): string {
  return id.split('/').pop() ?? id
}

async function handleRefreshRouting() {
  routingStore.invalidateCache()
  await refreshModels()
}

function getActiveOrModel(task: TaskType): string {
  if (routingMode.value === 'auto') return resolveModel(task)
  switch (task) {
    case 'search': return searchModel.value
    case 'gen': return genModel.value
    case 'vision': return visionModel.value
    case 'image': return imageModel.value
  }
}

function buildFullConfig(): ApiConfig {
  return {
    provider: provider.value,
    openRouterKey: apiKey.value,
    searchModel: searchModel.value,
    genModel: genModel.value,
    visionModel: visionModel.value,
    imageModel: imageModel.value,
    routingMode: routingMode.value,
    routingProfile: routingProfile.value,
    arkKey: arkKey.value,
    arkGenModel: arkGenModel.value,
    arkVisionModel: arkVisionModel.value,
    arkImageModel: arkImageModel.value,
  }
}

async function handleTestOpenRouter() {
  const config = { ...buildFullConfig(), provider: 'openrouter' as Provider }
  orTesting.value = true
  orSearchStatus.value = 'connecting'
  orGenStatus.value = 'connecting'
  orVisionStatus.value = 'connecting'
  orImageStatus.value = 'connecting'

  try {
    const [searchResult, genResult, visionResult, imageResult] = await Promise.all([
      testConnection(config, getActiveOrModel('search')),
      testConnection(config, getActiveOrModel('gen')),
      testConnection(config, getActiveOrModel('vision')),
      testConnection(config, getActiveOrModel('image')),
    ])
    orSearchStatus.value = searchResult.ok ? 'connected' : 'disconnected'
    orGenStatus.value = genResult.ok ? 'connected' : 'disconnected'
    orVisionStatus.value = visionResult.ok ? 'connected' : 'disconnected'
    orImageStatus.value = imageResult.ok ? 'connected' : 'disconnected'

    const failed = [
      { name: '搜索', ok: searchResult.ok, error: searchResult.error },
      { name: '生成', ok: genResult.ok, error: genResult.error },
      { name: '视觉', ok: visionResult.ok, error: visionResult.error },
      { name: '图像', ok: imageResult.ok, error: imageResult.error },
    ].filter((r) => !r.ok)

    if (failed.length === 0) {
      showToast('OpenRouter 所有模型连接成功', 'success')
    } else {
      showToast(`连接失败 — ${failed.map((r) => `${r.name}: ${r.error}`).join('；')}`, 'destructive')
    }
  } catch (e) {
    resetOrStatuses()
    showToast(e instanceof Error ? e.message : '测试连接时发生未知错误', 'destructive')
  } finally {
    orTesting.value = false
  }
}

async function handleTestArk() {
  const config = { ...buildFullConfig(), provider: 'ark' as Provider }
  arkTesting.value = true
  arkGenStatus.value = 'connecting'
  arkVisionStatus.value = 'connecting'
  arkImageStatus.value = 'connecting'

  try {
    const [genResult, visionResult, imageResult] = await Promise.all([
      testConnection(config, arkGenModel.value),
      testConnection(config, arkVisionModel.value),
      testImageConnection(config, arkImageModel.value),
    ])
    arkGenStatus.value = genResult.ok ? 'connected' : 'disconnected'
    arkVisionStatus.value = visionResult.ok ? 'connected' : 'disconnected'
    arkImageStatus.value = imageResult.ok ? 'connected' : 'disconnected'

    const failed = [
      { name: '生成', ok: genResult.ok, error: genResult.error },
      { name: '视觉', ok: visionResult.ok, error: visionResult.error },
      { name: '图像', ok: imageResult.ok, error: imageResult.error },
    ].filter((r) => !r.ok)

    if (failed.length === 0) {
      showToast('火山方舟连接成功', 'success')
    } else {
      showToast(`连接失败 — ${failed.map((r) => `${r.name}: ${r.error}`).join('；')}`, 'destructive')
    }
  } catch (e) {
    resetArkStatuses()
    showToast(e instanceof Error ? e.message : '测试连接时发生未知错误', 'destructive')
  } finally {
    arkTesting.value = false
  }
}

function handleCancel() {
  emit('close')
}

function handleSave() {
  settingsStore.updateConfig(buildFullConfig())
  showToast('API 配置已保存', 'success')
  emit('close')
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">AI 接口配置</h2>
      <p class="text-sm text-muted-foreground">配置 AI 服务后即可使用脚本生成和视频分析功能</p>
    </template>

    <div class="flex flex-col gap-4">
      <!-- Trial Mode Banner -->
      <div
        v-if="!settingsStore.hasApiKey"
        class="mb-4 rounded-lg border border-brand/20 bg-brand/5 p-3"
      >
        <div class="mb-1 flex items-center gap-2">
          <Sparkles :size="14" class="text-brand" />
          <span class="text-sm font-medium">免费体验模式</span>
        </div>
        <p class="mb-2 text-xs text-muted-foreground">
          无需 API Key，可免费体验 {{ settingsStore.trialRemaining }} 次脚本生成
        </p>
        <button
          v-if="!settingsStore.isTrialMode"
          type="button"
          class="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand/90"
          @click="settingsStore.enableTrialMode()"
        >
          开启免费体验
        </button>
        <div v-else class="flex items-center gap-2 text-xs">
          <span class="font-medium text-brand">已开启</span>
          <span class="text-muted-foreground">· 剩余 {{ settingsStore.trialRemaining }} 次</span>
        </div>
      </div>

      <!-- Provider Selector -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium">服务商</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors"
            :class="provider === 'openrouter'
              ? 'border-brand bg-brand/10 text-foreground'
              : 'border-border text-muted-foreground hover:bg-muted/50'"
            @click="handleOrButtonClick"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-medium">OpenRouter</span>
              <Lock v-if="!orUnlocked" :size="12" class="opacity-50" />
            </div>
            <span class="text-xs opacity-70">海外多模型路由</span>
          </button>
          <button
            type="button"
            class="flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors"
            :class="provider === 'ark'
              ? 'border-brand bg-brand/10 text-foreground'
              : 'border-border text-muted-foreground hover:bg-muted/50'"
            @click="switchProvider('ark')"
          >
            <span class="text-sm font-medium">火山方舟</span>
            <span class="text-xs opacity-70">字节跳动大模型平台</span>
          </button>
        </div>

        <!-- OpenRouter 密码验证 -->
        <div v-if="showOrLock" class="flex flex-col gap-2 rounded-lg border border-dashed p-3">
          <p class="text-xs text-muted-foreground">请输入访问密码以解锁 OpenRouter 配置</p>
          <div class="flex gap-2">
            <BaseInput
              v-model="orPassword"
              type="password"
              placeholder="访问密码"
              class="flex-1"
              @keydown.enter="submitOrPassword"
              @keydown.esc="cancelOrLock"
            />
            <BaseButton size="sm" variant="brand" @click="submitOrPassword">确认</BaseButton>
            <BaseButton size="sm" variant="ghost" @click="cancelOrLock">取消</BaseButton>
          </div>
          <p v-if="orPasswordError" class="text-xs text-destructive">密码错误，请重试</p>
        </div>
      </div>

      <!-- ==================== OpenRouter Config ==================== -->
      <template v-if="provider === 'openrouter'">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">AI 接口密钥</label>
          <div class="relative">
            <BaseInput
              v-model="apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="请输入从 OpenRouter 获取的 API Key"
              class="pr-10"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              @click="showApiKey = !showApiKey"
            >
              <Eye v-if="!showApiKey" :size="16" />
              <EyeOff v-else :size="16" />
            </button>
          </div>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <span>这是连接 AI 服务的密钥，从 OpenRouter 网站免费注册获取</span>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              class="text-brand underline hover:text-brand/80"
            >前往获取 →</a>
          </div>
        </div>

        <!-- Balance Info -->
        <div
          v-if="keyInfo"
          class="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm"
        >
          <Wallet :size="14" class="shrink-0 text-muted-foreground" />
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              <span class="text-muted-foreground">已用</span>
              <span class="ml-1 font-medium">{{ formatUsd(keyInfo.usage) }}</span>
            </span>
            <span v-if="keyInfo.limit != null">
              <span class="text-muted-foreground">额度</span>
              <span class="ml-1 font-medium">{{ formatUsd(keyInfo.limit) }}</span>
            </span>
            <span v-if="keyInfo.limitRemaining != null">
              <span class="text-muted-foreground">剩余</span>
              <span class="ml-1 font-medium text-brand">{{ formatUsd(keyInfo.limitRemaining) }}</span>
            </span>
            <span v-if="keyInfo.isFreeTier" class="rounded bg-brand/10 px-1.5 py-0.5 text-xs text-brand">
              免费套餐
            </span>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">模型选择方式</label>
          <BaseTabs v-model="routingMode" :tabs="modeTabs" />
        </div>

        <!-- Auto Mode -->
        <template v-if="routingMode === 'auto'">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">偏好档位</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="p in profileCards"
                :key="p.value"
                type="button"
                class="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors"
                :class="
                  routingProfile === p.value
                    ? 'border-brand bg-brand/10 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted/50'
                "
                @click="routingProfile = p.value"
              >
                <span class="text-sm font-medium">{{ p.label }}</span>
                <span class="text-xs leading-tight opacity-70">{{ p.desc }}</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">系统推荐</span>
              <BaseButton
                variant="ghost"
                size="sm"
                :loading="routingStore.loading"
                :disabled="routingStore.loading || !apiKey"
                @click="handleRefreshRouting"
              >
                刷新
              </BaseButton>
            </div>
            <div v-if="routingStore.loading" class="py-2 text-center text-sm text-muted-foreground">
              正在获取模型列表...
            </div>
            <div v-else class="flex flex-col gap-2">
              <div
                v-for="item in taskLabels"
                :key="item.task"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-muted-foreground">{{ item.label }}</span>
                <span class="max-w-[60%] truncate font-medium">{{ getResolvedModelName(item.task) }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Manual Mode -->
        <template v-else>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">搜索热点用的 AI</label>
            <BaseSelect v-model="searchModel" :options="searchModelOptions" placeholder="选择搜索模型" />
            <span class="text-xs text-muted-foreground">用来搜索网上的热门主题和玩法</span>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">写脚本用的 AI</label>
            <BaseSelect v-model="genModel" :options="genModelOptions" placeholder="选择生成模型" />
            <span class="text-xs text-muted-foreground">用来生成买量视频脚本，推荐选带"推荐"标记的</span>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">看视频用的 AI</label>
            <BaseSelect v-model="visionModel" :options="visionModelOptions" placeholder="选择视觉模型" />
            <span class="text-xs text-muted-foreground">用来分析你上传的视频画面</span>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium">画参考图用的 AI</label>
            <BaseSelect v-model="imageModel" :options="imageModelOptions" placeholder="选择图像模型" />
            <span class="text-xs text-muted-foreground">用来为脚本分镜生成画面参考图</span>
          </div>
        </template>

        <!-- Connection Test -->
        <div class="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
          <div class="text-sm font-medium">连接测试</div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">搜索</span>
              <StatusIndicator :status="orSearchStatus" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">生成</span>
              <StatusIndicator :status="orGenStatus" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">视觉</span>
              <StatusIndicator :status="orVisionStatus" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">图像</span>
              <StatusIndicator :status="orImageStatus" />
            </div>
          </div>
          <BaseButton variant="outline" size="sm" :loading="orTesting" :disabled="orTesting" @click="handleTestOpenRouter">
            测试连接
          </BaseButton>
        </div>
      </template>

      <!-- ==================== 火山方舟 Config ==================== -->
      <template v-else>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">API Key</label>
          <div class="relative">
            <BaseInput
              v-model="arkKey"
              :type="showArkKey ? 'text' : 'password'"
              placeholder="请输入火山方舟 API Key"
              class="pr-10"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              @click="showArkKey = !showArkKey"
            >
              <Eye v-if="!showArkKey" :size="16" />
              <EyeOff v-else :size="16" />
            </button>
          </div>
          <div class="flex items-center gap-1 text-xs text-muted-foreground">
            <span>在火山方舟控制台的「API Key 管理」中获取</span>
            <a
              href="https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey"
              target="_blank"
              rel="noopener noreferrer"
              class="text-brand underline hover:text-brand/80"
            >前往获取 →</a>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">生成 / 搜索模型</label>
          <BaseInput
            v-model="arkGenModel"
            placeholder="ep-xxxxxxxx 或 deepseek-v3-250324"
          />
          <span class="text-xs text-muted-foreground">用于脚本生成和热点搜索，填写推理接入点 ID 或模型名称</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">视觉模型</label>
          <BaseInput
            v-model="arkVisionModel"
            placeholder="ep-xxxxxxxx 或 doubao-vision-pro-32k-250115"
          />
          <span class="text-xs text-muted-foreground">用于分析视频画面，填写支持视觉输入的推理接入点 ID 或模型名称</span>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">生图模型</label>
          <BaseInput
            v-model="arkImageModel"
            placeholder="ep-xxxxxxxx 或 doubao-seedream-5-0-260128"
          />
          <span class="text-xs text-muted-foreground">用于生成分镜参考图，填写推理接入点 ID 或模型名称</span>
        </div>

        <!-- Connection Test (ARK) -->
        <div class="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
          <div class="text-sm font-medium">连接测试</div>
          <div class="grid grid-cols-2 gap-x-6 gap-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">生成</span>
              <StatusIndicator :status="arkGenStatus" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">视觉</span>
              <StatusIndicator :status="arkVisionStatus" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">图像</span>
              <StatusIndicator :status="arkImageStatus" />
            </div>
          </div>
          <BaseButton variant="outline" size="sm" :loading="arkTesting" :disabled="arkTesting" @click="handleTestArk">
            测试连接
          </BaseButton>
        </div>

        <div class="rounded-lg border border-muted bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
          <span class="font-medium text-foreground">注意：</span>
          火山方舟支持生成、视觉和生图任务。搜索热点同样使用生成模型。
        </div>
      </template>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="handleCancel">取消</BaseButton>
      <BaseButton variant="brand" @click="handleSave">保存</BaseButton>
    </template>
  </BaseDialog>
</template>

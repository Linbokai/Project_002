<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { VideoMetrics } from '@/models/types'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseButton from '@/components/ui/base-button.vue'
import { Upload, BarChart3 } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [file: File, metrics?: VideoMetrics]
}>()

const selectedFile = ref<File | null>(null)
const fileName = ref('')
const showMetrics = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const metrics = reactive({
  roi: '',
  spend: '',
  ctr: '',
  cvr: '',
  cpa: '',
  completionRate: '',
})

watch(
  () => props.open,
  (open) => {
    if (open) {
      selectedFile.value = null
      fileName.value = ''
      showMetrics.value = false
      Object.assign(metrics, { roi: '', spend: '', ctr: '', cvr: '', cpa: '', completionRate: '' })
    }
  },
)

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  target.value = ''
  selectedFile.value = file
  fileName.value = file.name
}

function parseMetrics(): VideoMetrics | undefined {
  const parsed: VideoMetrics = {}
  let hasValue = false

  if (metrics.roi) { parsed.roi = Number(metrics.roi); hasValue = true }
  if (metrics.spend) { parsed.spend = Number(metrics.spend); hasValue = true }
  if (metrics.ctr) { parsed.ctr = Number(metrics.ctr); hasValue = true }
  if (metrics.cvr) { parsed.cvr = Number(metrics.cvr); hasValue = true }
  if (metrics.cpa) { parsed.cpa = Number(metrics.cpa); hasValue = true }
  if (metrics.completionRate) { parsed.completionRate = Number(metrics.completionRate); hasValue = true }

  return hasValue ? parsed : undefined
}

function handleSubmit() {
  if (!selectedFile.value) return
  emit('submit', selectedFile.value, parseMetrics())
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">视频素材分析</h2>
      <p class="text-sm text-muted-foreground">上传买量视频，可选填投放数据获得更精准的分析</p>
    </template>

    <div class="flex flex-col gap-4">
      <div
        class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-brand/50 hover:bg-brand/5"
        @click="openFilePicker"
      >
        <Upload :size="24" class="text-muted-foreground" />
        <span v-if="!fileName" class="text-sm text-muted-foreground">点击选择视频文件</span>
        <span v-else class="text-sm font-medium text-foreground">{{ fileName }}</span>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="hidden"
          @change="handleFileChange"
        />
      </div>

      <button
        type="button"
        class="flex items-center gap-1.5 self-start text-xs text-muted-foreground transition-colors hover:text-foreground"
        @click="showMetrics = !showMetrics"
      >
        <BarChart3 :size="14" />
        {{ showMetrics ? '收起投放数据' : '填写投放数据（可选）' }}
      </button>

      <Transition name="metrics-expand">
        <div v-if="showMetrics" class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">ROI</label>
            <BaseInput v-model="metrics.roi" type="number" placeholder="如 1.5" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">消耗（元）</label>
            <BaseInput v-model="metrics.spend" type="number" placeholder="如 50000" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">点击率 CTR（%）</label>
            <BaseInput v-model="metrics.ctr" type="number" placeholder="如 3.2" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">转化率 CVR（%）</label>
            <BaseInput v-model="metrics.cvr" type="number" placeholder="如 8.5" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">CPA（元）</label>
            <BaseInput v-model="metrics.cpa" type="number" placeholder="如 35" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-muted-foreground">完播率（%）</label>
            <BaseInput v-model="metrics.completionRate" type="number" placeholder="如 25" />
          </div>
        </div>
      </Transition>
    </div>

    <template #footer>
      <BaseButton variant="outline" size="sm" @click="emit('close')">取消</BaseButton>
      <BaseButton variant="brand" size="sm" :disabled="!selectedFile" @click="handleSubmit">
        开始分析
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<style scoped>
.metrics-expand-enter-active,
.metrics-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.metrics-expand-enter-from,
.metrics-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.metrics-expand-enter-to,
.metrics-expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import ImagePreview from './image-preview.vue'
import ScoreCard from './score-card.vue'
import { Grid3x3, Film, Languages, AlertCircle, BarChart3 } from 'lucide-vue-next'
import ExportMenu from './export-menu.vue'
import { useScriptExport } from '@/composables/use-script-export'
import { useStoryboardGrid } from '@/composables/use-storyboard-grid'
import { useShotImage } from '@/composables/use-shot-image'
import { useScriptScore } from '@/composables/use-script-score'
import { useImageStore } from '@/stores/image-store'
import { parseFrames } from '@/services/helpers/frame-parser'
import { useToast } from '@/composables/use-toast'

const props = defineProps<{
  scriptText: string
  gameName: string
  messageTimestamp: number
}>()

const scriptKey = computed(() => String(props.messageTimestamp))

const { convertToSeedance } = useScriptExport()
const { gridImage, loading: gridLoading, error: gridError, generateGrid } = useStoryboardGrid(scriptKey.value)
const imageStore = useImageStore()
const { showToast } = useToast()

const { loading: scoreLoading, score, scoreScript } = useScriptScore()

const seedanceLoading = ref(false)
const shotBatchLoading = ref(false)
const gridPreviewOpen = ref(false)

async function handleScore() {
  if (scoreLoading.value) return
  await scoreScript(props.scriptText)
  if (score.value) {
    showToast('脚本评分完成', 'success')
  }
}

async function handleGridGenerate() {
  await generateGrid(props.scriptText)
  if (!gridError.value) {
    showToast('九宫格分镜概览已生成', 'success')
  }
}

async function handleShotBatch() {
  if (shotBatchLoading.value) return
  shotBatchLoading.value = true

  const shots = parseFrames(props.scriptText)
  for (const shot of shots) {
    if (!shot.scene) continue
    const shotKey = `${scriptKey.value}-${shot.id}`
    if (imageStore.getImage(shotKey)) continue

    const { generate } = useShotImage(scriptKey.value, shotKey)
    await generate(shot.scene, props.scriptText)
  }

  shotBatchLoading.value = false
  showToast('逐镜头分镜图已生成', 'success')
}

async function handleSeedance() {
  seedanceLoading.value = true
  try {
    await convertToSeedance(props.scriptText, 'zh')
    showToast('Seedance 提示词已生成，请在聊天窗口查看', 'success')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '转化失败'
    showToast(msg, 'destructive')
  } finally {
    seedanceLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-2 pt-2">
    <!-- 操作按钮 -->
    <div class="flex flex-wrap items-center gap-1.5">
      <ExportMenu :script-text="props.scriptText" :game-name="gameName" />

      <span class="mx-0.5 h-4 w-px bg-border/60" />

      <BaseButton
        variant="outline"
        size="sm"
        class="h-7 px-2 text-xs"
        :loading="gridLoading"
        :disabled="gridLoading || shotBatchLoading"
        @click="handleGridGenerate"
      >
        <Grid3x3 v-if="!gridLoading" :size="12" />
        {{ gridImage ? '重新生成九宫格' : '九宫格概览' }}
      </BaseButton>
      <BaseButton
        variant="outline"
        size="sm"
        class="h-7 px-2 text-xs"
        :loading="shotBatchLoading"
        :disabled="gridLoading || shotBatchLoading"
        @click="handleShotBatch"
      >
        <Film v-if="!shotBatchLoading" :size="12" />
        逐镜头分镜
      </BaseButton>

      <span class="mx-0.5 h-4 w-px bg-border/60" />

      <BaseButton
        variant="ghost"
        size="sm"
        class="h-7 px-2 text-xs"
        :loading="seedanceLoading"
        :disabled="seedanceLoading"
        @click="handleSeedance"
      >
        <Languages v-if="!seedanceLoading" :size="12" />
        转为Seedance提示词
      </BaseButton>

      <span class="mx-0.5 h-4 w-px bg-border/60" />

      <BaseButton
        variant="outline"
        size="sm"
        class="h-7 px-2 text-xs"
        :loading="scoreLoading"
        :disabled="scoreLoading"
        @click="handleScore"
      >
        <BarChart3 v-if="!scoreLoading" :size="12" />
        {{ score ? '重新评分' : 'AI 评分' }}
      </BaseButton>
    </div>

    <!-- 九宫格生图错误提示 -->
    <div
      v-if="gridError"
      class="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
    >
      <AlertCircle :size="12" />
      {{ gridError }}
    </div>

    <!-- 评分卡片 -->
    <ScoreCard v-if="score || scoreLoading" :score="score" :loading="scoreLoading" />

    <!-- 九宫格结果预览 -->
    <div v-if="gridImage" class="rounded-md border border-border/40 bg-muted/20 p-2">
      <div class="mb-1.5 text-xs font-medium text-muted-foreground">九宫格分镜概览</div>
      <img
        :src="gridImage.url"
        alt="九宫格分镜概览"
        class="w-full cursor-pointer rounded-md border border-border/30 transition-opacity hover:opacity-90"
        @click="gridPreviewOpen = true"
      />
      <ImagePreview
        v-if="gridPreviewOpen"
        :url="gridImage.url"
        @close="gridPreviewOpen = false"
      />
    </div>
  </div>
</template>

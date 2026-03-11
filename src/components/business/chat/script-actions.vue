<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import ScoreCard from './score-card.vue'
import { Languages, BarChart3 } from 'lucide-vue-next'
import ExportMenu from './export-menu.vue'
import { useScriptExport } from '@/composables/use-script-export'
import { useScriptScore } from '@/composables/use-script-score'
import { useToast } from '@/composables/use-toast'

const props = defineProps<{
  scriptText: string
  gameName: string
}>()

const { convertToSeedance } = useScriptExport()
const { showToast } = useToast()

const { loading: scoreLoading, score, scoreScript, optimizeScript } = useScriptScore()

const seedanceLoading = ref(false)

async function handleScore() {
  if (scoreLoading.value) return
  await scoreScript(props.scriptText)
  if (score.value) {
    showToast('脚本评分完成', 'success')
  }
}

async function handleOptimize(suggestions: string[]) {
  await optimizeScript(props.scriptText, suggestions)
  if (suggestions.length > 1) {
    showToast('已发起一键优化，请在聊天窗口查看', 'success')
  } else {
    showToast('已发起单条优化，请在聊天窗口查看', 'success')
  }
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

    <!-- 评分卡片 -->
    <ScoreCard
      v-if="score || scoreLoading"
      :score="score"
      :loading="scoreLoading"
      :original-script="scriptText"
      @optimize="handleOptimize"
    />

  </div>
</template>

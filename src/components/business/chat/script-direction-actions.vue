<script setup lang="ts">
import BaseButton from '@/components/ui/base-button.vue'
import { FileText } from 'lucide-vue-next'
import { useVideoAnalysis } from '@/composables/use-video-analysis'
import { useChatStore } from '@/stores/chat-store'
import { GenerationStatus } from '@/models/enums'
import { computed } from 'vue'

const { generateDetailedScript } = useVideoAnalysis()
const chatStore = useChatStore()

const busy = computed(() => chatStore.status === GenerationStatus.Generating)

const directions = [
  { number: 1, label: '方向一' },
  { number: 2, label: '方向二' },
  { number: 3, label: '方向三' },
] as const

function handleSelect(directionNumber: number) {
  generateDetailedScript(directionNumber)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5 pt-2">
    <span class="mr-1 text-xs text-muted-foreground">选择方向生成完整脚本：</span>
    <BaseButton
      v-for="d in directions"
      :key="d.number"
      variant="outline"
      size="sm"
      class="h-7 px-3 text-xs"
      :disabled="busy"
      @click="handleSelect(d.number)"
    >
      <FileText :size="12" />
      {{ d.label }}
    </BaseButton>
  </div>
</template>

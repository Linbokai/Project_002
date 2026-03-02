<script setup lang="ts">
import { ref } from 'vue'
import { ImagePlus, Loader2, RefreshCw, AlertCircle } from 'lucide-vue-next'
import { useShotImage } from '@/composables/use-shot-image'
import ImagePreview from './image-preview.vue'

const props = defineProps<{
  shotKey: string
  scriptKey: string
  sceneText: string
  scriptContent: string
}>()

const { image, loading, error, generate } = useShotImage(props.scriptKey, props.shotKey)

const previewOpen = ref(false)

function handleGenerate() {
  generate(props.sceneText, props.scriptContent)
}
</script>

<template>
  <div class="mt-1">
    <div v-if="loading" class="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 :size="12" class="animate-spin" />
      <span>生成中...</span>
    </div>

    <div v-else-if="error" class="flex items-center gap-1.5 text-xs text-destructive">
      <AlertCircle :size="12" />
      <span>{{ error }}</span>
      <button
        class="ml-1 underline hover:no-underline"
        @click="handleGenerate"
      >
        重试
      </button>
    </div>

    <div v-else-if="image" class="mt-1.5">
      <div class="group relative inline-block">
        <img
          :src="image.url"
          alt="分镜参考图"
          class="max-h-48 cursor-pointer rounded-md border border-border object-cover shadow-sm transition-shadow hover:shadow-md"
          @click="previewOpen = true"
        />
        <button
          class="absolute right-1 top-1 rounded-md bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          title="重新生成"
          @click="handleGenerate"
        >
          <RefreshCw :size="12" />
        </button>
      </div>
      <ImagePreview
        v-if="previewOpen"
        :url="image.url"
        @close="previewOpen = false"
      />
    </div>

    <button
      v-else
      class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      title="为此画面生成参考图"
      @click="handleGenerate"
    >
      <ImagePlus :size="12" />
      生图
    </button>
  </div>
</template>

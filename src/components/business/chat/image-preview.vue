<script setup lang="ts">
import { X, Download } from 'lucide-vue-next'
import BaseButton from '@/components/ui/base-button.vue'

defineProps<{
  url: string
}>()

const emit = defineEmits<{
  close: []
}>()

function handleDownload(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = `scene-${Date.now()}.png`
  link.click()
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="relative max-h-[90vh] max-w-[90vw]">
        <img
          :src="url"
          alt="预览图片"
          class="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
        />
        <div class="absolute right-2 top-2 flex gap-1">
          <BaseButton
            variant="secondary"
            size="icon"
            title="下载图片"
            @click="handleDownload(url)"
          >
            <Download :size="16" />
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="icon"
            title="关闭预览"
            @click="emit('close')"
          >
            <X :size="16" />
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

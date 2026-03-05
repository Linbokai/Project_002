<script setup lang="ts">
import type { Component } from 'vue'
import { ref } from 'vue'
import { X, Zap, Shuffle, Palette, Anchor, Layers } from 'lucide-vue-next'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import type { ViralDirection } from '@/services/helpers/viral-prompt-builder'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [script: string, direction: ViralDirection, count: number]
}>()

const originalScript = ref('')
const direction = ref<ViralDirection>('mixed')
const count = ref(3)

const directions: {
  value: ViralDirection
  label: string
  icon: Component
  desc: string
}[] = [
  { value: 'theme', label: '换主题', icon: Shuffle, desc: '保留结构，替换主题方向' },
  { value: 'style', label: '换风格', icon: Palette, desc: '保留主题，替换叙事风格' },
  { value: 'hook', label: '换钩子', icon: Anchor, desc: '保留主体，替换开头钩子' },
  { value: 'mixed', label: '混合裂变', icon: Layers, desc: '综合调整，最大差异化' },
]

function handleSubmit() {
  if (!originalScript.value.trim()) return
  emit('submit', originalScript.value, direction.value, count.value)
  emit('close')
  originalScript.value = ''
}
</script>

<template>
  <BaseDialog :open="open" size="lg" @close="emit('close')">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Zap :size="20" class="text-brand" />
          <h2 class="text-lg font-semibold">爆款裂变</h2>
        </div>
        <button
          type="button"
          class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          @click="emit('close')"
        >
          <X :size="18" />
        </button>
      </div>
      <p class="text-sm text-muted-foreground">
        粘贴一个爆款脚本，AI 分析其成功要素后生成多个裂变变体
      </p>
    </template>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium">原始爆款脚本</label>
        <BaseTextarea
          v-model="originalScript"
          placeholder="粘贴竞品或自家的爆款脚本内容…"
          :rows="6"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium">裂变方向</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="d in directions"
            :key="d.value"
            type="button"
            class="flex items-start gap-2 rounded-lg border p-3 text-left transition-all"
            :class="
              direction === d.value
                ? 'border-brand bg-brand/5'
                : 'border-border hover:border-brand/30'
            "
            @click="direction = d.value"
          >
            <component
              :is="d.icon"
              :size="16"
              class="mt-0.5 shrink-0"
              :class="
                direction === d.value ? 'text-brand' : 'text-muted-foreground'
              "
            />
            <div>
              <div class="text-sm font-medium">{{ d.label }}</div>
              <div class="text-[11px] text-muted-foreground">{{ d.desc }}</div>
            </div>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium">变体数量</label>
        <div class="flex gap-2">
          <BaseButton
            v-for="n in [2, 3, 5]"
            :key="n"
            :variant="count === n ? 'brand' : 'outline'"
            size="sm"
            @click="count = n"
          >
            {{ n }} 个
          </BaseButton>
        </div>
      </div>

      <BaseButton
        variant="brand"
        :disabled="!originalScript.trim()"
        class="w-full"
        @click="handleSubmit"
      >
        <Zap :size="14" />
        开始裂变
      </BaseButton>
    </div>
  </BaseDialog>
</template>

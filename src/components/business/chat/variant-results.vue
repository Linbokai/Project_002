<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, Loader2, AlertCircle, Sparkles } from 'lucide-vue-next'
import ScriptShotRenderer from '@/components/business/chat/script-shot-renderer.vue'
import MarkdownContent from '@/components/ui/markdown-content.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseBadge from '@/components/ui/base-badge.vue'
import type { ScriptVariant } from '@/models/types/variant'

const props = defineProps<{
  variants: ScriptVariant[]
  messageTimestamp?: number
}>()

const emit = defineEmits<{
  select: [variantId: string]
}>()

const activeTab = ref(0)

const activeVariant = computed(() => props.variants[activeTab.value])

const hasScript = computed(() => {
  const c = activeVariant.value?.content ?? ''
  return c.includes('##') || c.includes('镜头') || c.includes('画面')
})

watch(
  () => props.variants.length,
  () => {
    if (activeTab.value >= props.variants.length) {
      activeTab.value = 0
    }
  },
)
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-border/60 bg-card/80">
    <!-- Tab 栏 -->
    <div class="flex items-center gap-1 border-b border-border/40 bg-muted/20 px-3 py-1.5">
      <Sparkles :size="14" class="mr-1 text-brand" />
      <button
        v-for="(variant, idx) in variants"
        :key="variant.id"
        :class="[
          'relative rounded-md px-3 py-1.5 text-xs font-medium transition-all',
          activeTab === idx
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="activeTab = idx"
      >
        <span class="flex items-center gap-1.5">
          {{ variant.label }}
          <Loader2
            v-if="variant.generating"
            :size="12"
            class="animate-spin text-brand"
          />
          <AlertCircle
            v-else-if="variant.error"
            :size="12"
            class="text-destructive"
          />
        </span>
      </button>
    </div>

    <!-- 内容区 -->
    <div v-if="activeVariant" class="p-4">
      <!-- 角度标签 -->
      <div class="mb-3 flex items-center gap-2">
        <BaseBadge variant="brand">{{ activeVariant.angle }}</BaseBadge>
        <span class="text-xs text-muted-foreground">{{ activeVariant.label }}</span>
      </div>

      <!-- 加载态 -->
      <div
        v-if="activeVariant.generating && !activeVariant.content"
        class="space-y-3 py-6"
      >
        <div class="mx-auto flex flex-col items-center gap-3">
          <Loader2 :size="24" class="animate-spin text-brand" />
          <span class="text-sm text-muted-foreground">正在生成{{ activeVariant.label }}...</span>
        </div>
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted/60" />
          <div class="h-4 w-5/6 animate-pulse rounded bg-muted/60" />
          <div class="h-4 w-4/6 animate-pulse rounded bg-muted/60" />
        </div>
      </div>

      <!-- 错误态 -->
      <div
        v-else-if="activeVariant.error"
        class="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-4"
      >
        <AlertCircle :size="18" class="mt-0.5 shrink-0 text-destructive" />
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium text-destructive">生成失败</span>
          <span class="text-sm text-muted-foreground">{{ activeVariant.error }}</span>
        </div>
      </div>

      <!-- 脚本内容 -->
      <template v-else-if="activeVariant.content">
        <ScriptShotRenderer
          v-if="hasScript && messageTimestamp"
          :content="activeVariant.content"
          :message-timestamp="messageTimestamp"
        />
        <MarkdownContent v-else :content="activeVariant.content" />

        <!-- 流式生成中的指示 -->
        <div
          v-if="activeVariant.generating"
          class="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Loader2 :size="12" class="animate-spin" />
          生成中...
        </div>
      </template>

      <!-- 底部操作 -->
      <div
        v-if="!activeVariant.generating && activeVariant.content && !activeVariant.error"
        class="mt-4 flex items-center justify-end border-t border-border/40 pt-3"
      >
        <BaseButton
          variant="brand"
          size="sm"
          @click="emit('select', activeVariant.id)"
        >
          <Check :size="14" />
          选择此变体
        </BaseButton>
      </div>
    </div>
  </div>
</template>

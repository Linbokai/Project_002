<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight, ImagePlus, Loader2, Pencil } from 'lucide-vue-next'
import { parseFrames } from '@/services/helpers/frame-parser'
import { useImageStore } from '@/stores/image-store'
import { useShotImage } from '@/composables/use-shot-image'
import ShotImageBlock from './shot-image-block.vue'
import BaseButton from '@/components/ui/base-button.vue'

const props = defineProps<{
  content: string
  messageTimestamp: number
}>()

const imageStore = useImageStore()
const scriptKey = computed(() => String(props.messageTimestamp))
const shots = computed(() => parseFrames(props.content))

const contextExpanded = ref(false)
const contextEditing = ref(false)
const contextDraft = ref('')

const visualContext = computed(() => imageStore.getContext(scriptKey.value))
const contextLoading = computed(() => imageStore.isContextLoading(scriptKey.value))

function startEditContext() {
  contextDraft.value = visualContext.value?.text ?? ''
  contextEditing.value = true
  contextExpanded.value = true
}

function saveContext() {
  if (!contextDraft.value.trim()) return
  imageStore.setContext(scriptKey.value, {
    text: contextDraft.value.trim(),
    extractedAt: Date.now(),
    isEdited: true,
  })
  contextEditing.value = false
}

function cancelEditContext() {
  contextEditing.value = false
}

const batchGenerating = ref(false)

async function generateAll() {
  if (batchGenerating.value) return
  batchGenerating.value = true

  for (const shot of shots.value) {
    if (!shot.scene) continue
    const shotKey = `${scriptKey.value}-${shot.id}`
    if (imageStore.getImage(shotKey)) continue

    const { generate } = useShotImage(scriptKey.value, shotKey)
    await generate(shot.scene, props.content)
  }

  batchGenerating.value = false
}

function shotKey(shotId: number): string {
  return `${scriptKey.value}-${shotId}`
}

const fieldLabels: Record<string, string> = {
  voiceover: '台词',
  textOverlay: '字幕',
  camera: '镜头',
  transition: '转场',
  sfx: '音效',
  notes: '备注',
}
</script>

<template>
  <div class="space-y-0.5">
    <!-- 视觉设定 -->
    <div
      v-if="visualContext || contextLoading"
      class="mb-3 rounded-md border border-border/60 bg-muted/20"
    >
      <button
        class="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        @click="contextExpanded = !contextExpanded"
      >
        <ChevronDown v-if="contextExpanded" :size="12" />
        <ChevronRight v-else :size="12" />
        视觉设定
        <Loader2 v-if="contextLoading" :size="12" class="ml-1 animate-spin" />
        <button
          v-if="visualContext && !contextEditing"
          class="ml-auto rounded p-0.5 hover:bg-accent"
          title="编辑视觉设定"
          @click.stop="startEditContext"
        >
          <Pencil :size="11" />
        </button>
      </button>

      <div v-if="contextExpanded" class="border-t border-border/40 px-3 py-2">
        <template v-if="contextEditing">
          <textarea
            v-model="contextDraft"
            class="w-full resize-y rounded-md border border-input bg-background px-2 py-1.5 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
            rows="6"
          />
          <div class="mt-1.5 flex gap-1.5">
            <BaseButton size="sm" variant="brand" class="h-6 px-2 text-xs" @click="saveContext">
              保存
            </BaseButton>
            <BaseButton size="sm" variant="ghost" class="h-6 px-2 text-xs" @click="cancelEditContext">
              取消
            </BaseButton>
          </div>
        </template>
        <pre
          v-else-if="visualContext"
          class="whitespace-pre-wrap text-xs leading-relaxed text-foreground/80"
        >{{ visualContext.text }}</pre>
      </div>
    </div>

    <!-- 分镜列表 -->
    <div
      v-for="shot in shots"
      :key="shot.id"
      class="rounded-md border border-border/40 bg-card/50 px-3 py-2.5"
    >
      <!-- 时间 + 段名 -->
      <div class="mb-1.5 flex items-baseline gap-2">
        <span v-if="shot.timeRange" class="text-xs font-mono font-semibold text-brand">
          {{ shot.timeRange }}
        </span>
        <span class="text-xs font-medium text-foreground">
          {{ shot.segment }}
        </span>
      </div>

      <!-- 画面 + 生图 -->
      <div v-if="shot.scene" class="mb-1">
        <div class="flex items-start gap-1">
          <span class="shrink-0 text-xs font-medium text-muted-foreground">画面:</span>
          <span class="text-xs leading-relaxed text-foreground">{{ shot.scene }}</span>
        </div>
        <ShotImageBlock
          :shot-key="shotKey(shot.id)"
          :script-key="scriptKey"
          :scene-text="shot.scene"
          :script-content="content"
        />
      </div>

      <!-- 其他字段 -->
      <template v-for="(label, field) in fieldLabels" :key="field">
        <div
          v-if="(shot as Record<string, unknown>)[field]"
          class="flex items-start gap-1"
        >
          <span class="shrink-0 text-xs font-medium text-muted-foreground">{{ label }}:</span>
          <span class="text-xs leading-relaxed text-foreground">
            {{ (shot as Record<string, unknown>)[field] }}
          </span>
        </div>
      </template>
    </div>

    <!-- 一键全部生图 -->
    <div class="flex items-center gap-2 pt-2">
      <BaseButton
        variant="outline"
        size="sm"
        class="h-7 gap-1 px-2.5 text-xs"
        :loading="batchGenerating"
        :disabled="batchGenerating"
        @click="generateAll"
      >
        <ImagePlus :size="12" />
        一键全部生图
      </BaseButton>
    </div>
  </div>
</template>

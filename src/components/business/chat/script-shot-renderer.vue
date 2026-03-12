<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight, Loader2, Pencil, X, Upload, User, Palette, LayoutGrid, RefreshCw, AlertCircle } from 'lucide-vue-next'
import { parseFrames } from '@/services/helpers/frame-parser'
import { useImageStore } from '@/stores/image-store'
import BaseButton from '@/components/ui/base-button.vue'
import ScriptViewSwitcher from './script-view-switcher.vue'
import ScriptTableView from './script-table-view.vue'
import ScriptTimelineView from './script-timeline-view.vue'
import ShotImageBlock from './shot-image-block.vue'
import MarkdownContent from '@/components/ui/markdown-content.vue'
import type { ReferenceImage, ReferenceImageType } from '@/models/types'
import { useConfigStore } from '@/stores/config-store'
import { ProductionDirection } from '@/models/enums'
import { useStoryboardGrid } from '@/composables/use-storyboard-grid'

const props = defineProps<{
  content: string
  messageTimestamp: number
}>()

const imageStore = useImageStore()
const configStore = useConfigStore()
const scriptKey = computed(() => String(props.messageTimestamp))
const isUeDirection = computed(() => configStore.config.direction === ProductionDirection.UeGameplay)

const { gridImage, loading: gridLoading, error: gridError, generateGrid } = useStoryboardGrid(scriptKey.value)

// 将策划简案与分镜脚本两部分拆分，避免策划内容被当成分镜解析
const STORYBOARD_SPLIT_RE = /(?:\*{0,2}第二部分[：:]\s*分镜脚本\*{0,2}|##\s*第二部分[：:]\s*分镜脚本|##\s*分镜脚本)/i
const splitContent = computed(() => {
  const m = props.content.match(STORYBOARD_SPLIT_RE)
  if (!m || m.index === undefined) return { planning: '', storyboard: props.content }
  return {
    planning: props.content.slice(0, m.index).trim(),
    storyboard: props.content.slice(m.index).trim(),
  }
})
const shots = computed(() => parseFrames(splitContent.value.storyboard))

const contextExpanded = ref(false)
const contextEditing = ref(false)
const contextDraft = ref('')
const characterImagesDraft = ref<ReferenceImage[]>([])
const styleImagesDraft = ref<ReferenceImage[]>([])

const characterInputRef = ref<HTMLInputElement | null>(null)
const styleInputRef = ref<HTMLInputElement | null>(null)

const visualContext = computed(() => imageStore.getContext(scriptKey.value))
const contextLoading = computed(() => imageStore.isContextLoading(scriptKey.value))

function startEditContext() {
  contextDraft.value = visualContext.value?.text ?? ''
  characterImagesDraft.value = [...(visualContext.value?.characterImages ?? [])]
  styleImagesDraft.value = [...(visualContext.value?.styleImages ?? [])]
  contextEditing.value = true
  contextExpanded.value = true
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFileUpload(files: FileList | null, type: ReferenceImageType) {
  if (!files?.length) return
  const target = type === 'character' ? characterImagesDraft : styleImagesDraft

  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const url = await fileToDataUrl(file)
    target.value.push({ url, name: file.name, type })
  }
}

function removeImage(type: ReferenceImageType, index: number) {
  const target = type === 'character' ? characterImagesDraft : styleImagesDraft
  target.value.splice(index, 1)
}

function saveContext() {
  if (!contextDraft.value.trim()) return
  imageStore.setContext(scriptKey.value, {
    text: contextDraft.value.trim(),
    extractedAt: Date.now(),
    isEdited: true,
    characterImages: [...characterImagesDraft.value],
    styleImages: [...styleImagesDraft.value],
  })
  contextEditing.value = false
  imageStore.persistToSession()
}

function cancelEditContext() {
  contextEditing.value = false
}

const activeView = ref<'cards' | 'table' | 'timeline'>('cards')

const fieldLabels = computed<Record<string, string>>(() =>
  isUeDirection.value
    ? { textOverlay: '字幕', camera: '镜头', vfx: '游戏反馈', transition: '转场', sfx: '音效', notes: '玩家操作' }
    : { textOverlay: '字幕', camera: '镜头', vfx: '特效', transition: '转场', sfx: '音效', notes: '备注' }
)

</script>

<template>
  <div class="space-y-2">
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

          <!-- 角色外观参考图 -->
          <div class="mt-3">
            <div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <User :size="12" />
              角色外观参考图
            </div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(img, idx) in characterImagesDraft"
                :key="`char-${idx}`"
                class="group relative"
              >
                <img
                  :src="img.url"
                  :alt="img.name"
                  class="h-16 w-16 rounded-md border border-border object-cover"
                />
                <button
                  class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  @click="removeImage('character', idx)"
                >
                  <X :size="10" />
                </button>
              </div>
              <button
                class="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-border/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                @click="characterInputRef?.click()"
              >
                <Upload :size="14" />
                <span class="text-[10px]">上传</span>
              </button>
              <input
                ref="characterInputRef"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileUpload(($event.target as HTMLInputElement).files, 'character')"
              />
            </div>
          </div>

          <!-- 画面风格参考图 -->
          <div class="mt-3">
            <div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Palette :size="12" />
              画面风格参考图
            </div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(img, idx) in styleImagesDraft"
                :key="`style-${idx}`"
                class="group relative"
              >
                <img
                  :src="img.url"
                  :alt="img.name"
                  class="h-16 w-16 rounded-md border border-border object-cover"
                />
                <button
                  class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  @click="removeImage('style', idx)"
                >
                  <X :size="10" />
                </button>
              </div>
              <button
                class="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-border/60 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                @click="styleInputRef?.click()"
              >
                <Upload :size="14" />
                <span class="text-[10px]">上传</span>
              </button>
              <input
                ref="styleInputRef"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileUpload(($event.target as HTMLInputElement).files, 'style')"
              />
            </div>
          </div>

          <div class="mt-2.5 flex gap-1.5">
            <BaseButton size="sm" variant="brand" class="h-6 px-2 text-xs" @click="saveContext">
              保存
            </BaseButton>
            <BaseButton size="sm" variant="ghost" class="h-6 px-2 text-xs" @click="cancelEditContext">
              取消
            </BaseButton>
          </div>
        </template>

        <template v-else-if="visualContext">
          <pre class="whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">{{ visualContext.text }}</pre>

          <!-- 只读模式展示已上传图片 -->
          <div
            v-if="visualContext.characterImages?.length"
            class="mt-2.5"
          >
            <div class="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <User :size="11" />
              角色外观
            </div>
            <div class="flex flex-wrap gap-1.5">
              <img
                v-for="(img, idx) in visualContext.characterImages"
                :key="`char-ro-${idx}`"
                :src="img.url"
                :alt="img.name"
                class="h-14 w-14 rounded border border-border/60 object-cover"
              />
            </div>
          </div>

          <div
            v-if="visualContext.styleImages?.length"
            class="mt-2.5"
          >
            <div class="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Palette :size="11" />
              画面风格
            </div>
            <div class="flex flex-wrap gap-1.5">
              <img
                v-for="(img, idx) in visualContext.styleImages"
                :key="`style-ro-${idx}`"
                :src="img.url"
                :alt="img.name"
                class="h-14 w-14 rounded border border-border/60 object-cover"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 玩法策划简案（仅当有策划内容时显示） -->
    <div v-if="splitContent.planning" class="mb-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <p class="mb-1.5 text-[11px] font-medium text-muted-foreground">玩法策划简案</p>
      <MarkdownContent :content="splitContent.planning" class="text-sm" />
    </div>

    <!-- 视图切换 -->
    <div class="flex items-center justify-between mb-1">
      <span class="text-[11px] text-muted-foreground">分镜 ({{ shots.length }})</span>
      <ScriptViewSwitcher v-model:active-view="activeView" />
    </div>

    <!-- 表格视图 -->
    <ScriptTableView v-if="activeView === 'table'" :shots="shots" />

    <!-- 时间轴视图 -->
    <ScriptTimelineView v-if="activeView === 'timeline'" :shots="shots" />

    <!-- 卡片视图（默认） -->
    <template v-if="activeView === 'cards'">
    <div class="divide-y divide-border/40">
      <div
        v-for="(shot, idx) in shots"
        :key="shot.id"
        class="py-3 first:pt-0"
      >
        <!-- 头部：编号 + 时间 + 段名 ———— 景别 -->
        <div class="mb-2 flex items-center gap-2">
          <span class="shrink-0 text-xs font-bold text-brand">{{ idx + 1 }}</span>
          <span
            v-if="shot.timeRange"
            class="shrink-0 font-mono text-xs font-semibold text-brand/80"
          >
            {{ shot.timeRange }}
          </span>
          <span class="text-sm font-medium text-foreground">
            {{ shot.segment }}
          </span>
          <span class="flex-1 border-b border-border/30" />
          <span
            v-if="shot.scale"
            class="shrink-0 text-xs text-muted-foreground"
          >
            {{ shot.scale }}
          </span>
        </div>

        <!-- 字段列表 -->
        <div class="space-y-1">
          <div v-if="shot.scene" class="flex items-start gap-1.5">
            <span class="shrink-0 text-sm font-medium text-muted-foreground">画面:</span>
            <span class="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{{ shot.scene }}</span>
          </div>
          <div v-if="shot.voiceover" class="flex items-start gap-1.5">
            <span class="shrink-0 text-sm font-medium text-muted-foreground">台词:</span>
            <span class="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{{ shot.voiceover }}</span>
          </div>
          <template v-for="(label, field) in fieldLabels" :key="field">
            <div
              v-if="(shot as unknown as Record<string, unknown>)[field]"
              class="flex items-start gap-1.5"
            >
              <span class="shrink-0 text-sm font-medium text-muted-foreground">{{ label }}:</span>
              <span class="text-sm leading-relaxed text-foreground">
                {{ (shot as unknown as Record<string, unknown>)[field] }}
              </span>
            </div>
          </template>
        </div>
        <ShotImageBlock
          v-if="isUeDirection && shot.scene"
          :shot-key="String(shot.id)"
          :script-key="scriptKey"
          :scene-text="shot.scene"
          :script-content="content"
        />
      </div>
    </div>
    </template>

    <!-- 九宫格生图 -->
    <div v-if="isUeDirection" class="mt-3 border-t border-border/40 pt-3">
      <div v-if="gridLoading" class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 :size="12" class="animate-spin" />
        <span>九宫格生成中...</span>
      </div>
      <div v-else-if="gridError" class="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle :size="12" />
        <span>{{ gridError }}</span>
        <button class="ml-1 underline hover:no-underline" @click="generateGrid(content)">重试</button>
      </div>
      <div v-else-if="gridImage" class="space-y-1.5">
        <div class="group relative inline-block">
          <img
            :src="gridImage.url"
            alt="九宫格分镜概览"
            class="max-w-full rounded-md border border-border shadow-sm"
          />
          <button
            class="absolute right-1 top-1 rounded-md bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            title="重新生成"
            @click="generateGrid(content)"
          >
            <RefreshCw :size="12" />
          </button>
        </div>
      </div>
      <button
        v-else
        class="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        @click="generateGrid(content)"
      >
        <LayoutGrid :size="13" />
        九宫格生图
      </button>
    </div>

  </div>
</template>

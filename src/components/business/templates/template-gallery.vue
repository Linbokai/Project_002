<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Plus, Trash2, Search, TrendingUp } from 'lucide-vue-next'
import BaseDialog from '@/components/ui/base-dialog.vue'
import TemplateCard from './template-card.vue'
import { useTemplateStore } from '@/stores/template-store'
import type { ScriptTemplate, UserTemplate, TemplateCategory, GameCategory } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [template: ScriptTemplate | UserTemplate]
}>()

const templateStore = useTemplateStore()
const activeCategory = ref<TemplateCategory | 'custom'>('popular')
const activeGameCategory = ref<GameCategory | 'all'>('all')
const searchQuery = ref('')
const sortByUsage = ref(false)
const previewTemplate = ref<ScriptTemplate | null>(null)

const categoryTabs = [
  ...templateStore.categories,
  { id: 'custom' as const, label: '我的模板' },
]

const filteredTemplates = computed(() => {
  if (activeCategory.value === 'custom') return []

  if (searchQuery.value.trim()) {
    let results = templateStore.searchTemplates(searchQuery.value)
    if (activeCategory.value !== 'popular' || activeGameCategory.value !== 'all') {
      results = results.filter((t) => {
        const catMatch = activeCategory.value === 'popular' || t.category === activeCategory.value
        const gameMatch = activeGameCategory.value === 'all' || t.gameCategory === activeGameCategory.value
        return catMatch && gameMatch
      })
    }
    return results
  }

  const list = templateStore.getByCategoryAndGame(activeCategory.value, activeGameCategory.value)

  if (sortByUsage.value) {
    return [...list].sort(
      (a, b) => templateStore.getUsageCount(b.id) - templateStore.getUsageCount(a.id),
    )
  }
  return list
})

function handleApply(tpl: ScriptTemplate | UserTemplate) {
  if ('category' in tpl) {
    templateStore.trackUsage(tpl.id)
  }
  emit('apply', tpl)
  emit('close')
}

function showPreview(tpl: ScriptTemplate) {
  previewTemplate.value = tpl
}

function closePreview() {
  previewTemplate.value = null
}
</script>

<template>
  <BaseDialog :open="open" size="lg" @close="emit('close')">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">模板中心</h2>
        <button
          type="button"
          class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          @click="emit('close')"
        >
          <X :size="18" />
        </button>
      </div>
      <p class="text-sm text-muted-foreground">
        {{ templateStore.builtInTemplates.length }} 个专业模板覆盖主流品类，选择后一键填充配置
      </p>
    </template>

    <!-- Search Bar -->
    <div class="relative">
      <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索模板名称、描述…"
        class="w-full rounded-lg border border-border bg-muted/30 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-background"
      />
    </div>

    <!-- Category Tabs -->
    <div class="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5 overflow-x-auto">
      <button
        v-for="cat in categoryTabs"
        :key="cat.id"
        type="button"
        class="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap"
        :class="
          activeCategory === cat.id
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="activeCategory = cat.id; searchQuery = ''"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Game Category Filter + Sort -->
    <div v-if="activeCategory !== 'custom'" class="flex items-center gap-2 flex-wrap">
      <div class="flex gap-1 flex-1 overflow-x-auto">
        <button
          v-for="gc in templateStore.gameCategoryFilters"
          :key="gc.id"
          type="button"
          class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap border"
          :class="
            activeGameCategory === gc.id
              ? 'border-brand/40 bg-brand/10 text-brand'
              : 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground'
          "
          @click="activeGameCategory = gc.id"
        >
          {{ gc.label }}
        </button>
      </div>
      <button
        type="button"
        class="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors border"
        :class="
          sortByUsage
            ? 'border-brand/40 bg-brand/10 text-brand'
            : 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground'
        "
        @click="sortByUsage = !sortByUsage"
      >
        <TrendingUp :size="11" />
        按热度
      </button>
    </div>

    <!-- Template Grid -->
    <div class="max-h-[50vh] overflow-y-auto -mx-1 px-1">
      <template v-if="activeCategory !== 'custom'">
        <div class="grid grid-cols-2 gap-3">
          <TemplateCard
            v-for="tpl in filteredTemplates"
            :key="tpl.id"
            :template="tpl"
            :usage-count="templateStore.getUsageCount(tpl.id)"
            @apply="handleApply(tpl)"
            @preview="showPreview(tpl as ScriptTemplate)"
          />
        </div>
        <p
          v-if="filteredTemplates.length === 0"
          class="py-8 text-center text-sm text-muted-foreground"
        >
          {{ searchQuery ? '未找到匹配的模板' : '该分类暂无模板' }}
        </p>
      </template>

      <template v-else>
        <div v-if="templateStore.userTemplates.length" class="grid grid-cols-2 gap-3">
          <div v-for="tpl in templateStore.userTemplates" :key="tpl.id" class="relative group/user">
            <TemplateCard :template="tpl" :usage-count="0" @apply="handleApply(tpl)" />
            <button
              type="button"
              class="absolute top-2 right-2 rounded-md p-1 bg-background/80 text-muted-foreground opacity-0 group-hover/user:opacity-100 hover:text-destructive transition-all"
              title="删除模板"
              @click.stop="templateStore.removeUserTemplate(tpl.id)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
        <div v-else class="flex flex-col items-center gap-3 py-12 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Plus :size="24" class="text-muted-foreground" />
          </div>
          <p class="text-sm text-muted-foreground">还没有自定义模板</p>
          <p class="text-xs text-muted-foreground/70">在配置面板中点击「保存为模板」即可创建</p>
        </div>
      </template>
    </div>

    <!-- Preview Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="previewTemplate"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          @click.self="closePreview"
        >
          <div class="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ previewTemplate.icon }}</span>
                <h3 class="text-base font-semibold">{{ previewTemplate.name }}</h3>
              </div>
              <button
                type="button"
                class="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                @click="closePreview"
              >
                <X :size="16" />
              </button>
            </div>
            <p class="text-sm text-muted-foreground mb-3">{{ previewTemplate.description }}</p>
            <div v-if="previewTemplate.preview" class="rounded-lg bg-muted/50 p-3 mb-4">
              <p class="text-xs text-muted-foreground mb-1 font-medium">脚本预览</p>
              <p class="text-sm whitespace-pre-line leading-relaxed">{{ previewTemplate.preview }}</p>
            </div>
            <button
              type="button"
              class="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              @click="handleApply(previewTemplate!); closePreview()"
            >
              使用此模板
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </BaseDialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

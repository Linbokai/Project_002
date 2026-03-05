<script setup lang="ts">
import { ref } from 'vue'
import { X, Plus, Trash2 } from 'lucide-vue-next'
import BaseDialog from '@/components/ui/base-dialog.vue'
import TemplateCard from './template-card.vue'
import { useTemplateStore } from '@/stores/template-store'
import type { ScriptTemplate, UserTemplate, TemplateCategory } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [template: ScriptTemplate | UserTemplate]
}>()

const templateStore = useTemplateStore()
const activeCategory = ref<TemplateCategory | 'custom'>('popular')

const categoryTabs = [
  ...templateStore.categories,
  { id: 'custom' as const, label: '我的模板' },
]

function handleApply(tpl: ScriptTemplate | UserTemplate) {
  emit('apply', tpl)
  emit('close')
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
      <p class="text-sm text-muted-foreground">选择模板快速填充配置，或保存常用配置为自定义模板</p>
    </template>

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
        @click="activeCategory = cat.id"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Template Grid -->
    <div class="max-h-[50vh] overflow-y-auto -mx-1 px-1">
      <template v-if="activeCategory !== 'custom'">
        <div class="grid grid-cols-2 gap-3">
          <TemplateCard
            v-for="tpl in templateStore.getByCategory(activeCategory)"
            :key="tpl.id"
            :template="tpl"
            @apply="handleApply(tpl)"
          />
        </div>
        <p
          v-if="templateStore.getByCategory(activeCategory).length === 0"
          class="py-8 text-center text-sm text-muted-foreground"
        >
          该分类暂无模板
        </p>
      </template>

      <template v-else>
        <div v-if="templateStore.userTemplates.length" class="grid grid-cols-2 gap-3">
          <div v-for="tpl in templateStore.userTemplates" :key="tpl.id" class="relative group/user">
            <TemplateCard :template="tpl" @apply="handleApply(tpl)" />
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
  </BaseDialog>
</template>

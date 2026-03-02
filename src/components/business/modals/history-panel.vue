<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseBadge from '@/components/ui/base-badge.vue'
import { useHistoryStore } from '@/stores/history-store'
import { formatTime } from '@/utils'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  'load-session': [id: string]
}>()

const historyStore = useHistoryStore()

function handleLoadSession(id: string) {
  emit('load-session', id)
}

function handleDelete(e: Event, id: string) {
  e.stopPropagation()
  historyStore.removeSession(id)
}

function handleClearAll() {
  if (!window.confirm('确定清空全部历史记录吗？')) return
  historyStore.clearAll()
}

function truncate(text: string, maxLen: number) {
  if (!text) return ''
  return text.length <= maxLen ? text : text.slice(0, maxLen) + '...'
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold">历史记录</h2>
        <BaseBadge v-if="historyStore.sessions.length" variant="secondary">
          {{ historyStore.sessions.length }}
        </BaseBadge>
      </div>
    </template>

    <div class="flex flex-col gap-2">
      <div
        v-if="!historyStore.sessions.length"
        class="py-12 text-center text-sm text-muted-foreground"
      >
        暂无历史记录
      </div>
      <div
        v-for="session in historyStore.sessions"
        :key="session.id"
        class="group flex cursor-pointer flex-col gap-1.5 rounded-lg border p-3 transition-colors hover:bg-muted/50"
        @click="handleLoadSession(session.id)"
      >
        <div class="text-sm">
          {{ truncate(session.preview || session.messages?.[0]?.content || '', 60) }}
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ formatTime(session.createdAt) }}</span>
          <BaseBadge v-if="session.gameName" variant="secondary" class="shrink-0">
            {{ session.gameName }}
          </BaseBadge>
          <span v-if="session.themes" class="truncate">{{ session.themes }}</span>
        </div>
        <div class="mt-1 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
          <BaseButton
            variant="ghost"
            size="icon"
            class="text-destructive hover:bg-destructive/10 hover:text-destructive"
            @click="handleDelete($event, session.id)"
          >
            <Trash2 :size="14" />
          </BaseButton>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton
        v-if="historyStore.sessions.length"
        variant="outline"
        class="border-destructive text-destructive hover:bg-destructive/10"
        @click="handleClearAll"
      >
        清空全部
      </BaseButton>
      <BaseButton variant="outline" @click="emit('close')">关闭</BaseButton>
    </template>
  </BaseDialog>
</template>

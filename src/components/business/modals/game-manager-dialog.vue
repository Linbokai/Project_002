<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import BaseBadge from '@/components/ui/base-badge.vue'
import { useGameStore } from '@/stores/game-store'
import type { Game } from '@/models/types'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const gameStore = useGameStore()

const editingId = ref<string | null>(null)
const name = ref('')
const type = ref('')
const sell = ref('')
const targetMarket = ref('')
const mainCompetitors = ref('')
const launchedPlatforms = ref('')
const historicalHits = ref('')

const isAdding = computed(() => !editingId.value)
const isEditing = computed(() => !!editingId.value)

function parseSellToArray(s: string): string[] {
  return s.split(/[,，、\n]/).map((x) => x.trim()).filter(Boolean)
}

function selectGame(index: number) {
  gameStore.selectGame(index)
  cancelEdit()
}

function startEdit(game: Game) {
  editingId.value = game.id
  name.value = game.name
  type.value = game.type
  sell.value = game.coreSellingPoints.join('、')
  targetMarket.value = game.targetMarket ?? ''
  mainCompetitors.value = game.mainCompetitors ?? ''
  launchedPlatforms.value = game.launchedPlatforms ?? ''
  historicalHits.value = game.historicalHits ?? ''
}

function cancelEdit() {
  editingId.value = null
  name.value = ''
  type.value = ''
  sell.value = ''
  targetMarket.value = ''
  mainCompetitors.value = ''
  launchedPlatforms.value = ''
  historicalHits.value = ''
}

function handleAdd() {
  if (!name.value.trim()) return
  gameStore.addGame({
    name: name.value.trim(),
    type: type.value.trim(),
    coreSellingPoints: parseSellToArray(sell.value),
    targetMarket: targetMarket.value.trim() || undefined,
    mainCompetitors: mainCompetitors.value.trim() || undefined,
    launchedPlatforms: launchedPlatforms.value.trim() || undefined,
    historicalHits: historicalHits.value.trim() || undefined,
  })
  cancelEdit()
}

function handleUpdate() {
  if (!editingId.value || !name.value.trim()) return
  gameStore.updateGame(editingId.value, {
    name: name.value.trim(),
    type: type.value.trim(),
    coreSellingPoints: parseSellToArray(sell.value),
    targetMarket: targetMarket.value.trim() || undefined,
    mainCompetitors: mainCompetitors.value.trim() || undefined,
    launchedPlatforms: launchedPlatforms.value.trim() || undefined,
    historicalHits: historicalHits.value.trim() || undefined,
  })
  cancelEdit()
}

function handleDelete(game: Game) {
  if (!window.confirm(`确定删除游戏「${game.name}」吗？`)) return
  gameStore.removeGame(game.id)
  if (editingId.value === game.id) {
    cancelEdit()
  }
}

function truncate(text: string, maxLen: number) {
  if (!text) return ''
  return text.length <= maxLen ? text : text.slice(0, maxLen) + '...'
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">游戏库管理</h2>
    </template>

    <div class="flex flex-col gap-4">
      <div class="max-h-48 overflow-y-auto rounded-lg border">
        <div
          v-for="(game, idx) in gameStore.games"
          :key="game.id"
          :class="[
            'flex cursor-pointer items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0',
            'hover:bg-muted/50',
            gameStore.selectedIndex === idx
              ? 'border-brand bg-brand/5'
              : 'border-transparent'
          ]"
          @click="selectGame(idx)"
        >
          <div class="min-w-0 flex-1">
            <div class="font-medium">{{ game.name }}</div>
            <div class="mt-0.5 flex items-center gap-2">
              <BaseBadge variant="secondary">{{ game.type || '未分类' }}</BaseBadge>
              <span class="truncate text-sm text-muted-foreground">
                {{ truncate(game.coreSellingPoints.join('、'), 40) }}
              </span>
            </div>
          </div>
          <div class="flex shrink-0 gap-1">
            <BaseButton
              variant="ghost"
              size="icon"
              @click.stop="startEdit(game)"
            >
              <Pencil :size="16" />
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="icon"
              class="text-destructive hover:bg-destructive/10 hover:text-destructive"
              @click.stop="handleDelete(game)"
            >
              <Trash2 :size="16" />
            </BaseButton>
          </div>
        </div>
        <div
          v-if="!gameStore.games.length"
          class="px-4 py-8 text-center text-sm text-muted-foreground"
        >
          暂无游戏，请添加
        </div>
      </div>

      <div class="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
        <div class="text-sm font-medium">{{ isEditing ? '编辑游戏' : '添加游戏' }}</div>
        <p class="text-xs text-muted-foreground">填写越详细，AI 生成的脚本越贴合你的游戏</p>
        <div class="flex flex-col gap-3">
          <BaseInput v-model="name" placeholder="如：王者荣耀、明日方舟" />
          <BaseInput v-model="type" placeholder="如：MOBA、SLG、卡牌、RPG、休闲" />
          <BaseTextarea v-model="sell" placeholder="如：万人国战、自由交易、超多英雄可收集（多个用顿号或逗号分隔）" :rows="2" />
          <BaseInput v-model="targetMarket" placeholder="目标市场（如：国内二次元用户、海外欧美玩家）" />
          <BaseInput v-model="mainCompetitors" placeholder="主要竞品（如：原神、崩坏3）" />
          <BaseInput v-model="launchedPlatforms" placeholder="已投放平台（如：抖音、快手、Facebook）" />
          <BaseTextarea v-model="historicalHits" placeholder="历史爆款方向（如：曾经做过的爆款素材风格、题材）" :rows="2" />
          <div class="flex gap-2">
            <BaseButton
              v-if="isEditing"
              variant="brand"
              size="sm"
              @click="handleUpdate"
            >
              更新
            </BaseButton>
            <BaseButton
              v-if="isEditing"
              variant="outline"
              size="sm"
              @click="cancelEdit"
            >
              取消编辑
            </BaseButton>
            <BaseButton
              v-if="isAdding"
              variant="brand"
              size="sm"
              @click="handleAdd"
            >
              添加游戏
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="emit('close')">关闭</BaseButton>
    </template>
  </BaseDialog>
</template>

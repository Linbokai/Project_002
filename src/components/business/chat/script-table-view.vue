<script setup lang="ts">
import { computed } from 'vue'
import type { Shot } from '@/models/types'

const props = defineProps<{
  shots: Shot[]
}>()

interface ColumnDef {
  key: keyof Shot
  label: string
  priority: 'high' | 'low'
  mono?: boolean
  italic?: boolean
}

const allColumns: ColumnDef[] = [
  { key: 'id', label: '镜号', priority: 'high', mono: true },
  { key: 'timeRange', label: '时间', priority: 'low', mono: true },
  { key: 'segment', label: '段落', priority: 'low' },
  { key: 'scale', label: '景别', priority: 'low' },
  { key: 'scene', label: '画面描述', priority: 'high' },
  { key: 'voiceover', label: '台词', priority: 'high', italic: true },
  { key: 'textOverlay', label: '字幕', priority: 'low' },
  { key: 'camera', label: '镜头', priority: 'low' },
  { key: 'vfx', label: '特效', priority: 'low' },
  { key: 'transition', label: '转场', priority: 'low' },
  { key: 'sfx', label: '音效', priority: 'low' },
  { key: 'notes', label: '备注', priority: 'low' },
]

const visibleColumns = computed(() =>
  allColumns.filter((col) =>
    props.shots.some((shot) => {
      const val = shot[col.key]
      return val !== undefined && val !== null && val !== ''
    }),
  ),
)
</script>

<template>
  <div class="overflow-x-auto rounded-md border border-border/40">
    <table class="w-full text-xs">
      <thead>
        <tr class="border-b border-border/60 bg-muted/40">
          <th
            v-for="col in visibleColumns"
            :key="col.key"
            class="whitespace-nowrap px-2.5 py-2 text-left font-medium text-muted-foreground"
            :class="[
              col.priority === 'low' && 'hidden sm:table-cell',
              col.key === 'scene' || col.key === 'voiceover' ? 'min-w-[140px]' : '',
            ]"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(shot, idx) in shots"
          :key="shot.id"
          class="border-b border-border/20 transition-colors hover:bg-muted/20"
          :class="idx % 2 === 1 ? 'bg-muted/10' : ''"
        >
          <td
            v-for="col in visibleColumns"
            :key="col.key"
            class="px-2.5 py-2 align-top text-foreground"
            :class="[
              col.priority === 'low' && 'hidden sm:table-cell',
              col.mono && 'font-mono text-brand',
              col.italic && 'italic',
              (col.key === 'scene' || col.key === 'voiceover') && 'max-w-[280px]',
            ]"
          >
            <span class="line-clamp-3 whitespace-pre-wrap leading-relaxed">
              {{ shot[col.key] }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

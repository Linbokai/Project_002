<script setup lang="ts">
import { computed } from 'vue'
import { Search, Star, List, Gamepad2, X } from 'lucide-vue-next'

const props = defineProps<{
  searchQuery: string
  filter: 'all' | 'favorited' | string
  gameNames: string[]
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:filter': [value: 'all' | 'favorited' | string]
}>()

const localQuery = computed({
  get: () => props.searchQuery,
  set: (val) => emit('update:searchQuery', val),
})

function setFilter(value: 'all' | 'favorited' | string) {
  emit('update:filter', value)
}

function clearSearch() {
  emit('update:searchQuery', '')
}

const isGameFilter = computed(
  () => props.filter !== 'all' && props.filter !== 'favorited',
)
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- search input -->
    <div class="relative">
      <Search
        :size="14"
        class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        v-model="localQuery"
        type="text"
        placeholder="搜索游戏、主题、内容…"
        class="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-8 text-xs shadow-xs transition-[color,border-color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand"
      />
      <button
        v-if="localQuery"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        @click="clearSearch"
      >
        <X :size="14" />
      </button>
    </div>

    <!-- filter buttons -->
    <div class="flex flex-wrap items-center gap-1.5">
      <button
        :class="[
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          filter === 'all'
            ? 'bg-brand/10 text-brand border border-brand/20'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        ]"
        @click="setFilter('all')"
      >
        <List :size="12" />
        全部
      </button>

      <button
        :class="[
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          filter === 'favorited'
            ? 'bg-brand/10 text-brand border border-brand/20'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        ]"
        @click="setFilter('favorited')"
      >
        <Star :size="12" />
        收藏
      </button>

      <span
        v-if="gameNames.length > 0"
        class="mx-0.5 h-3.5 w-px bg-border"
      />

      <button
        v-for="name in gameNames"
        :key="name"
        :class="[
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
          filter === name
            ? 'bg-brand/10 text-brand border border-brand/20'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        ]"
        @click="setFilter(name)"
      >
        <Gamepad2 :size="12" />
        {{ name }}
      </button>

      <button
        v-if="isGameFilter"
        class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground"
        @click="setFilter('all')"
      >
        <X :size="12" />
      </button>
    </div>
  </div>
</template>

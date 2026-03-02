<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import GameplaySearch from './gameplay-search.vue'
import GameplayPresets from './gameplay-presets.vue'
import AddGameplayForm from './add-gameplay-form.vue'
import GameplayCard from './gameplay-card.vue'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'
import { useConfigStore } from '@/stores/config-store'

const props = withDefaults(
  defineProps<{
    open: boolean
    initialView?: 'search' | 't1' | 't2' | 't3' | 'add'
  }>(),
  { initialView: 'search' }
)

const emit = defineEmits<{
  close: []
}>()

const gameplayRadarStore = useGameplayRadarStore()
const configStore = useConfigStore()

const totalSelected = computed(
  () => gameplayRadarStore.totalSelected + configStore.config.selectedGameplays.length,
)

function handleBackdropClick() {
  emit('close')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-40"
        aria-modal="true"
        role="dialog"
      >
        <div
          class="fixed inset-0 bg-black/20"
          aria-hidden="true"
          @click="handleBackdropClick"
        />
        <Transition name="slide-left">
          <div
            v-if="open"
            class="fixed left-12 top-0 bottom-0 z-50 flex w-[280px] flex-col border-r border-border bg-card shadow-lg"
          >
            <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <h2 class="text-sm font-medium">
                {{
                  initialView === 'search'
                    ? '搜索玩法'
                    : initialView === 'add'
                      ? '添加玩法'
                      : initialView === 't1'
                        ? 'T1 爆热'
                        : initialView === 't2'
                          ? 'T2 中热'
                          : 'T3 常青'
                }}
              </h2>
              <button
                type="button"
                class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="关闭"
                @click="handleClose"
              >
                <X :size="18" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="initialView === 'search'" class="space-y-4">
                <GameplaySearch />
                <div v-if="gameplayRadarStore.currentRegionResults.length" class="space-y-2">
                  <h3 class="text-sm font-medium text-muted-foreground">搜索结果</h3>
                  <div class="grid gap-2">
                    <GameplayCard
                      v-for="item in gameplayRadarStore.currentRegionResults"
                      :key="item.id"
                      :gameplay="item"
                      :selected="item.selected"
                      @toggle="gameplayRadarStore.toggleSearchResult(item.id)"
                    />
                  </div>
                </div>
              </div>
              <GameplayPresets
                v-else-if="initialView === 't1'"
                tier="T1"
              />
              <GameplayPresets
                v-else-if="initialView === 't2'"
                tier="T2"
              />
              <GameplayPresets
                v-else-if="initialView === 't3'"
                tier="T3"
              />
              <div v-else-if="initialView === 'add'" class="space-y-4">
                <AddGameplayForm />
                <div v-if="gameplayRadarStore.customGameplays.length" class="space-y-2">
                  <h3 class="text-sm font-medium text-muted-foreground">已添加</h3>
                  <div class="grid gap-2">
                    <GameplayCard
                      v-for="item in gameplayRadarStore.customGameplays"
                      :key="item.id"
                      :gameplay="item"
                      :selected="item.selected"
                      @toggle="gameplayRadarStore.toggleCustomGameplay(item.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
              已选 {{ totalSelected }} 个玩法
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.25s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>

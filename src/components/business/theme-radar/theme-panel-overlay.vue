<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import BaseToast from '@/components/ui/base-toast.vue'
import PlatformSelector from './platform-selector.vue'
import ThemeSearch from './theme-search.vue'
import PresetThemes from './preset-themes.vue'
import AddThemeForm from './add-theme-form.vue'
import ThemeCard from './theme-card.vue'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
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

const themeRadarStore = useThemeRadarStore()
const configStore = useConfigStore()

const totalSelected = computed(
  () => themeRadarStore.totalSelected + configStore.config.selectedThemes.length,
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
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/20"
          aria-hidden="true"
          @click="handleBackdropClick"
        />
        <!-- Panel -->
        <Transition name="slide-left">
          <div
            v-if="open"
            class="fixed left-12 top-0 bottom-0 z-50 flex w-[280px] flex-col border-r border-border bg-card shadow-lg"
          >
            <!-- Header -->
            <div class="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <h2 class="text-sm font-medium">
                {{
                  initialView === 'search'
                    ? '搜索热点'
                    : initialView === 'add'
                      ? '添加主题'
                      : initialView === 't1'
                        ? 'T1 高热'
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
            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4">
              <!-- Search view -->
              <div v-if="initialView === 'search'" class="space-y-4">
                <PlatformSelector />
                <ThemeSearch />
                <div v-if="themeRadarStore.searchResults.length" class="space-y-2">
                  <h3 class="text-sm font-medium text-muted-foreground">搜索结果</h3>
                  <div class="grid gap-2">
                    <ThemeCard
                      v-for="item in themeRadarStore.searchResults"
                      :key="item.id"
                      :theme="item"
                      :selected="item.selected"
                      @toggle="themeRadarStore.toggleSearchResult(item.id)"
                    />
                  </div>
                </div>
              </div>
              <!-- Preset tier views -->
              <PresetThemes
                v-else-if="initialView === 't1'"
                tier="T1"
              />
              <PresetThemes
                v-else-if="initialView === 't2'"
                tier="T2"
              />
              <PresetThemes
                v-else-if="initialView === 't3'"
                tier="T3"
              />
              <!-- Add custom theme -->
              <div v-else-if="initialView === 'add'" class="space-y-4">
                <AddThemeForm />
                <div v-if="themeRadarStore.customThemes.length" class="space-y-2">
                  <h3 class="text-sm font-medium text-muted-foreground">已添加</h3>
                  <div class="grid gap-2">
                    <ThemeCard
                      v-for="item in themeRadarStore.customThemes"
                      :key="item.id"
                      :theme="item"
                      :selected="item.selected"
                      @toggle="themeRadarStore.toggleCustomTheme(item.id)"
                    />
                  </div>
                </div>
              </div>
            </div>
            <!-- Footer -->
            <div class="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
              已选 {{ totalSelected }} 个主题
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

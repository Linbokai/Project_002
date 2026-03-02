<script setup lang="ts">
import BaseButton from '@/components/ui/base-button.vue'
import { RefreshCw, Anchor, User } from 'lucide-vue-next'
import { useChat } from '@/composables/use-chat'

withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  { disabled: false }
)

const { quickAction } = useChat()

function handleReroll() {
  quickAction('reroll')
}

function handleHooks() {
  quickAction('hooks')
}

function handleHero() {
  quickAction('hero')
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled"
      aria-label="换个方向"
      @click="handleReroll"
    >
      <RefreshCw :size="14" />
      换个方向
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled"
      aria-label="钩子推荐"
      @click="handleHooks"
    >
      <Anchor :size="14" />
      钩子推荐
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled"
      aria-label="推荐主角"
      @click="handleHero"
    >
      <User :size="14" />
      推荐主角
    </BaseButton>
  </div>
</template>

<style scoped>
</style>

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
      title="随机切换一个新的脚本创意方向"
      aria-label="换个创意角度"
      @click="handleReroll"
    >
      <RefreshCw :size="14" />
      换个创意角度
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled"
      title="推荐视频前3秒的注意力抓手"
      aria-label="推荐开头钩子"
      @click="handleHooks"
    >
      <Anchor :size="14" />
      推荐开头钩子
    </BaseButton>
    <BaseButton
      variant="ghost"
      size="sm"
      :disabled="disabled"
      title="推荐适合这个游戏的出镜人设"
      aria-label="推荐视频主角"
      @click="handleHero"
    >
      <User :size="14" />
      推荐视频主角
    </BaseButton>
  </div>
</template>

<style scoped>
</style>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import { useGameplayRadarStore } from '@/stores/gameplay-radar-store'

const gameplayRadarStore = useGameplayRadarStore()

const name = ref('')
const description = ref('')

function handleSubmit() {
  const trimmedName = name.value.trim()
  if (!trimmedName) return
  gameplayRadarStore.addCustomGameplay({
    name: trimmedName,
    description: description.value.trim(),
  })
  name.value = ''
  description.value = ''
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label class="mb-1 block text-sm font-medium">玩法名称</label>
      <BaseInput
        v-model="name"
        placeholder="输入玩法名称"
        required
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium">玩法描述</label>
      <BaseTextarea
        v-model="description"
        placeholder="选填，简要描述该玩法的核心机制和吸引力"
        :rows="3"
      />
    </div>
    <BaseButton
      type="submit"
      variant="brand"
      class="w-full"
    >
      添加
    </BaseButton>
  </form>
</template>

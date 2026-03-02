<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'
import BaseSelect from '@/components/ui/base-select.vue'
import type { SelectOption } from '@/components/ui/base-select.vue'
import { useThemeRadarStore } from '@/stores/theme-radar-store'
import { ThemeCategory } from '@/models/enums'

const themeRadarStore = useThemeRadarStore()

const name = ref('')
const description = ref('')
const category = ref<ThemeCategory>(ThemeCategory.SubjectAesthetic)

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: ThemeCategory.SubjectAesthetic, label: '题材审美' },
  { value: ThemeCategory.EmotionalResonance, label: '情感共鸣' },
  { value: ThemeCategory.InternetMeme, label: '网络梗/热点' },
  { value: ThemeCategory.FilmHot, label: '影视热播' },
  { value: ThemeCategory.ThrillingFormula, label: '爽感公式' },
  { value: ThemeCategory.ContrastCuriosity, label: '反差好奇' },
]

function handleSubmit() {
  const trimmedName = name.value.trim()
  if (!trimmedName) return
  themeRadarStore.addCustomTheme({
    name: trimmedName,
    description: description.value.trim(),
    category: category.value,
  })
  name.value = ''
  description.value = ''
  category.value = ThemeCategory.SubjectAesthetic
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <div>
      <label class="mb-1 block text-sm font-medium">主题名称</label>
      <BaseInput
        v-model="name"
        placeholder="输入主题名称"
        required
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium">主题描述</label>
      <BaseTextarea
        v-model="description"
        placeholder="选填，简要描述该主题"
        :rows="2"
      />
    </div>
    <div>
      <label class="mb-1 block text-sm font-medium">类型分类</label>
      <BaseSelect
        v-model="category"
        :options="CATEGORY_OPTIONS"
        placeholder="选择分类"
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

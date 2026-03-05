<script setup lang="ts">
import { ref } from 'vue'
import BaseDialog from '@/components/ui/base-dialog.vue'
import BaseButton from '@/components/ui/base-button.vue'
import BaseInput from '@/components/ui/base-input.vue'
import BaseTextarea from '@/components/ui/base-textarea.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [name: string, description: string]
}>()

const name = ref('')
const description = ref('')

function handleSave() {
  if (!name.value.trim()) return
  emit('save', name.value.trim(), description.value.trim())
  name.value = ''
  description.value = ''
  emit('close')
}
</script>

<template>
  <BaseDialog :open="open" @close="emit('close')">
    <template #header>
      <h2 class="text-lg font-semibold">保存为模板</h2>
      <p class="text-sm text-muted-foreground">将当前配置保存为自定义模板，方便下次快速使用</p>
    </template>

    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium">模板名称 <span class="text-destructive">*</span></label>
        <BaseInput
          :model-value="name"
          placeholder="例如：SLG 竖屏口播 15s"
          @update:model-value="(v) => (name = v)"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium">描述（可选）</label>
        <BaseTextarea
          :model-value="description"
          placeholder="简要描述模板的用途"
          :rows="2"
          @update:model-value="(v) => (description = v)"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="emit('close')">取消</BaseButton>
      <BaseButton variant="brand" :disabled="!name.trim()" @click="handleSave">保存</BaseButton>
    </template>
  </BaseDialog>
</template>

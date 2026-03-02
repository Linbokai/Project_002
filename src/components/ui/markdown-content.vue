<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

marked.setOptions({ breaks: true, gfm: true })

const html = computed(() => {
  if (!props.content) return ''
  return marked.parse(props.content, { async: false }) as string
})
</script>

<template>
  <div class="prose" v-html="html" />
</template>

<script setup lang="ts">
import { BrainCircuit } from 'lucide-vue-next'
import ThemeToggle from '@/components/ui/theme-toggle.vue'
</script>

<template>
  <div class="flex min-h-svh flex-col">
    <header
      class="sticky top-0 z-40 flex h-14 items-center justify-between border-b
             bg-background/80 px-6 backdrop-blur-xl saturate-150"
    >
      <div class="flex items-center gap-2 font-semibold">
        <BrainCircuit :size="20" class="text-brand" />
        <span>AI Model Hub</span>
      </div>
      <ThemeToggle />
    </header>

    <main class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-4 text-center">
        <BrainCircuit :size="48" class="text-muted-foreground/50" />
        <h1 class="text-lg font-semibold text-foreground">
          AI Model Hub
        </h1>
        <p class="text-sm text-muted-foreground">
          全球 AI 模型信息聚合展示平台
        </p>
      </div>
    </main>
  </div>
</template>

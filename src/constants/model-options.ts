import type { TaskType } from '@/models/types'

export interface ModelOption {
  id: string
  name: string
  description: string
}

export const SEARCH_MODELS: ModelOption[] = [
  { id: 'perplexity/sonar-pro-search', name: 'Sonar Pro Search（推荐）', description: '搜索准确，支持多步推理 · ~$3/M tokens' },
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', description: '搜索稳定，速度快 · ~$1/M tokens' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '免费额度多，速度快 · 有免费额度' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: '搜索深度好，速度较慢 · ~$2.2/M tokens' },
]

export const GEN_MODELS: ModelOption[] = [
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2（推荐）', description: '性价比最高，中文效果好 · ~$0.27/M tokens' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', description: '创意质量好，1M 上下文 · ~$3/M tokens' },
  { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', description: '最强推理能力 · ~$15/M tokens' },
  { id: 'openai/gpt-5.3-codex', name: 'GPT-5.3 Codex', description: '综合能力强 · ~$5/M tokens' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '速度最快 · 有免费额度' },
  { id: 'qwen/qwen3-max', name: 'Qwen3 Max', description: '中文理解优秀 · ~$0.50/M tokens' },
]

export const VISION_MODELS: ModelOption[] = [
  { id: 'qwen/qwen3.5-35b-a3b', name: 'Qwen3.5 35B A3B（推荐）', description: '价格最低的视觉模型 · ~$0.15/M tokens' },
  { id: 'qwen/qwen3-vl-235b-a22b-instruct', name: 'Qwen3 VL 235B', description: '专用视觉语言模型，效果优秀 · ~$1.2/M tokens' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '视频分析效果好 · 有免费额度' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', description: '图文分析细致 · ~$3/M tokens' },
]

export const IMAGE_MODELS: ModelOption[] = [
  { id: 'google/gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image（推荐）', description: '支持文+图输出，性价比高 · ~$0.10/M tokens' },
  { id: 'google/gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', description: '最高画质，支持 2K/4K · ~$1.25/M tokens' },
  { id: 'black-forest-labs/flux.2-max', name: 'Flux 2 Max', description: '图像质量与提示理解最佳 · ~$0.055/张' },
  { id: 'black-forest-labs/flux.2-pro', name: 'Flux 2 Pro', description: '高质量图像生成 · ~$0.04/张' },
]

export const TASK_MODEL_OPTIONS: Record<TaskType, string[]> = {
  search: SEARCH_MODELS.map((m) => m.id),
  gen: GEN_MODELS.map((m) => m.id),
  vision: VISION_MODELS.map((m) => m.id),
  image: IMAGE_MODELS.map((m) => m.id),
}

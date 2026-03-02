export interface ModelOption {
  id: string
  name: string
  description: string
}

export const SEARCH_MODELS: ModelOption[] = [
  { id: 'perplexity/sonar-pro-search', name: 'Sonar Pro Search（推荐）', description: '搜索准确，支持多步推理' },
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', description: '搜索稳定，速度快' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '免费额度多，速度快' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: '搜索深度好，但速度较慢' },
]

export const GEN_MODELS: ModelOption[] = [
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2（推荐）', description: '性价比最高，中文效果好' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', description: '创意质量最好，价格稍贵' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '速度最快，免费额度多' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', description: '综合能力强，价格适中' },
  { id: 'qwen/qwen3-max', name: 'Qwen3 Max', description: '中文理解优秀，价格便宜' },
]

export const VISION_MODELS: ModelOption[] = [
  { id: 'qwen/qwen3.5-35b-a3b', name: 'Qwen3.5 35B A3B（推荐）', description: '价格最便宜的视觉模型' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '视频分析效果好，免费额度多' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', description: '画面理解能力强' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', description: '图文分析细致' },
]

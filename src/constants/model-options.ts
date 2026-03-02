export interface ModelOption {
  id: string
  name: string
  description: string
}

export const SEARCH_MODELS: ModelOption[] = [
  { id: 'perplexity/sonar-pro-search', name: 'Sonar Pro Search', description: '多步推理联网搜索' },
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', description: '联网搜索（稳定）' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '支持联网搜索｜1M上下文' },
]

export const GEN_MODELS: ModelOption[] = [
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', description: '性价比之王｜164K上下文' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', description: '创意质量高｜1M上下文' },
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '快速生成｜1M上下文' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', description: '综合能力强｜400K上下文' },
  { id: 'qwen/qwen3-max', name: 'Qwen3 Max', description: '中文优化｜262K上下文' },
]

export const VISION_MODELS: ModelOption[] = [
  { id: 'google/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: '视觉分析推荐｜1M上下文' },
  { id: 'openai/gpt-5.1', name: 'GPT-5.1', description: '多模态理解强｜400K上下文' },
  { id: 'anthropic/claude-sonnet-4.6', name: 'Claude Sonnet 4.6', description: '图文理解｜1M上下文' },
  { id: 'qwen/qwen3.5-35b-a3b', name: 'Qwen3.5 35B A3B', description: '轻量视觉模型｜高性价比' },
]

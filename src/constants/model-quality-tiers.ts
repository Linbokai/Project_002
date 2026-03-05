export const QUALITY_TIERS: Record<string, Record<string, number>> = {
  gen: {
    'anthropic/claude-sonnet-4.6': 95,
    'openai/gpt-5.1': 93,
    'deepseek/deepseek-v3.2': 88,
    'qwen/qwen3-max': 85,
    'google/gemini-3-flash-preview': 82,
  },
  search: {
    'perplexity/sonar-pro-search': 95,
    'perplexity/sonar-pro': 88,
    'deepseek/deepseek-r1': 80,
    'google/gemini-3-flash-preview': 75,
  },
  vision: {
    'openai/gpt-5.1': 92,
    'anthropic/claude-sonnet-4.6': 90,
    'google/gemini-3-flash-preview': 85,
    'qwen/qwen3.5-35b-a3b': 82,
  },
  image: {
    'black-forest-labs/flux.2-pro': 92,
    'google/gemini-3.1-flash-image-preview': 88,
    'black-forest-labs/flux.2-flex': 85,
    'google/gemini-2.5-flash-image-preview': 80,
  },
}

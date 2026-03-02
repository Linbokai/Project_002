export const APP_NAME = '买量脚本工作台'

export const STORAGE_KEYS = {
  GAMES: 'sg_games',
  SELECTED_GAME: 'sg_sel',
  API_CONFIG: 'sg_cfg',
  HISTORY: 'sg_history',
  THEME: 'ai-model-hub-theme',
  SELL_TAGS: 'sg_sell_tags',
  GENERATION_CONFIG: 'sg_gen_cfg',
  SAFE_MODE: 'sg_safe_mode',
} as const

export const HISTORY_MAX = 30

export const API_DEFAULTS = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  SEARCH_MODEL: 'perplexity/sonar-pro-search',
  GEN_MODEL: 'deepseek/deepseek-chat',
  VISION_MODEL: 'google/gemini-2.5-flash-preview',
  TEMPERATURE: 0.85,
  MAX_TOKENS: 4096,
  MAX_TOKENS_VISION: 8192,
} as const

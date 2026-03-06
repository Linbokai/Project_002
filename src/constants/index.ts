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
  PROMPT_OVERRIDES: 'sg_prompt_overrides',
  USER_TEMPLATES: 'sg_user_templates',
  ONBOARDING_DONE: 'sg_onboarding_done',
  TRIAL_MODE: 'sg_trial_mode',
  TRIAL_USAGE: 'sg_trial_usage',
} as const

export const HISTORY_MAX = 30

export const VIDEO_FRAME_EXTRACTION = {
  FPS: 2,
  MAX_FRAMES: 120,
  MAX_WIDTH: 960,
  JPEG_QUALITY: 0.75,
} as const

export const API_DEFAULTS = {
  BASE_URL: 'https://openrouter.ai/api/v1',
  SEARCH_MODEL: 'perplexity/sonar-pro-search',
  GEN_MODEL: 'deepseek/deepseek-v3.2',
  VISION_MODEL: 'qwen/qwen3.5-35b-a3b',
  IMAGE_MODEL: 'google/gemini-3.1-flash-image-preview',
  ROUTING_MODE: 'manual' as const,
  ROUTING_PROFILE: 'balanced' as const,
  TEMPERATURE: 0.85,
  MAX_TOKENS: 4096,
  MAX_TOKENS_VISION: 8192,
} as const

export const IMAGE_DEFAULTS = {
  ASPECT_RATIO: '16:9' as const,
  IMAGE_SIZE: '1K' as const,
  MAX_REFERENCE_IMAGES: 3,
} as const

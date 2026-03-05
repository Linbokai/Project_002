export interface AdPlatform {
  id: string
  name: string
  icon: string
  region: 'domestic' | 'overseas' | 'both'
  recommendedDuration: number[]
  recommendedAspectRatio: string
  rhythmStyle: string
  promptHint: string
}

export const AD_PLATFORMS: AdPlatform[] = [
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    region: 'domestic',
    recommendedDuration: [15, 30],
    recommendedAspectRatio: '9:16',
    rhythmStyle: '快节奏、强钩子',
    promptHint:
      '适配抖音平台：竖屏构图，前3秒必须有强视觉钩子或悬念，节奏紧凑，每5秒一个信息点，口播简短有力，字幕醒目。',
  },
  {
    id: 'kuaishou',
    name: '快手',
    icon: '🎬',
    region: 'domestic',
    recommendedDuration: [15, 30],
    recommendedAspectRatio: '9:16',
    rhythmStyle: '接地气、真实感',
    promptHint:
      '适配快手平台：竖屏构图，风格真实接地气，强调真人感和生活化表达，减少过度包装，口播自然亲切，注重互动引导。',
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    region: 'domestic',
    recommendedDuration: [60],
    recommendedAspectRatio: '16:9',
    rhythmStyle: '内容向、知识感',
    promptHint:
      '适配B站平台：横屏构图，内容深度优先，允许较长铺垫和叙事，语言风格偏年轻化、可加梗，注重信息密度和观点输出。',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    region: 'overseas',
    recommendedDuration: [30, 60],
    recommendedAspectRatio: '16:9',
    rhythmStyle: 'cinematic、高质感',
    promptHint:
      '适配YouTube平台：横屏构图，画面质感优先，节奏可以稍缓但需保持吸引力，适合电影感叙事，英文友好的视觉语言。',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🌍',
    region: 'overseas',
    recommendedDuration: [15],
    recommendedAspectRatio: '9:16',
    rhythmStyle: '快节奏、国际化表达',
    promptHint:
      '适配TikTok平台：竖屏构图，极快节奏，前2秒必须抓眼球，画面切换频繁，减少文字依赖，强调视觉冲击和universal appeal。',
  },
  {
    id: 'unity-ads',
    name: 'Unity Ads',
    icon: '🎮',
    region: 'both',
    recommendedDuration: [15, 30],
    recommendedAspectRatio: '16:9',
    rhythmStyle: '游戏画面主导',
    promptHint:
      '适配Unity Ads：支持横竖屏，以游戏实机画面为主，突出核心玩法loop，前5秒展示最刺激的游戏场景，结尾强CTA引导下载。',
  },
  {
    id: 'meta',
    name: 'Meta/Facebook',
    icon: '👤',
    region: 'overseas',
    recommendedDuration: [15],
    recommendedAspectRatio: '1:1',
    rhythmStyle: '社交感、feed友好',
    promptHint:
      '适配Meta/Facebook：方屏或竖屏构图，适合信息流浏览，静音友好（字幕必备），前3秒用画面讲故事，社交分享感强。',
  },
  {
    id: 'general',
    name: '通用/不限',
    icon: '📋',
    region: 'both',
    recommendedDuration: [],
    recommendedAspectRatio: '',
    rhythmStyle: '',
    promptHint: '',
  },
]

import { ProductionDirection, AspectRatio, ScriptType, AudienceType, UeContentType } from '@/models/enums'
import type { ScriptTemplate, TemplateCategory } from '@/models/types/template'

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'popular', label: '热门' },
  { id: 'voiceover', label: '口播类' },
  { id: 'showcase', label: '展示类' },
  { id: 'story', label: '剧情类' },
  { id: 'ue', label: 'UE创意' },
]

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  // ── 热门 ──
  {
    id: 'popular_slg_vo_15',
    name: 'SLG 竖屏口播',
    description: '最常见的买量格式，真人口播 + 游戏画面穿插',
    category: 'popular',
    icon: '🔥',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 15,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.VoGuide,
      audience: AudienceType.Male2535,
    },
    recommendedThemeIds: ['tower', 'rescue'],
  },
  {
    id: 'popular_rpg_char_15',
    name: 'RPG 角色展示',
    description: '用高质量角色画面吸引玩家，展示角色技能和特效',
    category: 'popular',
    icon: '⚔️',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 15,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.ShowcaseCharacter,
      audience: AudienceType.Male1824,
    },
    recommendedThemeIds: ['boss', 'bullet'],
  },
  {
    id: 'popular_casual_hook',
    name: '休闲快节奏钩子',
    description: '5秒极短钩子，抓住注意力后快速展示玩法',
    category: 'popular',
    icon: '⚡',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 5,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.Hook5s,
      audience: AudienceType.General,
    },
    recommendedThemeIds: ['asmr', 'merge'],
  },
  {
    id: 'popular_ue_gameplay',
    name: 'UE 创意玩法',
    description: '虚幻引擎 3D 画面，创意玩法展示，视觉冲击力强',
    category: 'popular',
    icon: '🎮',
    config: {
      direction: ProductionDirection.UeGameplay,
      duration: 30,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.UeGameplayScript,
      ueContentType: UeContentType.Gameplay,
    },
  },

  // ── 口播类 ──
  {
    id: 'vo_guide_30',
    name: '口播攻略 30s',
    description: '详细的攻略讲解，适合中重度游戏深度展示',
    category: 'voiceover',
    icon: '🎙️',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 30,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.VoGuide,
      audience: AudienceType.Male2535,
    },
  },
  {
    id: 'vo_intro_15',
    name: '口播安利 15s',
    description: '直接安利推荐游戏，强调亮点和福利',
    category: 'voiceover',
    icon: '📢',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 15,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.VoIntro,
      audience: AudienceType.Male2535,
    },
  },
  {
    id: 'vo_benefit_15',
    name: '福利向口播 15s',
    description: '主打福利、活动、礼包，降低用户下载门槛',
    category: 'voiceover',
    icon: '🎁',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 15,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.VoBenefit,
      audience: AudienceType.General,
    },
    recommendedSellTags: ['福利', '高级许愿'],
  },

  // ── 展示类 ──
  {
    id: 'showcase_char_30',
    name: '角色展示 30s',
    description: '长版角色展示，多角色轮播 + 技能特效',
    category: 'showcase',
    icon: '🦸',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 30,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.ShowcaseCharacter,
      audience: AudienceType.Male1824,
    },
    recommendedThemeIds: ['bullet', 'boss'],
    recommendedSellTags: ['角色', '角色收集'],
  },
  {
    id: 'showcase_map_15',
    name: '地图场景展示 15s',
    description: '展示游戏世界观和地图美术',
    category: 'showcase',
    icon: '🗺️',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 15,
      aspectRatio: AspectRatio.Landscape,
      scriptType: ScriptType.ShowcaseMap,
      audience: AudienceType.Male2535,
    },
    recommendedThemeIds: ['dungeon'],
  },

  // ── 剧情类 ──
  {
    id: 'skit_30',
    name: '剧情小品 30s',
    description: '真人情景剧，剧情反转吸引观看',
    category: 'story',
    icon: '🎭',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 30,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.Skit,
      audience: AudienceType.General,
    },
    recommendedThemeIds: ['drama', 'ceo'],
  },
  {
    id: 'cg_story_15',
    name: 'CG 动画 15s',
    description: '游戏 CG 风格动画叙事，电影级质感',
    category: 'story',
    icon: '🎬',
    config: {
      direction: ProductionDirection.Script2D,
      duration: 15,
      aspectRatio: AspectRatio.Landscape,
      scriptType: ScriptType.CgStory,
      audience: AudienceType.Male1824,
    },
    recommendedThemeIds: ['zombie', 'survive'],
  },

  // ── UE 创意 ──
  {
    id: 'ue_pv_15',
    name: 'UE PV 展示 15s',
    description: 'UE 引擎制作的 PV 级别展示视频',
    category: 'ue',
    icon: '🎥',
    config: {
      direction: ProductionDirection.UeGameplay,
      duration: 15,
      aspectRatio: AspectRatio.Landscape,
      scriptType: ScriptType.UeShowcasePV,
      ueContentType: UeContentType.Showcase,
    },
  },
  {
    id: 'ue_maprun_15',
    name: 'UE 地图漫游 15s',
    description: '虚幻引擎地图漫游展示，沉浸式体验',
    category: 'ue',
    icon: '🌍',
    config: {
      direction: ProductionDirection.UeGameplay,
      duration: 15,
      aspectRatio: AspectRatio.Landscape,
      scriptType: ScriptType.UeShowcaseMapRun,
      ueContentType: UeContentType.Showcase,
    },
  },
  {
    id: 'ue_char_15',
    name: 'UE 角色展示 15s',
    description: 'UE 引擎角色建模和动作展示',
    category: 'ue',
    icon: '🤖',
    config: {
      direction: ProductionDirection.UeGameplay,
      duration: 15,
      aspectRatio: AspectRatio.Portrait,
      scriptType: ScriptType.UeShowcaseCharacter,
      ueContentType: UeContentType.Showcase,
    },
  },
]

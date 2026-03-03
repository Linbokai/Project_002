export enum VideoDuration {
  S5 = 5,
  S10 = 10,
  S15 = 15,
  S30 = 30,
  S60 = 60,
}

export enum AspectRatio {
  Portrait = '9:16',
  Landscape = '16:9',
  Square = '1:1',
}

export enum ScriptType {
  VoGuide = 'vo_guide',
  VoIntro = 'vo_intro',
  VoBenefit = 'vo_benefit',
  Showcase = 'showcase',
  CgStory = 'cg_story',
  Hook5s = 'hook5s',
  Skit = 'skit',
  UeShowcasePV = 'ue_showcase_pv',
  UeShowcaseMapRun = 'ue_showcase_map_run',
  UeShowcaseCharacter = 'ue_showcase_character',
  UeGameplayScript = 'ue_gameplay_script',
}

export enum AudienceType {
  Male1824 = 'male-18-24',
  Male2535 = 'male-25-35',
  Male35Plus = 'male-35+',
  Female1824 = 'female-18-24',
  Female2535 = 'female-25-35',
  General = 'general',
  Custom = 'custom',
}

export enum SearchPlatform {
  Douyin = 'douyin',
  Kuaishou = 'kuaishou',
  Bilibili = 'bilibili',
  All = 'all',
}

export enum SearchRegion {
  Domestic = 'domestic',
  Overseas = 'overseas',
}

export enum ThemeCategory {
  SubjectAesthetic = 'subject_aesthetic',
  EmotionalResonance = 'emotional_resonance',
  InternetMeme = 'internet_meme',
  FilmHot = 'film_hot',
  ThrillingFormula = 'thrilling_formula',
  ContrastCuriosity = 'contrast_curiosity',
}

export enum GenerationStatus {
  Idle = 'idle',
  Generating = 'generating',
  Done = 'done',
  Error = 'error',
}

export enum ProductionDirection {
  Script2D = 'script_2d',
  UeGameplay = 'ue_gameplay',
}

export enum UeContentType {
  Showcase = 'showcase',
  Gameplay = 'gameplay',
}

export enum MessageType {
  General = 'general',
  Script = 'script',
  Analysis = 'analysis',
  Optimization = 'optimization',
  ScriptDirection = 'script_direction',
  GameplayDirection = 'gameplay_direction',
}

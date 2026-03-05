# 买量脚本工作台 — 全模块升级总控计划

> 本文档是所有升级任务的"指挥中心"，每次新对话/Cloud Agent 启动时 @ 引用此文件。
> 每个模块完成后更新状态和备注。

---

## 项目概况

- **技术栈**: Vue 3 + TypeScript + Pinia + TailwindCSS + Vite
- **代码规模**: ~100 个文件，~11,000 行
- **架构**: MVVM（View → ViewModel → Model），规范见 `.cursor/rules/`
- **关键大文件**: `config-panel.vue`(731行), `script-prompt-builder.ts`(204行), `gameplay-prompt-builder.ts`(337行), `script-shot-renderer.vue`(331行), `use-chat.ts`(342行), `use-video-analysis.ts`(277行)

---

## 共享文件清单（修改需谨慎）

以下文件被多个模块依赖，任何改动都可能影响其他模块：

| 文件 | 被依赖情况 |
|------|-----------|
| `src/models/types/index.ts` | 全局类型聚合入口，所有模块引用 |
| `src/models/types/config.ts` | config-store, settings-store, composables |
| `src/constants/index.ts` | 全局常量，多处引用 |
| `src/stores/config-store.ts` | config-panel, chat, prompt-builder 等 |
| `src/stores/settings-store.ts` | API 调用相关模块 |
| `src/views/workbench-view.vue` | 页面级组件，集成所有模块 |

---

## 模块执行顺序与依赖关系

```
Phase 0（基础）: 无依赖，优先执行
  └─ M5 模板系统扩充
  └─ M10 配置面板 UI 优化

Phase 1（新功能）: 可并行，各自独立
  └─ M1 爆款裂变功能
  └─ M6 免配置体验模式

Phase 2（增强现有功能）: 可并行
  └─ M8 脚本评分一键优化（依赖 use-script-score.ts）
  └─ M3 视频分析量化评分（依赖 use-video-analysis.ts）
  └─ M7 导出格式扩展（依赖 use-script-export.ts）

Phase 3（数据接入）:
  └─ M2 热点数据源增强

Phase 4（长期规划）: 独立大功能
  └─ M4 分镜→视频片段
  └─ M9 游戏库增强
  └─ M11 投放平台对接（远期）
```

---

## 模块详细任务清单

### M5: 模板系统扩充 `P0` `独立`

**状态**: 🟢 已完成

**目标**: 内置模板从 4 个扩充到 50+，增加模板预览和使用量统计

**涉及文件**:
- `src/constants/script-templates.ts` — 扩充模板数据（当前 227 行，4 个模板）
- `src/models/types/template.ts` — 可能需扩展类型（增加 preview、usage 字段）
- `src/stores/template-store.ts` — 增加使用量统计逻辑
- `src/components/business/templates/template-card.vue` — 增加预览展示
- `src/components/business/templates/template-gallery.vue` — 分类浏览优化

**具体任务**:
1. 按 游戏品类(SLG/RPG/休闲/卡牌/MOBA/二次元) × 脚本类型(口播/展示/剧情/UE/钩子) 矩阵扩充模板
2. 每个模板增加 `preview` 字段（示例脚本片段）和 `usageCount` 字段
3. template-gallery 增加按品类筛选、搜索、排序（按使用量/好评）
4. template-card 增加预览弹窗（点击查看示例脚本）

**不涉及的共享文件**: 基本独立，仅 types/template.ts 需小幅扩展

---

### M10: 配置面板 UI 优化 `P0` `独立`

**状态**: 🟢 已完成

**目标**: 降低信息密度，改善交互体验

**涉及文件**:
- `src/components/business/layout/config-panel.vue` — 主要改造目标（731 行）
- `src/components/business/chat/empty-state.vue` — 空状态优化
- `src/views/workbench-view.vue` — 可能需调整布局配合

**具体任务**:
1. config-panel 改为手风琴折叠式，默认只展开"必填项"（游戏、方向）
2. 增加"配置完成度"进度条（更突出的视觉设计）
3. 增加"智能推荐配置"按钮 — 基于游戏类型自动填充推荐配置
4. empty-state 增加：示例脚本快速预览、快速开始向导（3步）、最近模板入口
5. 移动端配置面板交互优化

---

### M1: 爆款裂变功能 `P0` `新模块`

**状态**: 🟢 已完成

**目标**: 用户粘贴竞品爆款脚本，AI 分析结构后一键衍生多个变体

**需新建文件**:
- `src/services/helpers/viral-prompt-builder.ts` — 爆款裂变 prompt 构建
- `src/composables/use-viral-generation.ts` — 裂变生成逻辑
- `src/components/business/chat/viral-input-dialog.vue` — 爆款脚本输入弹窗

**需修改文件**:
- `src/components/business/chat/quick-actions.vue` — 增加"爆款裂变"入口按钮
- `src/models/enums/index.ts` — 可能增加新的消息类型

**具体任务**:
1. 创建爆款裂变输入弹窗（粘贴原脚本 + 选择衍生方向：换主题/换风格/换钩子/混合）
2. 构建裂变专用 prompt（分析原脚本结构 → 保留有效元素 → 替换指定部分）
3. 复用现有 use-chat 的流式生成能力，输出多个裂变变体
4. 结果展示复用 variant-results 组件

**架构**: 遵循解耦原则，API 纯函数，Store 纯状态，Composable 桥接

---

### M6: 免配置体验模式 `P0` `涉及共享文件`

**状态**: 🟢 已完成

**目标**: 新用户无需 API Key 即可体验核心功能（有限次数）

**需新建文件**:
- `src/services/api/trial-api.ts` — 试用 API 代理服务
- `src/composables/use-trial-mode.ts` — 试用模式逻辑（次数限制、状态管理）

**需修改文件**:
- `src/stores/settings-store.ts` — 增加试用模式状态
- `src/components/business/modals/api-config-dialog.vue` — 增加试用模式入口和引导
- `src/components/business/onboarding/onboarding-dialog.vue` — 引导流程增加"免费体验"选项
- `src/services/api/openrouter-client.ts` — 兼容试用模式的请求路由

**具体任务**:
1. 设计试用模式：每个用户（基于 localStorage/fingerprint）免费 5 次生成
2. 试用模式下使用固定模型（成本可控），不需要用户配置 API Key
3. API 请求通过代理服务转发（需要后端支持，或使用预置 key + 频率限制）
4. 试用次数用完后引导配置 API Key，增加图文教程
5. settings-store 增加 `isTrialMode` / `trialUsageCount` 状态

**⚠️ 注意**: 此功能需要后端代理服务支持，可能需要额外部署。如果暂时无后端，可先做 UI 框架 + 引导优化部分。

---

### M8: 脚本评分一键优化 `P1`

**状态**: 🟢 已完成

**目标**: 评分后的改进建议可一键应用，自动重新生成优化版本

**涉及文件**:
- `src/composables/use-script-score.ts` — 增加"一键优化"逻辑
- `src/components/business/chat/score-card.vue` — 增加"一键优化"按钮
- `src/services/helpers/score-prompt-builder.ts` — 增加优化 prompt 模板

**具体任务**:
1. score-card 中每条建议旁增加"应用此建议"按钮
2. 增加"一键全部优化"按钮，将所有建议合并为优化 prompt
3. 生成优化版脚本，与原版对比展示（diff 或并列）
4. 支持多变体评分对比（表格或雷达图叠加）

---

### M3: 视频分析量化评分 `P1`

**状态**: 🟢 已完成

**目标**: 分析报告增加量化维度评分，支持对比分析

**涉及文件**:
- `src/composables/use-video-analysis.ts` — 增加量化评分解析
- `src/services/helpers/analysis-prompt-builder.ts` — prompt 增加评分要求
- `src/components/business/chat/analysis-actions.vue` — 增加对比分析入口

**具体任务**:
1. 分析 prompt 增加结构化评分要求（钩子强度/节奏评分/卖点覆盖度/平台适配度，1-10 分）
2. 解析 AI 返回的评分数据，用雷达图展示（复用 score-radar-chart）
3. 增加"对比分析"功能 — 同时上传 2~3 个视频对比
4. 分析完成后推荐同类型高转化脚本结构

---

### M7: 导出格式扩展 `P1` `独立`

**状态**: 🟢 已完成

**目标**: 支持 Word/PDF/PPT 导出，增加分享链接

**涉及文件**:
- `src/composables/use-script-export.ts` — 增加新格式导出
- `src/services/helpers/export-formatter.ts` — 新增格式化器
- `src/components/business/chat/export-menu.vue` — 增加格式选项

**具体任务**:
1. 增加 PDF 导出（使用 jsPDF 或类似库）
2. 增加 Word 导出（使用 docx 库）
3. 增加 PPT 导出（使用 pptxgenjs，适合分镜展示）
4. export-menu 增加格式选择 UI
5. 考虑增加"生成分享链接"功能（需后端支持，可先做 UI）

**新增依赖**: jspdf, docx, pptxgenjs

---

### M2: 热点数据源增强 `P1`

**状态**: 🟢 已完成

**目标**: 主题推荐增加真实数据支撑，增加热点周报

**涉及文件**:
- `src/composables/use-theme-search.ts` — 增强搜索逻辑
- `src/stores/theme-radar-store.ts` — 增加数据源状态
- `src/components/business/theme-radar/preset-themes.vue` — 展示数据来源标识
- `src/constants/preset-themes.ts` — 扩充预设主题数据

**具体任务**:
1. 预设主题增加"数据来源"标识（AI 推理 / 平台数据）
2. 增加"热点周报"生成功能（AI 汇总本周热门买量趋势）
3. 增加"竞品素材参考"区块（展示该主题下的代表性素材描述）
4. 主题搜索结果增加"热度趋势"指标

---

### M4: 分镜→视频片段 `P2` `大功能`

**状态**: 🟢 已完成（UI框架+占位）

**目标**: 每个镜头可生成 2~5s 视频片段

**涉及文件**:
- `src/components/business/chat/script-shot-renderer.vue` — 增加"生成视频"按钮
- `src/services/api/` — 新增视频生成 API 接入（Sora/可灵/Runway）
- `src/composables/` — 新增 use-video-generation.ts

**具体任务**:
1. 接入视频生成模型 API（Sora/可灵/Runway，按可用性选择）
2. 每个分镜卡片增加"生成视频片段"按钮
3. 增加镜头拖拽排序功能
4. 增加画面风格预设（写实/二次元/像素风/赛博朋克）
5. 九宫格增加导出 PDF/PPT 能力

---

### M9: 游戏库增强 `P2`

**状态**: 🟢 已完成

**目标**: 丰富游戏信息字段，支持素材关联

**涉及文件**:
- `src/models/types/game.ts` — 扩展游戏类型字段
- `src/stores/game-store.ts` — 增加素材管理
- `src/components/business/modals/game-manager-dialog.vue` — 增加更多字段和素材上传

**具体任务**:
1. Game 类型增加：目标市场、主要竞品、已投放平台、历史爆款方向
2. 增加游戏素材库（截图/角色原画/Logo 上传与管理）
3. 增加"游戏画像"AI 生成功能
4. 生成脚本时自动引用游戏素材信息

---

### M11: 投放平台对接 `P2` `远期`

**状态**: 🔴 待开始

**目标**: 对接巨量引擎/腾讯广告 API

**备注**: 此为远期规划，需要平台开发者账号和 API 权限，暂不展开详细任务。

---

## Cloud Agent 使用指南

### 启动 Cloud Agent 前的准备

1. 确保当前分支干净（`git status` 无未提交更改）
2. 为每个模块创建独立分支：`feature/m5-template-expansion`
3. 将本文档 @ 引用给 Cloud Agent

### Cloud Agent Prompt 模板

```
你正在执行买量脚本工作台的模块升级任务。

## 上下文
- 请先阅读 @.cursor/plans/upgrade-master-plan.md 了解全局计划
- 请遵循 .cursor/rules/ 下的所有架构规范
- 当前任务：[模块编号和名称]

## 任务清单
[从本文档对应模块复制具体任务]

## 约束
- 遵循 MVVM 架构（View → ViewModel → Model）
- 遵循解耦原则（API 纯函数、Store 纯状态、Composable 桥接）
- 文件命名 kebab-case，组件命名 PascalCase
- 不要修改不在"涉及文件"列表中的共享文件，除非绝对必要
- 修改完成后运行 pnpm build 验证无错误
```

### 完成后更新

每个模块完成后，更新本文档：
1. 状态改为 🟢 已完成
2. 备注实际改动的文件列表
3. 记录新增的类型/接口/组件名称
4. 记录遇到的问题和解决方案

---

## 变更日志

| 日期 | 模块 | 操作 | 备注 |
|------|------|------|------|
| 2026-03-05 | — | 创建总控计划 | 初始版本 |
| 2026-03-05 | M5 | 🟢 完成 | 模板扩充到 50+，新增品类筛选/搜索/使用量统计/预览功能。改动: template.ts, script-templates.ts, template-store.ts, template-gallery.vue, template-card.vue, types/index.ts |
| 2026-03-05 | M10 | 🟢 完成 | 配置面板增加智能推荐按钮、改进进度条、折叠摘要显示、空状态增加快速开始向导。新增: use-smart-config.ts。改动: config-panel.vue, empty-state.vue |
| 2026-03-05 | M1 | 🟢 完成 | 爆款裂变功能。新增: viral-prompt-builder.ts, use-viral-generation.ts, viral-input-dialog.vue。改动: quick-actions.vue, chat-input.vue |
| 2026-03-05 | M6 | 🟢 完成 | 免配置体验模式UI框架。改动: settings-store.ts, api-config-dialog.vue, onboarding-dialog.vue |
| 2026-03-05 | M8 | 🟢 完成 | 脚本评分一键优化。改动: use-script-score.ts, score-card.vue, script-actions.vue |
| 2026-03-05 | M3 | 🟢 完成 | 视频分析量化评分。改动: analysis-prompt-builder.ts, use-video-analysis.ts, analysis-actions.vue |
| 2026-03-05 | M7 | 🟢 完成 | 导出格式扩展。改动: export-formatter.ts, use-script-export.ts, export-menu.vue |
| 2026-03-05 | M2 | 🟢 完成 | 热点数据源增强。改动: theme.ts, preset-themes.ts, use-theme-search.ts, theme-radar-store.ts, preset-themes.vue |
| 2026-03-05 | M4 | 🟢 完成 | 分镜增强UI框架。改动: script-shot-renderer.vue, script.ts |
| 2026-03-05 | M9 | 🟢 完成 | 游戏库增强。改动: game.ts, game-store.ts, game-manager-dialog.vue, prompt-builders |

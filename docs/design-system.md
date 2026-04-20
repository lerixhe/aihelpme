# Design System - AI Help Me

> 版本：2.0.0 | 更新日期：2026-04-20
>
> 本文档定义了 AI Help Me Chrome 扩展的完整设计系统，参考 Apple HIG 风格，
> 包括颜色、字体、间距、动画等规范。

## 目录

0. [UI 模块命名表](#0-ui-模块命名表)
1. [品牌色系统](#1-品牌色系统)
2. [语义颜色系统](#2-语义颜色系统)
3. [字体系统](#3-字体系统)
4. [间距系统](#4-间距系统)
5. [圆角系统](#5-圆角系统)
6. [阴影系统](#6-阴影系统)
7. [动画系统](#7-动画系统)
8. [组件规范](#8-组件规范)
9. [可访问性](#9-可访问性)

---

## 0. UI 模块命名表

> 日常沟通和文档中统一使用以下中文昵称和英文代号指代各 UI 模块。

| 中文名称 | 英文名称 | 组件 | 说明 |
|----------|----------|------|------|
| **触发按钮** | Trigger Button | `SelectionToolbar` 核心 | 选中文本后出现的圆形渐变按钮 |
| **动作栏** | Action Bar | `SelectionToolbar` 展开态 | 点击/悬停触发按钮后展开的横向药丸按钮列表，毛玻璃背景 |
| **对话窗** | Chat Window | `UnifiedPanel` | 模态浮层聊天窗口，含毛玻璃遮罩层、标题栏、选区编辑区、消息流、输入栏 |
| **遮罩层** | Overlay | `UnifiedPanel` 外层 | 毛玻璃半透明背景（blur 8px），点击可关闭对话窗 |
| **选区编辑区** | Selection Editor | `UnifiedPanel` 顶部 | 已捕获选中文本的可编辑 textarea |
| **消息流** | Message Stream | `UnifiedPanel` 中部 | 上下滚动的消息气泡区域，含用户/AI 双方消息 |
| **思考块** | Thinking Block | `UnifiedPanel` 消息内 | AI 推理过程（reasoning_content）的可折叠展示区，SVG 箭头 |
| **输入栏** | Chat Input | `UnifiedPanel` 底部 | 文本输入框 + 发送/停止按钮，Enter 发送、Shift+Enter 换行 |
| **设置台** | Settings Console | `OptionsPage` | Chrome 扩展选项页，含外观卡、连接卡、动作卡 |
| **外观卡** | Appearance Card | `OptionsPage` 子区 | 设置台中 Auto / Light / Dark 分段控件切换 |
| **连接卡** | Connection Card | `OptionsPage` 子区 | 设置台中 API 地址、Key、模型、翻译语言配置 |
| **动作卡** | Actions Card | `OptionsPage` 子区 | 设置台中自定义动作按钮模板的增删编辑 |

---

## 1. 品牌色系统

### 1.1 主品牌色（青色系）

| 用途 | 浅色模式 | 深色模式 | 色值 |
|------|---------|---------|------|
| 主要交互 | `#0D9488` | `#2DD4BF` | Teal-600 / Teal-400 |
| 悬停状态 | `#0F766E` | `#14B8A6` | Teal-700 / Teal-500 |
| 激活状态 | `#115E59` | `#0D9488` | Teal-800 / Teal-600 |

**设计原则：**
- 青色代表科技感、专业性和信任，保持产品品牌标识
- 深色模式使用更亮的青色以确保可读性

### 1.2 强调色（Apple 系统蓝色）

| 用途 | 浅色模式 | 深色模式 | 色值 |
|------|---------|---------|------|
| CTA 按钮/链接 | `#007AFF` | `#0A84FF` | Apple System Blue |
| 悬停状态 | `#0066D6` | `#409CFF` | |
| 激活状态 | `#0055B3` | `#0066D6` | |

**设计原则：**
- Apple 系统蓝用于所有可交互元素（按钮、链接、焦点环）
- 与青色品牌色形成互补，增强视觉层次
- 参考 Apple HIG 的交互色规范

---

## 2. 语义颜色系统

### 2.1 背景色（bg）

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| `bg.page` | `#F5F5F7` | `#000000` | 页面背景（Apple 标志性浅灰） |
| `bg.surface` | `#FFFFFF` | `#1C1C1E` | 卡片/面板背景 |
| `bg.surfaceAlt` | `#F5F5F7` | `#000000` | 次级区域背景 |
| `bg.surfaceMuted` | `#E8E8ED` | `#2C2C2E` | 输入框/弱化背景 |
| `bg.overlay` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.6)` | 遮罩层 |
| `bg.glass` | `rgba(255,255,255,0.72)` | `rgba(28,28,30,0.72)` | 毛玻璃背景 |

### 2.2 文字色（text）

| Token | 浅色模式 | 深色模式 | 对比度（浅/深） |
|-------|---------|---------|----------------|
| `text.primary` | `#1D1D1F` | `#F5F5F7` | 15.4:1 / 18.3:1 |
| `text.secondary` | `#6E6E73` | `#98989D` | 4.6:1 / 5.6:1 |
| `text.inverse` | `#FFFFFF` | `#000000` | - / - |

### 2.3 边框色（border）

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| `border.default` | `#D2D2D7` | `#38383A` | 基础边框 |
| `border.strong` | `#1D1D1F` | `#F5F5F7` | 强调边框/焦点 |
| `border.subtle` | `#E5E5EA` | `#1C1C1E` | 弱化边框 |
| `border.hairline` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Apple 发丝边框 |

### 2.4 状态色（state）

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| `state.error` | `#FF3B30` | `#FF453A` | 错误文字/图标（Apple 红） |
| `state.errorBg` | `#FFF2F2` | `#2A0A0A` | 错误背景 |
| `state.warning` | `#FF9500` | `#FF9F0A` | 警告（Apple 橙） |
| `state.warningBg` | `#FFF8F0` | `#2A1F0A` | 警告背景 |
| `state.success` | `#34C759` | `#30D158` | 成功（Apple 绿） |
| `state.successBg` | `#F0FFF4` | `#0A2A12` | 成功背景 |
| `state.disabled` | `#AEAEB2` | `#636366` | 禁用态 |

---

## 3. 字体系统

### 3.1 字体族

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif;
```

**字体特性：**
- 优先使用 Apple 系统字体（SF Pro），确保 macOS/iOS 原生体验
- Inter 作为跨平台回退
- system-ui 确保各平台最佳渲染

### 3.2 字号层级

| Token | 像素值 | 用途 |
|-------|--------|------|
| `fontSize.xs` | 11px | 标签、辅助信息 |
| `fontSize.sm` | 12px | 辅助文字、标签 |
| `fontSize.md` | 14px | 正文、输入框 |
| `fontSize.lg` | 16px | 标题、重要文字 |
| `fontSize.xl` | 18px | 大标题 |
| `fontSize.xxl` | 22px | 面板标题 |
| `fontSize.title` | 28px | 页面主标题 |

### 3.3 字重层级

| Token | 值 | 用途 |
|-------|-----|------|
| `fontWeight.regular` | 400 | 正文 |
| `fontWeight.medium` | 500 | 标签、按钮文字 |
| `fontWeight.semibold` | 600 | 按钮、小标题 |
| `fontWeight.bold` | 700 | 大标题、品牌名 |

### 3.4 字间距

| Token | 值 | 用途 |
|-------|-----|------|
| `letterSpacing.tight` | -0.02em | 标题（紧凑） |
| `letterSpacing.normal` | 0em | 正文 |
| `letterSpacing.wide` | 0.02px | 标签（宽松） |

---

## 4. 间距系统

使用 4px 为基础单位的间距系统：

| Token | 像素值 | 用途 |
|-------|--------|------|
| `space[2]` | 2px | 极小间距 |
| `space[4]` | 4px | 最小间距 |
| `space[6]` | 6px | 紧凑间距 |
| `space[8]` | 8px | 标准间距 |
| `space[10]` | 10px | 中等间距 |
| `space[12]` | 12px | 常用间距 |
| `space[14]` | 14px | 消息气泡内边距 |
| `space[16]` | 16px | 区块间距 |
| `space[20]` | 20px | 大间距 |
| `space[24]` | 24px | 卡片内边距 |
| `space[28]` | 28px | 页面段落间距 |
| `space[32]` | 32px | 页面边距 |

---

## 5. 圆角系统

| Token | 像素值 | 用途 |
|-------|--------|------|
| `radius.sm` | 8px | 输入框、小按钮 |
| `radius.md` | 12px | 消息气泡、卡片 |
| `radius.lg` | 16px | 面板、大容器 |
| `radius.xl` | 20px | 对话窗外框 |
| `radius.pill` | 999px | 胶囊按钮、发送按钮 |

---

## 6. 阴影系统

### 6.1 标准阴影（Apple 风格多层阴影）

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow.sm` | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | 卡片、轻提示 |
| `shadow.md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)` | 按钮、工具条 |
| `shadow.lg` | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)` | 触发按钮 |
| `shadow.xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` | 对话窗、毛玻璃面板 |

**阴影使用原则：**
- 采用 Apple 风格的多层阴影（双层叠加），更自然立体
- 浅色模式：使用黑色阴影
- 深色模式：阴影效果减弱，依赖边框区分层次

---

## 7. 动画系统

### 7.1 时长（Duration）

| Token | 值 | 用途 |
|-------|-----|------|
| `durationFast` | 150ms | 微交互（hover、focus） |
| `durationNormal` | 220ms | 状态切换 |
| `durationExpanded` | 300ms | 展开/折叠 |
| `durationSlow` | 350ms | 复杂动画 |

### 7.2 缓动函数（Easing）

| Token | 值 | 用途 |
|-------|-----|------|
| `easingStandard` | `cubic-bezier(0.25, 0.1, 0.25, 1.0)` | 标准过渡（Apple 默认） |
| `easingSpring` | `cubic-bezier(0.34, 1.56, 0.64, 1.0)` | 弹性效果 |
| `easingDecelerate` | `cubic-bezier(0, 0, 0.2, 1)` | 元素进入（减速） |
| `easingAccelerate` | `cubic-bezier(0.4, 0, 1, 1)` | 元素退出（加速） |

### 7.3 组件动画规范

#### SelectionToolbar

**触发按钮：**
- 静态优雅状态，无无限循环动画
- 点击缩放反馈：`scale(0.92)` → `scale(1)` 弹簧过渡 200ms

**动作栏（原环形菜单）：**
- 毛玻璃容器从下方滑入：`translateY(6px) scale(0.96)` → `translateY(0) scale(1)`
- 每个药丸按钮 30ms 延迟依次入场
- 缓动：`easingSpring` 250ms

#### UnifiedPanel

**遮罩层：**
- 毛玻璃背景：`backdrop-filter: blur(8px)`
- 淡入：`opacity 0→1` 250ms `easingDecelerate`

**对话窗：**
- 弹簧缩放入场：`scale(0.92) translateY(20px)` → `scale(1) translateY(0)` 350ms `easingSpring`
- 发丝边框：`0.5px solid border.hairline`

**消息气泡：**
- 淡入 + 上移：`opacity: 0; translateY(8px)` → `opacity: 1; translateY(0)` 300ms `easingDecelerate`

**通用原则：**
- 所有动画时长控制在 150-350ms
- 优先使用 `transform` 和 `opacity`
- 支持 `prefers-reduced-motion` 媒体查询

---

## 8. 组件规范

### 8.1 SelectionToolbar

**触发按钮：**
- 尺寸：40×40px 圆形
- 渐变背景：`accent.primary` → `brand.primary`
- 阴影：`shadow.lg`
- 点击反馈：弹簧缩放

**动作栏：**
- 容器：毛玻璃背景（`bg.glass` + `backdrop-filter: blur(20px)`）
- 发丝边框：`0.5px solid border.hairline`
- 圆角：`radius.lg`（16px）
- 药丸按钮：高度 32px，`radius.pill`，hover 填充 `accent.primary`
- 定位：触发按钮上方居中

### 8.2 UnifiedPanel

**结构：**
- 遮罩层（毛玻璃，点击关闭）
- 标题栏（品牌标识 + SVG 关闭按钮）
- 选区编辑区（带"选中文本"标签）
- 消息区（可滚动，含思考块）
- 输入区（圆角输入框 + 药丸发送按钮）

**样式规范：**
- 面板宽度：`680px`，最大 `calc(100vw - 32px)`
- 面板高度：`min(70vh, calc(100vh - 32px))`
- 圆角：`radius.xl`（20px）
- 边框：`0.5px solid border.hairline`
- 关闭按钮：28×28px 圆形，hover 显示 `surfaceMuted` 背景
- 发送按钮：药丸形，`accent.primary` 背景，点击缩放反馈

### 8.3 Options Page

**布局：**
- 最大宽度 720px 居中
- 页面头部：40px 渐变图标 + 28px 粗体标题 + 16px 说明文字
- 卡片间距：16px
- 卡片样式：无边框，`shadow.sm` + `0.5px hairline border`

**主题切换（外观卡）：**
- Apple 分段控件样式
- 容器：`surfaceMuted` 背景，`radius.sm`，内边距 3px
- 选中项：`bg.surface` 背景 + `shadow.sm` + 粗体

**输入框（连接卡）：**
- 无边框，`surfaceMuted` 背景，`radius.sm`
- 焦点态：蓝色环 `0 0 0 3px accent.primary33`

**按钮：**
- 主按钮：药丸形，`accent.primary`，粗体，点击缩放
- 次按钮：药丸形，边框描边，透明背景
- 删除按钮：SVG 垃圾桶图标，hover 显示 `errorBg` 背景

---

## 9. 可访问性

### 9.1 颜色对比度

- 主文字：≥ 4.5:1（WCAG AA）— 实际 15.4:1（浅色）/ 18.3:1（深色）
- 次要文字：≥ 3:1 — 实际 4.6:1（浅色）/ 5.6:1（深色）
- Apple 状态色（红/橙/绿）均通过对比度验证

### 9.2 焦点管理

- 所有交互元素必须有可见焦点样式
- 焦点环：`0 0 0 3px accent.primary33`（Apple 蓝色半透明环）
- Tab 顺序符合视觉顺序

### 9.3 键盘导航

- 支持 Tab 导航
- 支持 Enter/Space 激活按钮
- 支持 Escape 关闭弹出层

### 9.4 动画可访问性

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.5 屏幕阅读器

- 所有图标按钮必须有 `aria-label`
- SVG 图标使用 `aria-hidden="true"`
- 状态变化使用 `aria-live` 通知

---

## 附录

### A. Token 文件位置

- 主题定义：`src/shared/ui/tokens.ts`
- 主题 Hook：`src/shared/ui/theme.ts`

### B. 更新日志

**v2.0.0 (2026-04-20) — Apple HIG 重构**
- 背景色切换为 Apple 标志性 `#F5F5F7` / `#000000`
- 强调色从橙色切换为 Apple 系统蓝 `#007AFF`
- 状态色对齐 Apple 调色板（`#FF3B30` / `#FF9500` / `#34C759`）
- 字体优先使用 SF Pro 系统字体
- 圆角增大，新增 `radius.xl`
- 阴影改为 Apple 风格多层阴影
- 缓动函数对齐 Apple 默认曲线
- 环形菜单改为毛玻璃横向药丸栏
- 对话窗添加毛玻璃遮罩和发丝边框
- 关闭按钮改为 SVG 图标 + 圆形背景
- 输入框采用无边框 `surfaceMuted` 风格
- 发送按钮改为药丸形 Apple 蓝
- 设置页改为分段控件 + 无边框卡片
- 删除按钮改为 SVG 垃圾桶图标
- 全局添加按压缩放反馈

**v1.0.0 (2025-04-17)**
- 初始版本
- 实现青色品牌色系统
- 定义深色/浅色双主题
- 建立完整的动画系统
- 规范组件样式

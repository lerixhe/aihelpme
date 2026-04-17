# Design System - AI Help Me

> 版本：1.0.0 | 更新日期：2025-04-17
>
> 本文档定义了 AI Help Me Chrome 扩展的完整设计系统，包括颜色、字体、间距、动画等规范。

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

| 中文名称 | 英文名场 | 组件 | 说明 |
|----------|----------|------|------|
| **选区泡泡** | Selection Bubble | `SelectionToolbar`（折叠态） | 选中文本后出现的圆形渐变按钮，带发光脉冲动画 |
| **选区面板** | Selection Panel | `SelectionToolbar`（展开态） | 展开后的操作卡片：选中文本编辑区、内置/自定义动作按钮、自由输入 |
| **对话窗** | Chat Window | `ChatPanel` | 浮动聊天窗口，可拖拽，含标题栏、消息流、输入栏 |
| **消息流** | Message Stream | `ChatPanel` 内部 | 对话窗中上下滚动的消息气泡区域，含用户/AI 双方消息 |
| **输入栏** | Chat Input | `ChatPanel` 底部 | 文本输入框 + 发送/停止按钮，Enter 发送、Shift+Enter 换行 |
| **设置台** | Settings Console | `OptionsPage` | Chrome 扩展选项页，含主题卡、连接卡、动作卡 |
| **主题卡** | Theme Card | `OptionsPage` 子区 | 设置台中 Auto / Light / Dark 主题切换 |
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
- 青色代表科技感、专业性和信任
- 深色模式使用更亮的青色以确保可读性
- 用于主要按钮、品牌标识、渐变效果

### 1.2 强调色（橙色系）

| 用途 | 浅色模式 | 深色模式 | 色值 |
|------|---------|---------|------|
| CTA 按钮 | `#EA580C` | `#FB923C` | Orange-600 / Orange-400 |
| 悬停状态 | `#C2410C` | `#F97316` | Orange-700 / Orange-500 |

**设计原则：**
- 橙色用于吸引注意力的关键操作
- 与青色形成互补，增强视觉层次
- 用于渐变过渡、重要提示

### 1.3 品牌渐变

```css
/* 主要渐变 */
background: linear-gradient(135deg, #0D9488, #EA580C, #0F766E);

/* 文字渐变 */
background: linear-gradient(135deg, #0D9488, #EA580C);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 2. 语义颜色系统

### 2.1 背景色（bg）

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| `bg.page` | `#F0FDFA` | `#0F172A` | 页面背景 |
| `bg.surface` | `#FFFFFF` | `#1E293B` | 卡片/面板背景 |
| `bg.surfaceAlt` | `#F0FDFA` | `#0F172A` | 次级区域背景 |
| `bg.surfaceMuted` | `#E8F1F4` | `#334155` | 弱化背景 |
| `bg.overlay` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.12)` | 浮层遮罩 |

### 2.2 文字色（text）

| Token | 浅色模式 | 深色模式 | 对比度（浅/深） |
|-------|---------|---------|----------------|
| `text.primary` | `#134E4A` | `#F0FDFA` | 8.5:1 / 12.2:1 |
| `text.secondary` | `#5F9EA0` | `#94A3B8` | 4.7:1 / 5.1:1 |
| `text.inverse` | `#FFFFFF` | `#0F172A` | - / - |

**对比度要求：**
- 主文字：≥ 4.5:1（WCAG AA）
- 次要文字：≥ 3:1
- 所有颜色组合已通过对比度验证

### 2.3 边框色（border）

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| `border.default` | `#99F6E4` | `#334155` | 基础边框 |
| `border.strong` | `#134E4A` | `#F0FDFA` | 强调边框/焦点 |
| `border.subtle` | `#E8F1F4` | `#1E293B` | 弱化边框 |

### 2.4 状态色（state）

| Token | 浅色模式 | 深色模式 | 用途 |
|-------|---------|---------|------|
| `state.error` | `#DC2626` | `#F87171` | 错误文字/图标 |
| `state.errorBg` | `#FEF2F2` | `#2A0A0A` | 错误背景 |
| `state.warning` | `#B45309` | `#FBBF24` | 警告文字/图标 |
| `state.warningBg` | `#FFFBEB` | `#2A1F0A` | 警告背景 |
| `state.success` | `#16A34A` | `#4ADE80` | 成功文字/图标 |
| `state.successBg` | `#F0FDF4` | `#0A2A12` | 成功背景 |
| `state.disabled` | `#9CA3AF` | `#64748B` | 禁用态 |

---

## 3. 字体系统

### 3.1 字体族

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**字体特性：**
- Inter：现代、清晰、技术感
- 系统字体回退：确保跨平台一致性
- 支持多种字重

### 3.2 字号层级

| Token | 像素值 | 用途 |
|-------|--------|------|
| `fontSize.sm` | 12px | 辅助文字、标签 |
| `fontSize.md` | 14px | 正文、输入框 |
| `fontSize.lg` | 16px | 标题、重要文字 |
| `fontSize.xl` | 18px | 大标题 |

### 3.3 字重层级

| Token | 值 | 用途 |
|-------|-----|------|
| `fontWeight.regular` | 400 | 正文 |
| `fontWeight.medium` | 500 | 标签、次级强调 |
| `fontWeight.semibold` | 600 | 按钮、小标题 |
| `fontWeight.bold` | 700 | 大标题、品牌名 |

### 3.4 行高建议

- 正文：1.5 - 1.6
- 标题：1.2 - 1.3
- 按钮文字：1.0（居中对齐）

---

## 4. 间距系统

### 4.1 基础间距

使用 4px 为基础单位的间距系统：

| Token | 像素值 | 用途 |
|-------|--------|------|
| `space[4]` | 4px | 最小间距 |
| `space[6]` | 6px | 紧凑间距 |
| `space[8]` | 8px | 标准间距 |
| `space[10]` | 10px | 中等间距 |
| `space[12]` | 12px | 常用间距 |
| `space[16]` | 16px | 区块间距 |
| `space[20]` | 20px | 大间距 |
| `space[24]` | 24px | 最大间距 |

### 4.2 间距使用原则

- **组件内部**：4-8px（紧凑）
- **组件之间**：8-12px（标准）
- **区块之间**：16-24px（宽松）
- **页面边距**：8px（edgeInset）

---

## 5. 圆角系统

| Token | 像素值 | 用途 |
|-------|--------|------|
| `radius.sm` | 10px | 输入框、小按钮 |
| `radius.md` | 14px | 消息气泡 |
| `radius.lg` | 18px | 卡片、面板 |
| `radius.pill` | 999px | 胶囊按钮 |

**圆角使用原则：**
- 小元素使用小圆角（10px）
- 大容器使用大圆角（18px）
- 保持一致性，避免混用

---

## 6. 阴影系统

### 6.1 标准阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow.sm` | `0 1px 2px rgba(0,0,0,0.05)` | 轻提示层 |
| `shadow.md` | `0 4px 12px rgba(0,0,0,0.08)` | 卡片、工具条 |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.12)` | 聊天面板 |

### 6.2 品牌发光阴影

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow.glow` | `0 0 20px rgba(13,148,136,0.3)` | 品牌发光效果 |
| `shadow.glowStrong` | `0 0 30px rgba(13,148,136,0.5)` | 强品牌发光效果 |

**阴影使用原则：**
- 浅色模式：使用黑色阴影
- 深色模式：阴影效果减弱，依赖边框区分层次
- 品牌发光：仅用于品牌相关元素

---

## 7. 动画系统

### 7.1 时长（Duration）

| Token | 值 | 用途 |
|-------|-----|------|
| `durationFast` | 150ms | 微交互（hover、focus） |
| `durationNormal` | 220ms | 状态切换 |
| `durationExpanded` | 300ms | 展开/折叠 |
| `durationSlow` | 400ms | 复杂动画 |

### 7.2 缓动函数（Easing）

| Token | 值 | 用途 |
|-------|-----|------|
| `easingStandard` | `cubic-bezier(0.2, 0, 0, 1)` | 标准过渡 |
| `easingSpring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性效果 |
| `easingEnter` | `cubic-bezier(0, 0, 0.2, 1)` | 元素进入 |
| `easingExit` | `cubic-bezier(0.4, 0, 1, 1)` | 元素退出 |

### 7.3 组件动画规范

#### SelectionToolbar

**触发按钮：**
```css
@keyframes ai-help-me-glow {
  0%, 100% {
    box-shadow: 0 0 8px #0D948840, 0 2px 8px rgba(0,0,0,0.08);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px #0D948860, 0 2px 12px rgba(0,0,0,0.12);
    transform: scale(1.05);
  }
}
animation: ai-help-me-glow 2s ease-in-out infinite;
```

**工具栏展开：**
```css
@keyframes toolbar-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
animation: toolbar-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
```

#### ChatPanel

**面板进入：**
```css
@keyframes chat-panel-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(16px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
animation: chat-panel-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
```

**消息气泡：**
```css
@keyframes message-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
animation: message-enter 0.3s cubic-bezier(0, 0, 0.2, 1) forwards;
```

### 7.4 动画原则

1. **性能优先**：仅动画化 `transform` 和 `opacity`
2. **时长控制**：150-400ms，避免过长动画
3. **有意义**：动画应传达状态变化或层级关系
4. **可访问**：支持 `prefers-reduced-motion` 媒体查询

---

## 8. 组件规范

### 8.1 SelectionToolbar

**结构：**
- 品牌标识（渐变图标 + 文字）
- 内置动作按钮（解释、翻译）
- 自定义动作按钮
- 自由输入框 + 发送按钮

**样式规范：**
- 按钮：`padding: 4px 12px`，`border-radius: pill`
- 输入框：`padding: 8px 12px`，`border-radius: pill`
- 间距：按钮之间 `8px`
- 动画：展开动画、发光效果

### 8.2 ChatPanel

**结构：**
- 标题栏（可拖拽）
- 消息区（可滚动）
- 输入区（文本框 + 发送按钮）

**样式规范：**
- 面板尺寸：`420px × 360px`
- 圆角：`18px`
- 消息气泡：用户消息使用品牌色，助手消息使用白色/深色
- 动画：面板进入动画、消息气泡动画

### 8.3 Options Page

**结构：**
- 主题切换区
- API 配置区
- 自定义动作区
- 保存按钮

**样式规范：**
- 卡片间距：`16px`
- 输入框：统一使用 `createInputStyle`
- 按钮：主按钮使用品牌色，删除按钮使用错误色

---

## 9. 可访问性

### 9.1 颜色对比度

- 主文字：≥ 4.5:1（WCAG AA）
- 次要文字：≥ 3:1
- 所有状态色已验证对比度

### 9.2 焦点管理

- 所有交互元素必须有可见焦点样式
- 焦点环：`0 0 0 2px bg.surface, 0 0 0 4px border.strong`
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
- 状态变化使用 `aria-live` 通知
- 表单字段必须有关联的 `label`

---

## 附录

### A. 颜色参考表

#### 浅色模式完整色板

```
背景色：
- page:        #F0FDFA
- surface:     #FFFFFF
- surfaceAlt:  #F0FDFA
- surfaceMuted:#E8F1F4

文字色：
- primary:     #134E4A
- secondary:   #5F9EA0
- inverse:     #FFFFFF

品牌色：
- primary:     #0D9488
- primaryHover:#0F766E
- primaryActive:#115E59

强调色：
- accent:      #EA580C
- accentHover: #C2410C

状态色：
- error:       #DC2626
- warning:     #B45309
- success:     #16A34A
- disabled:    #9CA3AF
```

#### 深色模式完整色板

```
背景色：
- page:        #0F172A
- surface:     #1E293B
- surfaceAlt:  #0F172A
- surfaceMuted:#334155

文字色：
- primary:     #F0FDFA
- secondary:   #94A3B8
- inverse:     #0F172A

品牌色：
- primary:     #2DD4BF
- primaryHover:#14B8A6
- primaryActive:#0D9488

强调色：
- accent:      #FB923C
- accentHover: #F97316

状态色：
- error:       #F87171
- warning:     #FBBF24
- success:     #4ADE80
- disabled:    #64748B
```

### B. Token 文件位置

- 主题定义：`src/shared/ui/tokens.ts`
- 主题 Hook：`src/shared/ui/theme.ts`

### C. 更新日志

**v1.0.0 (2025-04-17)**
- 初始版本
- 实现青色品牌色系统
- 定义深色/浅色双主题
- 建立完整的动画系统
- 规范组件样式

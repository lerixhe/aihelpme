# UI Design Guidelines

> 适用范围：AI Help Me Chrome 扩展（内容页浮层 + Options 设置页）
>
> 目标：确保后续新增功能在视觉、交互、可访问性上保持一致，避免页面风格漂移。

## 1. Design Principles

1. **Apple 风格极简**：参考 Apple HIG 设计语言，使用 SF Pro 系统字体、毛玻璃效果、多层阴影、发丝边框。
2. **低干扰浮层**：内容页 UI 不应压制宿主网页，强调"可用但克制"。遮罩使用毛玻璃而非纯色。
3. **状态清晰**：hover/focus/active/disabled/loading 必须可辨识，按压缩放反馈。
4. **跨页面一致**：内容页与 Options 使用同一视觉语言（颜色、圆角、间距、字体）。
5. **可访问性优先**：在深浅主题下都要保证对比度、键盘可达和可见焦点。

## 2. Theme Rules (Light / Dark)

- 必须同时支持浅色和深色。
- 深色模式不是反色，需单独定义语义色并验证可读性。
- 所有组件使用**语义颜色**，禁止在组件内散落任意 hex 值。

### 2.1 Brand Colors

**主品牌色（青色系）：**
- `brand.primary`：`#0D9488` (Teal-600) - 浅色模式
- `brand.primary`：`#2DD4BF` (Teal-400) - 深色模式
- `brand.primaryHover`：`#0F766E` (Teal-700) - 浅色模式
- `brand.primaryHover`：`#14B8A6` (Teal-500) - 深色模式

**强调色（橙色系）：**
- `accent.primary`：`#EA580C` (Orange-600) - 浅色模式
- `accent.primary`：`#FB923C` (Orange-400) - 深色模式
- `accent.primaryHover`：`#C2410C` (Orange-700) - 浅色模式
- `accent.primaryHover`：`#F97316` (Orange-500) - 深色模式

### 2.2 Semantic Color Roles

**背景色（bg）：**
- `bg.page`：页面背景
  - 浅色：`#F0FDFA` (Teal-50)
  - 深色：`#0F172A` (Slate-900)
- `bg.surface`：卡片/面板背景
  - 浅色：`#FFFFFF`
  - 深色：`#1E293B` (Slate-800)
- `bg.surfaceAlt`：次级区域（消息区、分组背景）
  - 浅色：`#F0FDFA` (Teal-50)
  - 深色：`#0F172A` (Slate-900)
- `bg.surfaceMuted`：弱化背景
  - 浅色：`#E8F1F4`
  - 深色：`#334155` (Slate-700)
- `bg.overlay`：浮层遮罩/叠加层
  - 浅色：`rgba(0, 0, 0, 0.08)`
  - 深色：`rgba(255, 255, 255, 0.12)`

**文字色（text）：**
- `text.primary`：主文本
  - 浅色：`#134E4A` (Teal-900)
  - 深色：`#F0FDFA` (Teal-50)
- `text.secondary`：说明文本
  - 浅色：`#5F9EA0` (CadetBlue)
  - 深色：`#94A3B8` (Slate-400)
- `text.inverse`：深底浅字
  - 浅色：`#FFFFFF`
  - 深色：`#0F172A` (Slate-900)

**边框色（border）：**
- `border.default`：基础边框
  - 浅色：`#99F6E4` (Teal-200)
  - 深色：`#334155` (Slate-700)
- `border.strong`：强调边框/焦点边界
  - 浅色：`#134E4A` (Teal-900)
  - 深色：`#F0FDFA` (Teal-50)
- `border.subtle`：弱化边框
  - 浅色：`#E8F1F4`
  - 深色：`#1E293B` (Slate-800)

**状态色（state）：**
- `state.error`：错误状态
  - 浅色：`#DC2626` (Red-600)
  - 深色：`#F87171` (Red-400)
- `state.errorBg`：错误背景
  - 浅色：`#FEF2F2` (Red-50)
  - 深色：`#2A0A0A`
- `state.warning`：警告状态
  - 浅色：`#B45309` (Orange-700)
  - 深色：`#FBBF24` (Yellow-400)
- `state.warningBg`：警告背景
  - 浅色：`#FFFBEB` (Yellow-50)
  - 深色：`#2A1F0A`
- `state.success`：成功状态
  - 浅色：`#16A34A` (Green-600)
  - 深色：`#4ADE80` (Green-400)
- `state.successBg`：成功背景
  - 浅色：`#F0FDF4` (Green-50)
  - 深色：`#0A2A12`
- `state.disabled`：禁用态
  - 浅色：`#9CA3AF` (Gray-400)
  - 深色：`#64748B` (Slate-500)

### 2.3 Contrast Targets

- 普通正文目标对比度：**≥ 4.5:1**
- 辅助文本、图标：尽量 ≥ 3:1
- 错误/成功状态不得仅靠颜色表达，必须配合文案或形态变化。
- 青色品牌色在深浅主题下均需验证与背景的对比度。

## 3. Typography

- 字体：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif`
- 字号层级：`11 / 12 / 14 / 16 / 18 / 22 / 28`
- 字重层级：
  - 400：正文
  - 500：标签/按钮
  - 600：按钮/小标题
  - 700：大标题
- 字间距：标题 `-0.02em`，正文 `0em`，标签 `0.02em`
- 行高：正文建议 1.5–1.55，避免拥挤。

## 4. Spacing, Radius, Elevation

### 4.1 Spacing Rhythm

统一使用节奏：`4 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 / 32`。

### 4.2 Radius

- `radius.sm = 8`：输入框、小按钮
- `radius.md = 12`：消息气泡、卡片
- `radius.lg = 16`：面板、大容器
- `radius.xl = 20`：对话窗外框
- `radius.pill = 999`：胶囊按钮、发送按钮

### 4.3 Elevation

Apple 风格多层阴影：
- `shadow.sm`：`0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)` - 卡片
- `shadow.md`：`0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)` - 按钮/工具条
- `shadow.lg`：`0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)` - 触发按钮
- `shadow.xl`：`0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` - 对话窗

### 4.4 Layering

- 扩展浮层保持高层级（延续现有 `zIndex` 语义），避免被宿主页面遮挡。
- 新增浮层组件必须使用统一层级定义，禁止各组件自行“抬 z-index”。

## 5. Animation & Motion

### 5.1 Duration

- `durationFast`：`150ms` - 微交互（hover、focus）
- `durationNormal`：`220ms` - 状态切换
- `durationExpanded`：`300ms` - 展开/折叠
- `durationSlow`：`350ms` - 复杂动画

### 5.2 Easing Functions

- `easingStandard`：`cubic-bezier(0.25, 0.1, 0.25, 1.0)` - 标准过渡（Apple 默认）
- `easingSpring`：`cubic-bezier(0.34, 1.56, 0.64, 1.0)` - 弹性效果
- `easingDecelerate`：`cubic-bezier(0, 0, 0.2, 1)` - 元素进入（减速）
- `easingAccelerate`：`cubic-bezier(0.4, 0, 1, 1)` - 元素退出（加速）

### 5.3 Component Animations

**SelectionToolbar：**
- 触发按钮：静态优雅，点击缩放反馈 `scale(0.92)` → `scale(1)` 弹簧过渡
- 动作栏：毛玻璃容器从下方滑入（`scale(0.96) translateY(6px)` → `scale(1) translateY(0)`）
- 药丸按钮：30ms 延迟依次入场

**ChatPanel：**
- 遮罩：毛玻璃 `backdrop-filter: blur(8px)` + 淡入 250ms
- 面板进入：弹簧缩放（`scale(0.92) translateY(20px)` → `scale(1) translateY(0)` 350ms）
- 消息气泡：淡入 + 上移（`opacity: 0; translateY(8px)` → `opacity: 1; translateY(0)` 300ms）

**通用原则：**
- 所有动画时长控制在 150-350ms
- 优先使用 `transform` 和 `opacity`，避免动画化 `width/height/top/left`
- 支持 `prefers-reduced-motion` 媒体查询，禁用或弱化动画
- 所有可交互元素添加按压缩放反馈（scale 0.92–0.97）

## 6. Interaction States

每个可交互元素至少具备：

1. 默认态
2. hover（桌面）
3. focus（键盘可见）
4. active（按下）
5. disabled
6. loading（异步操作期间）

规则：
- focus 必须清晰可见，不可移除。
- disabled 必须同时表现为视觉弱化 + 交互禁用。
- loading 按钮需阻止重复提交并给出状态反馈。

## 7. Component Specs

## 7.1 SelectionToolbar

- 结构：品牌标识 + 内置动作 + 自定义动作 + 自由输入。
- 布局：横向排列，可在窄窗口横向滚动。
- 按钮：统一高度/内边距/圆角，不得混用多套按钮风格。
- 输入框：与按钮视觉一致，focus 态明显。
- 定位：继续使用边缘 clamp 策略，避免贴边溢出。

## 7.2 ChatPanel

- 结构：标题栏（可拖拽）+ 消息区 + 输入区。
- 标题栏：拖拽区域清晰，关闭按钮点击区域充足。
- 消息气泡：用户/助手通过位置与背景区分；文本可换行。
- 输入区：发送按钮与文本输入高度协调，状态反馈清晰。
- 行为：保留 Enter 发送 / Shift+Enter 换行。

## 7.3 Options Page

- 结构：设置分组卡片 + 自定义动作列表 + 保存区。
- 字段：标签、输入、提示文本层级明确。
- 错误：就近显示在对应字段/行附近。
- 保存反馈：显示 saving/success/error，不可静默失败。

## 8. Accessibility Baseline

1. 键盘可达：核心控件可通过 Tab 操作，顺序符合视觉顺序。
2. 焦点可见：输入、按钮、关闭按钮有可见 focus ring。
3. 触达尺寸：关键点击区域尽量接近/达到 44px。
4. 错误提示：文案明确说明“原因 + 如何修复”。
5. Reduced Motion：用户偏好减少动效时，禁用或弱化动画。

## 9. Do / Don’t

### Do

- 使用语义 token（颜色、间距、圆角、阴影）
- 在深浅主题都检查可读性
- 保持内容页与 Options 的视觉统一
- 为异步交互提供明确反馈

### Don’t

- 不要在组件内散落新的硬编码色值
- 不要移除焦点样式
- 不要仅靠颜色表达错误/禁用
- 不要为单个页面引入与全局冲突的新样式体系

## 10. PR Checklist (UI Changes)

每个涉及 UI 的 PR 必须自检：

- [ ] 是否遵循本规范的颜色/字体/间距/圆角/阴影系统
- [ ] 是否同时验证浅色与深色主题
- [ ] 是否覆盖默认/hover/focus/active/disabled/loading 状态
- [ ] 是否保证关键文本与控件可读性（含深色模式）
- [ ] 是否保持与现有组件风格一致
- [ ] 是否遵循动画规范（时长、缓动函数、transform 优先）
- [ ] 是否支持 `prefers-reduced-motion` 媒体查询
- [ ] 是否未破坏核心约束（selection 触发、root 事件隔离、pointer events、消息链路、`{text}` 校验）

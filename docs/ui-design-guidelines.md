# UI Design Guidelines

> 适用范围：AI Help Me Chrome 扩展（内容页浮层 + Options 设置页）
>
> 目标：确保后续新增功能在视觉、交互、可访问性上保持一致，避免页面风格漂移。

## 1. Design Principles

1. **现代极简**：减少装饰性元素，优先信息层级和可读性。
2. **低干扰浮层**：内容页 UI 不应压制宿主网页，强调“可用但克制”。
3. **状态清晰**：hover/focus/active/disabled/loading 必须可辨识。
4. **跨页面一致**：内容页与 Options 使用同一视觉语言（颜色、圆角、间距、字体）。
5. **可访问性优先**：在深浅主题下都要保证对比度、键盘可达和可见焦点。

## 2. Theme Rules (Light / Dark)

- 必须同时支持浅色和深色。
- 深色模式不是反色，需单独定义语义色并验证可读性。
- 所有组件使用**语义颜色**，禁止在组件内散落任意 hex 值。

### 2.1 Semantic Color Roles

- `bg.page`：页面背景
- `bg.surface`：卡片/面板背景
- `bg.surfaceAlt`：次级区域（消息区、分组背景）
- `bg.overlay`：浮层遮罩/叠加层
- `text.primary`：主文本
- `text.secondary`：说明文本
- `text.inverse`：深底浅字
- `border.default`：基础边框
- `border.strong`：强调边框/焦点边界
- `brand.primary`：主按钮/主交互
- `brand.primaryHover`：主按钮 hover
- `brand.primaryActive`：主按钮 active
- `state.error`：错误状态
- `state.warning`：警告状态
- `state.success`：成功状态
- `state.disabled`：禁用态

### 2.2 Contrast Targets

- 普通正文目标对比度：**≥ 4.5:1**
- 辅助文本、图标：尽量 ≥ 3:1
- 错误/成功状态不得仅靠颜色表达，必须配合文案或形态变化。

## 3. Typography

- 字体：`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- 字号层级：`12 / 13 / 14 / 16`
- 字重层级：
  - 400：正文
  - 500：标签/次级强调
  - 600：按钮/小标题
- 行高：正文建议 1.45–1.6，避免拥挤。

## 4. Spacing, Radius, Elevation

### 4.1 Spacing Rhythm

统一使用节奏：`4 / 8 / 12 / 16 / 20`。

### 4.2 Radius

- `radius.sm = 8`：输入框、小按钮
- `radius.md = 10`：消息气泡
- `radius.lg = 12`：卡片/面板
- `radius.pill = 999`：胶囊按钮/工具条

### 4.3 Elevation

- `shadow.sm`：轻提示层
- `shadow.md`：卡片/工具条
- `shadow.lg`：聊天面板

### 4.4 Layering

- 扩展浮层保持高层级（延续现有 `zIndex` 语义），避免被宿主页面遮挡。
- 新增浮层组件必须使用统一层级定义，禁止各组件自行“抬 z-index”。

## 5. Interaction States

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

## 6. Component Specs

## 6.1 SelectionToolbar

- 结构：品牌标识 + 内置动作 + 自定义动作 + 自由输入。
- 布局：横向排列，可在窄窗口横向滚动。
- 按钮：统一高度/内边距/圆角，不得混用多套按钮风格。
- 输入框：与按钮视觉一致，focus 态明显。
- 定位：继续使用边缘 clamp 策略，避免贴边溢出。

## 6.2 ChatPanel

- 结构：标题栏（可拖拽）+ 消息区 + 输入区。
- 标题栏：拖拽区域清晰，关闭按钮点击区域充足。
- 消息气泡：用户/助手通过位置与背景区分；文本可换行。
- 输入区：发送按钮与文本输入高度协调，状态反馈清晰。
- 行为：保留 Enter 发送 / Shift+Enter 换行。

## 6.3 Options Page

- 结构：设置分组卡片 + 自定义动作列表 + 保存区。
- 字段：标签、输入、提示文本层级明确。
- 错误：就近显示在对应字段/行附近。
- 保存反馈：显示 saving/success/error，不可静默失败。

## 7. Accessibility Baseline

1. 键盘可达：核心控件可通过 Tab 操作，顺序符合视觉顺序。
2. 焦点可见：输入、按钮、关闭按钮有可见 focus ring。
3. 触达尺寸：关键点击区域尽量接近/达到 44px。
4. 错误提示：文案明确说明“原因 + 如何修复”。
5. Reduced Motion：用户偏好减少动效时，禁用或弱化动画。

## 8. Do / Don’t

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

## 9. PR Checklist (UI Changes)

每个涉及 UI 的 PR 必须自检：

- [ ] 是否遵循本规范的颜色/字体/间距/圆角/阴影系统
- [ ] 是否同时验证浅色与深色主题
- [ ] 是否覆盖默认/hover/focus/active/disabled/loading 状态
- [ ] 是否保证关键文本与控件可读性（含深色模式）
- [ ] 是否保持与现有组件风格一致
- [ ] 是否未破坏核心约束（selection 触发、root 事件隔离、pointer events、消息链路、`{text}` 校验）

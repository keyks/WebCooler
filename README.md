# WebCooler

> 万能 Web 前端模板与交互效果库 —— 一个模板即一段可直接复制的 HTML / CSS / JS。

WebCooler 是一个面向前端开发者的**素材库 + 实时预览 + 一键复制**工具。它把常用的 UI 组件、交互动效、鼠标/键盘效果、文本排版、页面布局等沉淀为标准化模板，每个模板都能在浏览器里**实时调参、所见即所得**，复制出来的代码与预览效果 100% 一致。

---

## ✨ 核心特性

- **📦 150+ 开箱即用模板**：覆盖布局、特效、鼠标交互、键盘交互、文本排版、UI 组件六大类。
- **🎚 每个模板的「专属滑块」**：根据每个模板自身结构智能推断贴合其特点的控制项（进度条可调「进度/粗细」、3D 卡片可调「倾斜角度/透视强度」、开关可调「开合状态」……），而非所有卡片共用同一套通用参数。
- **📝 自动结构注释**：复制代码时，被调节的参数会自动注入中文注释 + 精确覆盖规则，例如：
  ```css
  /* 【进度】拖动“进度”滑块实时调节进度条 .fill 的 width（当前 65%，改此数值即可） */
  #wc-root .fill{width:65% !important}
  ```
  用户拿到代码后，一眼就知道「改哪个元素的哪个属性」。
- **🎨 通用参数**：尺寸、位移、圆角、双主色、背景、动画速度 —— 一键套用到任意模板。
- **🌗 明暗主题**：内置暗色 / 亮色切换，跟随系统或可手动选择。
- **📋 一键复制**：HTML / CSS / JS 分块高亮展示，点击即复制；也可「应用并预览」自定义修改后的源码。
- **↩️ 撤销 / 重做**：所有参数调节（含专属滑块）都进入历史栈，可随时回退。
- **🤖 自动演示**：支持自动播放模板动效，并可用滑块调节演示速度。
- **📱 响应式**：基于 Tailwind，移动端到桌面端自适应。

---

## 🗂 模板分类

| 分类 key | 说明 | 典型模板 |
| --- | --- | --- |
| `layout` | 页面布局 | 网格、瀑布流、卡片流 |
| `effect` | 视觉特效 | 滚动进度、滚动显隐、故障字、渐变 |
| `mouse` | 鼠标交互 | 点击涟漪、跟随粒子、悬停位移/放大 |
| `keyboard` | 键盘交互 | 回车提交、打字机、快捷键提示 |
| `text` | 文本排版 | 渐变文字、描边、字间距/行距调节 |
| `component` | UI 组件 | 进度条（直线/圆形/渐变/动画）、开关、滑块、3D 卡片、按钮涟漪 |

热门与推荐模板在首页以卡片墙形式展示（`FEATURED` / `HOT` 常量控制）。

---

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18
- npm（或 pnpm / yarn）

### 安装与运行

```bash
# 安装依赖
npm install

# 启动本地开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本到 dist/
npm run build

# 本地预览构建产物
npm run preview
```

### 目录与页面

| 入口页 | 路由文件 | 说明 |
| --- | --- | --- |
| `index.html` | `src/js/pages/home.js` | 首页：模板卡片墙、搜索、分类导航 |
| `detail.html` | `src/js/pages/detail.js` | 详情页：实时预览 + 参数调节 + 代码复制 |
| `categories.html` | `src/js/pages/categories.js` | 分类总览 |
| `downloads.html` | `src/js/pages/downloads.js` | 资源/源码下载 |
| `workbench.html` | `src/js/pages/workbench.js` | 工作台（组合 / 实验） |

---

## 🧱 项目结构

```
WebCooler/
├─ index.html / detail.html / categories.html / downloads.html / workbench.html
├─ src/
│  ├─ styles/main.css          # Tailwind 入口 + 基础样式
│  └─ js/
│     ├─ ui.js                 # 公共 UI 组件（toast 等）
│     ├─ data/                 # 模板数据源（纯数据，无逻辑）
│     │  ├─ index.js           # 聚合全部模板 + getById/getByCat/search
│     │  ├─ categories.js      # 分类定义（CATEGORIES）
│     │  ├─ layouts.js         # 布局类模板
│     │  ├─ effects.js         # 特效类模板
│     │  ├─ mouse.js           # 鼠标交互类模板
│     │  ├─ keyboard.js        # 键盘交互类模板
│     │  ├─ text.js            # 文本排版类模板
│     │  └─ components.js      # UI 组件类模板（含部分精配 controls）
│     ├─ pages/                # 各页面业务逻辑
│     └─ utils/
│        ├─ preview.js         # iframe 沙箱预览 + 参数应用 + 代码生成(buildCode)
│        ├─ controls.js        # ★ 专属滑块引擎（inferControls / controlToPatch）
│        ├─ highlight.js       # 代码语法高亮
│        ├─ storage.js         # 本地存储（收藏/历史）
│        └─ theme.js           # 明暗主题切换
├─ tailwind.config.js / postcss.config.js
└─ vite.config.js
```

---

## ⚙️ 模板数据格式

每个模板是 `src/js/data/*.js` 中的一个纯对象，统一结构如下：

```js
{
  id:    'cp-prog-line',                 // 唯一 ID（用于路由与查询）
  cat:   'component',                    // 分类 key（见上表）
  title: '直线进度',                     // 中文标题
  tags:  ['进度条'],                     // 标签（用于搜索）
  desc:  '',                             // 描述（可选）
  html:  `<div class="bar">...</div>`,   // HTML 片段（无需 <html>/<body>）
  css:   `.bar{...}`,                    // CSS（作用域在 #wc-root 内）
  js:    ``,                             // JS（在沙箱内执行，可选）
}
```

### 为模板声明「专属滑块」（可选）

模板可声明 `controls` 字段进行**精配**；不声明时由 `inferControls()` 按结构自动推断。

```js
controls: [
  {
    key: 'progress',          // 唯一键
    label: '进度',            // 控制面板显示名
    type: 'range',            // 'range' | 'toggle'
    min: 0, max: 100, step: 1, unit: '%', value: 65,
    selector: '.fill',        // 作用的选择器（相对 #wc-root 内）
    prop: 'width',            // 作用的 CSS 属性
    format: v => `${v}%`,     // 数值 → 实际 CSS 值
    hint: '拖动“进度”滑块实时调节进度条 .fill 的 width'
  },
  {
    key: 'realtime', type: 'toggle', value: true,
    selector: '.fill', prop: 'animation-play-state',
    on: 'running', off: 'paused', hint: '开关“实时进度动画”'
  }
]
```

#### 运行原理（隔离安全）

- 预览在 **iframe 沙箱**中渲染，每个专属控制项通过 `postMessage` 下发 `{ key, selector, prop, value }`。
- 沙箱内按 `#wc-root <selector>{ <prop>:<value> !important }` 精确覆盖，**只影响目标元素，绝不误伤其它元素**。
- 特殊属性支持：`checked`（开关）、`value`（表单数值）、`content-text`（文本内容）。
- 复制代码时，`buildCode()` 会把每个被调节项自动写入「中文结构注释 + 覆盖规则」，实现所见即所得的手改友好代码。

---

## 🛠 技术栈

- **构建**：[Vite](https://vitejs.dev/) 5
- **样式**：[Tailwind CSS](https://tailwindcss.com/) 3 + PostCSS + Autoprefixer
- **动画**：[GSAP](https://gsap.com/) 3（部分动效模板）
- **架构**：原生 ES Module，无前端框架；数据层（data/）与视图层（pages/）分离。

---

## 📤 部署

`npm run build` 会输出到 `dist/`，可直接托管到任意静态服务器（GitHub Pages / Vercel / Nginx 等）。

GitHub Pages 示例（gh-pages 分支 / Actions 部署）：

```bash
npm run build
# 将 dist/ 内容发布到 gh-pages 分支或你的静态托管
```

---

## 📄 许可证

本项目仅供学习与商业项目自由使用。模板代码均为可复制片段，无额外授权限制。

// ────────────────────────────────────────────────────────────
// 模板「专属滑块」引擎
// ────────────────────────────────────────────────────────────
// 目标：为「每一个模板」生成贴合其自身特点的独特控制项（滑块 / 开关 /
//       选择器 / 数值），而不是所有卡片共用同一套通用滑块。
//
// 设计：
//  1) 每个 control 描述「一个可调参数」，包含：
//     - key       : 唯一键（用于状态、CSS 变量名 --wc-x-<key>）
//     - label     : 中文标签（显示在控制面板 + 注入到代码注释）
//     - type      : 'range' | 'toggle' | 'color'
//     - min/max/step/unit/value : range 类型的取值
//     - selector  : 作用的 CSS 选择器（相对 #wc-root 内部）
//     - prop      : 作用的 CSS 属性（如 width / animation-duration / transform）
//     - format    : 由数值生成实际 CSS 值的函数（如 v => v+'%'）
//     - hint      : 注入到导出代码里的中文说明（『拖动可调…』）
//  2) 模板可显式声明 `controls`（数组）来精配；未声明时由 inferControls()
//     根据 html/css/js 逐个智能推断，保证「每个卡片都有专属滑块」。
//
// 运行原理（预览联动）：
//  - 每个 control 在 iframe 内注册为一条「行内样式覆盖规则」，通过
//    postMessage 下发 { key, css }，iframe 只对该 selector 应用该 prop，
//    绝不误伤其它元素（与既有 token 机制一致的隔离思路）。
// ────────────────────────────────────────────────────────────

// 从 CSS 里读取某选择器某属性的「初始数值」（用于滑块默认值）
function readNum(css, selector, prop, fallback) {
  if (!css) return fallback;
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc + '\\s*\\{([^}]*)\\}', 'i');
  const m = re.exec(css);
  if (!m) return fallback;
  const pm = new RegExp(prop + '\\s*:\\s*([-\\d.]+)', 'i').exec(m[1]);
  return pm ? parseFloat(pm[1]) : fallback;
}

// 从 inline style（html）里读取 width 百分比（进度条常见 style="width:65%"）
function readInlinePercent(html, fallback) {
  const m = /width\s*:\s*([\d.]+)%/i.exec(html || '');
  return m ? parseFloat(m[1]) : fallback;
}

// 读取动画时长（秒），从 animation 简写或 animation-duration 里取
function readAnimDuration(css, fallback) {
  if (!css) return fallback;
  const m = /animation(?:-duration)?\s*:\s*[^;]*?([\d.]+)s/i.exec(css);
  return m ? parseFloat(m[1]) : fallback;
}

// 便捷构造器
const R = (o) => ({ type: 'range', ...o });

// ────────────────────────────────────────────────────────────
// 智能推断：为单个模板生成专属 controls
// ────────────────────────────────────────────────────────────
export function inferControls(t) {
  // 1) 模板显式声明优先（精配）
  if (Array.isArray(t.controls) && t.controls.length) {
    return t.controls.map(normalize);
  }

  const css = t.css || '';
  const html = t.html || '';
  const js = t.js || '';
  const cat = t.cat || '';
  const id = t.id || '';
  const list = [];

  // ── A) 进度条类：进度百分比 + 实时进度动画 ──
  const isProgress =
    /进度/.test(t.title || '') || (t.tags || []).includes('进度条') ||
    /\.fill\b/.test(css) || /conic-gradient/.test(css) || /width:\s*\d+%/.test(html);
  if (isProgress) {
    if (/conic-gradient/.test(css)) {
      // 圆形进度（conic-gradient 的百分比）
      const cur = (/conic-gradient\([^)]*?(\d+)%/i.exec(css) || [])[1] || 72;
      list.push(R({
        key: 'progress', label: '进度', min: 0, max: 100, step: 1, unit: '%',
        value: +cur, selector: '.circle', prop: 'background',
        format: v => `conic-gradient(var(--wc-c1) ${v}%, #e2e8f0 0)`,
        hint: '拖动“进度”滑块调节圆环填充百分比（conic-gradient 的角度）'
      }));
      list.push(R({
        key: 'ptext', label: '数字', min: 0, max: 100, step: 1, unit: '%',
        value: +cur, selector: '.inner', prop: 'content-text',
        format: v => `${v}%`,
        hint: '中心数字跟随进度显示'
      }));
    } else if (/\.fill\b/.test(css)) {
      const animated = /animation/.test(css) || /@keyframes/.test(css);
      const cur = readInlinePercent(html, 60);
      list.push(R({
        key: 'progress', label: '进度', min: 0, max: 100, step: 1, unit: '%',
        value: cur, selector: '.fill', prop: 'width',
        format: v => `${v}%`,
        hint: '拖动“进度”滑块实时调节进度条 .fill 的 width'
      }));
      if (animated) {
        list.push(R({
          key: 'realtime', label: '实时进度动画', type: 'toggle', value: true,
          selector: '.fill', prop: 'animation-play-state',
          on: 'running', off: 'paused',
          hint: '开关“实时进度动画”控制 .fill 的动画播放/暂停'
        }));
      }
      list.push(R({
        key: 'thick', label: '进度条粗细', min: 4, max: 26, step: 1, unit: 'px',
        value: readNum(css, '.bar', 'height', 10), selector: '.bar', prop: 'height',
        format: v => `${v}px`,
        hint: '调节进度条容器 .bar 的 height（粗细）'
      }));
    }
  }

  // ── B) 开关 / 滑块表单 ──
  if (/cp-switch/.test(id) || (/\.track\b/.test(css) && /\.knob\b/.test(css))) {
    list.push(R({
      key: 'on', label: '开关状态', type: 'toggle', value: false,
      selector: '.sw input', prop: 'checked',
      hint: '“开关状态”控制 checkbox 是否选中（:checked 触发轨道变色与滑块位移）'
    }));
    list.push(R({
      key: 'trackw', label: '轨道宽度', min: 36, max: 80, step: 2, unit: 'px',
      value: readNum(css, '.track', 'width', 48), selector: '.track', prop: 'width',
      format: v => `${v}px`, hint: '调节开关轨道 .track 的 width'
    }));
  }
  if (/cp-slider/.test(id) || /type="range"/.test(html)) {
    list.push(R({
      key: 'val', label: '滑块数值', min: 0, max: 100, step: 1, unit: '',
      value: +((/value="(\d+)"/.exec(html) || [])[1] || 40),
      selector: 'input[type=range]', prop: 'value',
      format: v => `${v}`, hint: '“滑块数值”直接改变 range 的 value'
    }));
  }

  // ── C) 3D / 透视类：倾斜角度 + 透视强度 ──
  if (/perspective|rotateX|rotateY|preserve-3d/.test(css) || /3d|3D/.test(t.title || '')) {
    list.push(R({
      key: 'tilt', label: '倾斜角度', min: 0, max: 40, step: 1, unit: '°',
      value: 16, selector: '.c,.card,.box,.scene>*', prop: 'transform',
      format: v => `rotateX(${v}deg) rotateY(${v}deg)`,
      hint: '“倾斜角度”控制 3D 元素的 rotateX/rotateY'
    }));
    const per = readNum(css, '.scene', 'perspective', 0) || readNum(css, '.card', 'perspective', 0);
    if (per) {
      list.push(R({
        key: 'persp', label: '透视强度', min: 300, max: 1600, step: 20, unit: 'px',
        value: per, selector: '.scene,.card', prop: 'perspective',
        format: v => `${v}px`, hint: '“透视强度”控制 perspective（越小越夸张）'
      }));
    }
  }

  // ── D) 阴影类：阴影强度（有 box-shadow 且非进度/3D 已处理） ──
  if (/box-shadow/.test(css) && !list.some(c => c.key === 'tilt')) {
    const target = /\.c\b/.test(css) ? '.c' : (/\.card\b/.test(css) ? '.card' : (/\.box\b/.test(css) ? '.box' : (/\.b\b/.test(css) ? '.b' : '')));
    if (target) {
      list.push(R({
        key: 'shadow', label: '阴影强度', min: 0, max: 40, step: 1, unit: 'px',
        value: 12, selector: target, prop: 'box-shadow',
        format: v => `0 ${Math.round(v * 0.7)}px ${v * 2}px rgba(0,0,0,${(0.06 + v * 0.006).toFixed(3)})`,
        hint: '“阴影强度”调节卡片 box-shadow 的模糊与透明度'
      }));
    }
  }

  // ── E) 文本类：字号 + 字间距（text-layout / 有 font-size 的标题） ──
  if (cat === 'text-layout' || /font-size/.test(css)) {
    const tgt = /\.t\b/.test(css) ? '.t' : (/h1|h2|h3/.test(html) ? html.match(/<(h[1-6])/i)?.[1] || '.t' : '.t');
    const fs = readNum(css, tgt, 'font-size', 20);
    list.push(R({
      key: 'fontsize', label: '字号', min: 12, max: 64, step: 1, unit: 'px',
      value: fs, selector: tgt, prop: 'font-size',
      format: v => `${v}px`, hint: `“字号”调节 ${tgt} 的 font-size`
    }));
    if (/letter-spacing/.test(css) || cat === 'text-layout') {
      list.push(R({
        key: 'ls', label: '字间距', min: 0, max: 12, step: 0.5, unit: 'px',
        value: readNum(css, tgt, 'letter-spacing', 0), selector: tgt, prop: 'letter-spacing',
        format: v => `${v}px`, hint: `“字间距”调节 ${tgt} 的 letter-spacing`
      }));
    }
    if (/line-height/.test(css)) {
      list.push(R({
        key: 'lh', label: '行距', min: 1, max: 3, step: 0.1, unit: '',
        value: readNum(css, tgt, 'line-height', 1.6), selector: tgt, prop: 'line-height',
        format: v => `${v}`, hint: `“行距”调节 ${tgt} 的 line-height`
      }));
    }
  }

  // ── F) 鼠标 hover 位移/放大类：位移距离 / 放大倍数 ──
  if (cat === 'mouse') {
    if (/translateX\(([-\d.]+)px\)/.test(css)) {
      const d = +(/translateX\(([-\d.]+)px\)/.exec(css)[1]);
      list.push(R({
        key: 'movedist', label: '悬停位移', min: 0, max: 60, step: 1, unit: 'px',
        value: Math.abs(d), selector: '.b:hover', prop: 'transform',
        format: v => `translateX(${v}px)`, hint: '“悬停位移”调节 hover 时的位移距离'
      }));
    }
    if (/scale\(([\d.]+)\)/.test(css) && /:hover/.test(css)) {
      list.push(R({
        key: 'hoverscale', label: '悬停放大', min: 1, max: 1.5, step: 0.02, unit: '×',
        value: +(/scale\(([\d.]+)\)/.exec(css)[1]), selector: '.b:hover', prop: 'transform',
        format: v => `scale(${v})`, hint: '“悬停放大”调节 hover 时的缩放倍数'
      }));
    }
  }

  // ── G) 动画类（有 @keyframes / animation）：动画时长 ──
  const hasAnim = /@keyframes/.test(css) || /animation/.test(css);
  if (hasAnim && !list.some(c => c.key === 'realtime')) {
    const dur = readAnimDuration(css, 1);
    // 找出承载 animation 的选择器
    const selM = /([.#][\w-]+)\s*\{[^}]*animation/i.exec(css);
    const sel = selM ? selM[1] : '.box';
    list.push(R({
      key: 'duration', label: '动画时长', min: 0.2, max: 5, step: 0.1, unit: 's',
      value: dur, selector: sel, prop: 'animation-duration',
      format: v => `${v}s`, hint: `“动画时长”调节 ${sel} 的 animation-duration（越大越慢）`
    }));
  }

  // ── H) 兜底：padding（视觉块内边距），保证每个模板至少有 1 个专属滑块 ──
  if (!list.length) {
    const tgt = /\.b\b/.test(css) ? '.b' : (/\.c\b/.test(css) ? '.c' : (/\.box\b/.test(css) ? '.box' : (/\.t\b/.test(css) ? '.t' : '')));
    if (tgt) {
      const pad = readNum(css, tgt, 'padding', 16);
      list.push(R({
        key: 'padding', label: '内边距', min: 4, max: 48, step: 1, unit: 'px',
        value: pad, selector: tgt, prop: 'padding',
        format: v => `${v}px`, hint: `“内边距”调节 ${tgt} 的 padding` }));
    }
  }

  return list.map(normalize);
}

// 归一化：补默认字段，避免渲染/应用时缺字段报错
function normalize(c) {
  const o = { type: 'range', unit: '', step: 1, ...c };
  if (o.type === 'range' && typeof o.format !== 'function') {
    o.format = v => `${v}${o.unit || ''}`;
  }
  if (o.type === 'toggle') {
    if (o.on == null) o.on = 'on';
    if (o.off == null) o.off = 'off';
  }
  return o;
}

// 由某个 control 的当前值生成「iframe 内应用的指令」。
// 返回 { key, selector, prop, value }，供 preview 运行时按 selector+prop 精确应用。
export function controlToPatch(c, rawValue) {
  const v = rawValue;
  if (c.type === 'toggle') {
    return { key: c.key, selector: c.selector, prop: c.prop, value: v ? c.on : c.off, toggle: true };
  }
  const cssVal = c.format ? c.format(v) : `${v}${c.unit || ''}`;
  return { key: c.key, selector: c.selector, prop: c.prop, value: cssVal };
}

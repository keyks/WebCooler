// 在沙箱内渲染模板（html + css + js），支持实时刷新
// 设计目标（深度优化）：
//  - 预览窗口与「实时参数控制」严格一一对应，绝不误伤其他元素
//  - 颜色调节基于「CSS 变量（设计 token）」驱动：仅替换模板中声明的
//    主色/辅色「字面量」为 var(--wc-cN)，所以只影响真正使用该颜色的对象
//  - 彻底移除早期「按全局类名暴力覆盖（如 [class*="b"]）」的写法，
//    该写法会在拖动某一滑块时连带改动其它无关元素。
//  - 预览 iframe 使用「纯沙箱（allow-scripts，无 allow-same-origin）」：
//    父页面与 iframe 跨源，浏览器扩展/插件（如 intersub 等）无法注入或
//    读取 iframe 内部 DOM，从根本上避免第三方插件污染预览。

// ────────────────────────────────────────────────────────────
// 设计 token 解析
// ────────────────────────────────────────────────────────────

// 判断颜色是否为「中性灰阶/黑白」（不参与主色推断）
function isNeutral(hex) {
  const h = hex.replace('#', '');
  let r, g, b;
  if (h.length === 3) { r = parseInt(h[0]+h[0],16); g = parseInt(h[1]+h[1],16); b = parseInt(h[2]+h[2],16); }
  else if (h.length === 4) { r = parseInt(h[0]+h[0],16); g = parseInt(h[1]+h[1],16); b = parseInt(h[2]+h[2],16); }
  else if (h.length >= 6) { r = parseInt(h.slice(0,2),16); g = parseInt(h.slice(2,4),16); b = parseInt(h.slice(4,6),16); }
  else return true;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  // 灰度：max 与 min 接近；或极亮/极暗（接近白/黑）
  const isGray = (max - min) <= 18;
  const isExtreme = max >= 248 && min >= 248;   // 近白
  const isDark = max <= 50 && min <= 50;         // 近黑/极暗（多为背景，不作为主色）
  return isGray || isExtreme || isDark;
}

// 从 CSS 中解析可调节的颜色 token。
// 策略：
//  1) 优先使用模板自带的 tokens（结构化、最精准）：{ c1, c2, bg }
//  2) 否则自动扫描 CSS，挑选出现顺序最先、且非中性色的前若干彩色作为主/辅色
// 返回 { c1, c2, bg, map }：
//   - c1/c2/bg：用于初始化滑块的默认值
//   - map：原始颜色值 → 变量名的映射（仅包含需要被变量替换的值）
function parseTokens(t) {
  const css = t.css || '';
  const explicit = t.tokens || null;

  // 1) 显式 token
  if (explicit && (explicit.c1 || explicit.c2)) {
    const map = {};
    const c1 = (explicit.c1 || '').toLowerCase();
    const c2 = (explicit.c2 || '').toLowerCase();
    const bg = (explicit.bg || '').toLowerCase();
    if (c1) map[c1] = '--wc-c1';
    if (c2 && c2 !== c1) map[c2] = '--wc-c2';
    return {
      c1: explicit.c1 || '#2f83ff',
      c2: explicit.c2 || '#8b5cf6',
      bg: explicit.bg || '',
      map
    };
  }

  // 2) 自动扫描：优先判定「语义主色」
  const re = /#[0-9a-fA-F]{3,8}\b/g;
  const order = [];      // 有序去重的候选彩色
  let m;
  while ((m = re.exec(css))) {
    const c = m[0].toLowerCase();
    if (order.includes(c)) continue;
    if (isNeutral(c)) continue; // 灰阶/黑白/极浅背景不计入主色
    order.push(c);
  }
  const c1 = order[0] || '#2f83ff';
  const c2 = order[1] && order[1] !== c1 ? order[1] : (order[1] || '#8b5cf6');
  const map = {};
  map[c1] = '--wc-c1';
  if (c2 && c2 !== c1) map[c2] = '--wc-c2';
  return { c1, c2, bg: '', map };
}

// 将 CSS 中的「字面量颜色」替换为对应 CSS 变量。
// 仅替换 map 中声明的精确值，因此只会改变真正使用该颜色的对象。
function injectVarTokens(css, map) {
  if (!css || !map || !Object.keys(map).length) return css;
  let out = css;
  for (const [raw, varName] of Object.entries(map)) {
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), `var(${varName})`);
  }
  return out;
}

// 自动演示驱动：根据模板种类模拟真实交互（仅当用户主动勾选「自动播放」时启用）。
// 演示脚本只触发「模板自身声明的交互事件」，不会修改任何设计 token，
// 因此不会与「实时参数控制」冲突，也不会造成"来回跳转/误改内容"。
function demoScript(cat, id) {
  return `
  (function(){
    var _stop = false;
    window.__wcDemoStop__ = false;
    window.__wcDemoPause__ = function(){ _stop = true; };
    window.__wcDemoResume__ = function(){ if(_stop){_stop=false; loop();} };

    const sleep = ms => new Promise(function(r){ setTimeout(r, ms); });
    function sp(ms){ var k = window.__wcSpeed__ || 1; return Math.max(16, ms / k); }

    async function loop(){
      while(!_stop && !window.__wcDemoStop__){
        try { await play(); } catch(e) {}
        if (_stop || window.__wcDemoStop__) break;
        await sleep(sp(1400));
      }
    }
    async function play(){
      if (_stop || window.__wcDemoStop__) return;
      var cat = ${JSON.stringify(cat)};
      var id = ${JSON.stringify(id)};
      var fields = [].slice.call(document.querySelectorAll('input,textarea,select'));
      var area = document.querySelector('.area,.track,.glow,.smoke,.fire,.b');
      if(fields.length){
        var f = fields[0]; if(f.blur) f.blur(); f.readOnly=true;
        var samples=['Hello','WebCooler','你好','123','ABC','Code'];
        for(var i=0;i<samples.length;i++){
          if (_stop) return;
          f.value=samples[i]; f.dispatchEvent(new Event('input',{bubbles:true}));
          await sleep(sp(280));
        }
        f.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
        if(f.blur) f.blur();
        return;
      }
      if((cat==='mouse' && (id||'').indexOf('follow')>=0) || area){
        var el = area || document.body;
        var r = el.getBoundingClientRect();
        for(var j=0;j<10;j++){
          if (_stop) return;
          var x=r.left+r.width*(0.2+0.6*Math.random());
          var y=r.top+r.height*(0.2+0.6*Math.random());
          el.dispatchEvent(new MouseEvent('mousemove',{clientX:x,clientY:y,bubbles:true}));
          await sleep(sp(50));
        }
        return;
      }
      var clickables = [].slice.call(document.querySelectorAll('button,.b,.box,.card,.ring,.star,.rp,.glow,.item,.nav,.tip,.cell,.wrap,li,a,div')).filter(function(e){return e.offsetWidth>0;});
      if(clickables.length){
        var el2 = clickables[Math.floor(Math.random()*clickables.length)];
        el2.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        return;
      }
      document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    }
    requestAnimationFrame(function(){ loop(); });
  })();
  `;
}

// iframe 内部接收参数并应用：只改 :root 变量 + #wc-root 作用域 + 可选 body 背景，
// 绝不触碰任何具体类名/全局选择器，所以改动任一滑块都不会影响其它内容。
const IFRAME_RUNTIME = `
<script>
(function(){
  var _roundEls = null;
  // 圆角滑块只作用于「视觉容器/卡片」类元素，绝不波及表单控件等交互元素。
  var NO_ROUND = 'INPUT,BUTTON,SELECT,TEXTAREA,IMG,CODE,PRE,LABEL,OPTION,SVG,CANVAS,VIDEO,AUDIO';
  function collectRoundEls(){
    var out = [];
    var all = document.querySelectorAll('#wc-root, #wc-root *');
    all.forEach(function(el){
      if(el.matches && el.matches(NO_ROUND)) return; // 排除表单/媒体等交互元素
      try{
        var cs = getComputedStyle(el);
        var r = cs.borderRadius || '';
        // 有任意非 0 圆角即纳入（排除 '0px'、''、'0px 0px ...'）
        if(!(r && /[1-9]/.test(r))) return;

        // ── 排除「语义性圆形/胶囊」──
        // 关键：getComputedStyle 会把 border-radius:50% 折算成「像素值」（如 90px 圆
        // 会返回 45px），因此不能只看数值 >=50。改用「几何判断」：只要任一角的圆
        // 半径 >= 元素较短边的一半，即视为圆形/胶囊，其圆角是核心造型，保持原样。
        var w = el.offsetWidth || el.clientWidth || 0;
        var h = el.offsetHeight || el.clientHeight || 0;
        var half = Math.min(w, h) / 2;
        var maxR = 0;
        (cs.borderTopLeftRadius + ' ' + cs.borderTopRightRadius + ' ' +
         cs.borderBottomLeftRadius + ' ' + cs.borderBottomRightRadius)
          .split(/\s+/).forEach(function(v){
            var n = parseFloat(v);
            if(!isNaN(n) && n > maxR) maxR = n;
          });
        // 半圆及以上（含轻微取整误差）→ 语义圆形，跳过
        if(half > 0 && maxR >= half - 0.5) return;

        // ── 排除「背景为渐变/图像绘制造型」的元素 ──
        // 如 conic-gradient 画的进度环，改圆角会破坏其视觉，保持原样。
        var bg = cs.backgroundImage || '';
        // 注意：勿写成 /gradient|url\(/i —— esbuild 压缩会把 \( 当多余转义删掉，
        // 导致该正则变成未闭合分组、脚本解析期直接 SyntaxError，预览运行时整体崩溃。
        // 改用 indexOf 判断 url(，彻底规避正则转义被压缩器破坏的风险。
        if(/gradient/i.test(bg) || bg.indexOf('url(') >= 0) return;

        out.push(el);
      }catch(e){}
    });
    return out;
  }
  // ── 动画速度：把「动画速度」真正作用于模板自身的 CSS 动画 ──
  // 之前 speed 只影响演示驱动脚本的 sleep，对 @keyframes 无效；现在按 1/speed
  // 缩放 #wc-root 内所有元素的 animation-duration（首次扫描时缓存原始值，避免反复累积）。
  var _speed = 1;
  var _animEls = null;
  function collectAnimEls(){
    var out = [];
    document.querySelectorAll('#wc-root *').forEach(function(el){
      var cs = getComputedStyle(el);
      if (cs.animationName && cs.animationName !== 'none') {
        if (el.__origDur == null) el.__origDur = cs.animationDuration;
        if (el.__origName == null) el.__origName = cs.animationName;
        out.push(el);
      }
    });
    return out;
  }
  function applySpeed(s, restart){
    _speed = (s == null ? 1 : s);
    if (_animEls === null) _animEls = collectAnimEls();
    _animEls.forEach(function(el){
      var d = el.__origDur || '1s';
      var n = parseFloat(d); if (isNaN(n)) n = 1;
      el.style.animationDuration = (n / _speed) + 's';
      // 重新触发：让「一次性 @keyframes 入场动画」(iteration-count:1) 在调速度后也能
      // 重放；对无限循环动画则是即时生效且从当前态无缝衔接。先置 animationName='none'
      // 强制 reflow，再恢复原始动画名（此时 duration 已是新值）。
      if (restart) {
        el.style.animationName = 'none';
        void el.offsetWidth; // 强制重排，使上面的 'none' 生效
        el.style.animationName = el.__origName || 'none';
      }
    });
  }

  function apply(p){
    p = p || {};
    var root = document.documentElement;
    if(p.size!=null || p.x!=null || p.y!=null){
      var s = p.size!=null?p.size:1, x=p.x!=null?p.x:0, y=p.y!=null?p.y:0;
      var rootEl = document.getElementById('wc-root');
      if(rootEl){
        rootEl.style.transformOrigin = 'center center';
        rootEl.style.transform = 'scale('+s+') translate('+x+'px,'+y+'px)';
        // 放大(size>1)时为溢出内容预留滚动空间，避免被 iframe 视口裁切
        rootEl.style.margin = s>1 ? ((s-1)*50)+'%' : '';
      }
    }
    if(p.bg){ document.body.style.background = p.bg; }
    // radius 只有在用户主动调整（非 null/undefined）时才应用，
    // 且仅作用于「原本已有圆角」的元素，避免给 input/文字块强加圆角。
    if(p.radius==='reset'){
      // 清除之前叠加的行内圆角，恢复模板原始圆角
      if(_roundEls){ _roundEls.forEach(function(el){ el.style.borderRadius=''; }); }
    } else if(p.radius!=null){
      if(_roundEls===null) _roundEls = collectRoundEls();
      _roundEls.forEach(function(el){ el.style.borderRadius = p.radius+'px'; });
    }
    if(p.c1){ root.style.setProperty('--wc-c1', p.c1); }
    if(p.c2){ root.style.setProperty('--wc-c2', p.c2); }
    if(p.speed!=null){ applySpeed(p.speed); }
  }
  // ── 自定义「专属控制项」应用：按 selector + prop 精确设置，绝不误伤 ──
  // patch = { key, selector, prop, value, toggle }
  var _ctrlStyle = null;
  function ensureCtrlStyle(){
    if(!_ctrlStyle){
      _ctrlStyle = document.createElement('style');
      _ctrlStyle.id = 'wc-ctrl-style';
      document.head.appendChild(_ctrlStyle);
    }
    return _ctrlStyle;
  }
  var _ctrlRules = {};   // key -> css 文本
  function applyControl(p){
    if(!p || !p.selector || !p.prop) return;
    try{
      // 特殊属性：直接操作 DOM 而非样式
      if(p.prop === 'checked'){
        document.querySelectorAll(p.selector).forEach(function(el){
          el.checked = (p.value === 'on' || p.value === true);
          el.dispatchEvent(new Event('change',{bubbles:true}));
        });
        return;
      }
      if(p.prop === 'value'){
        document.querySelectorAll(p.selector).forEach(function(el){
          el.value = p.value;
          el.dispatchEvent(new Event('input',{bubbles:true}));
        });
        return;
      }
      if(p.prop === 'content-text'){
        document.querySelectorAll(p.selector).forEach(function(el){ el.textContent = p.value; });
        return;
      }
      // 常规 CSS 属性：写入一条作用于 #wc-root 内该选择器的规则（!important 保证覆盖）
      _ctrlRules[p.key] = '#wc-root ' + p.selector + '{' + p.prop + ':' + p.value + ' !important}';
      var out = '';
      for(var k in _ctrlRules){ out += _ctrlRules[k] + '\\n'; }
      ensureCtrlStyle().textContent = out;
    }catch(e){}
  }

  window.addEventListener('message', function(e){
    var d = e.data || {};
    if(d && d.type === 'wc-params'){ apply(d.params); }
    else if(d && d.type === 'wc-speed'){ window.__wcSpeed__ = d.speed; applySpeed(d.speed); }
    else if(d && d.type === 'wc-speed-restart'){ window.__wcSpeed__ = d.speed; applySpeed(d.speed, true); }
    else if(d && d.type === 'wc-control'){ applyControl(d.patch); }
  });
  // 暴露给 sandbox 内脚本直接调用（兼容旧调用路径）
  window.__wcApplyParams__ = apply;
  window.__wcApplyControl__ = applyControl;
  // 通知父页面：运行时已就绪，可接收参数 / 控制项（解决重渲染后参数偶发丢失的竞态）
  try { parent.postMessage({ type: 'wc-ready' }, '*'); } catch(e){}
})();
<\/script>`;

// 渲染预览沙箱。返回 iframe。
export function renderPreview(container, t, { autoDemo = false, speed = 1 } = {}) {
  const iframe = document.createElement('iframe');
  iframe.className = 'w-full h-full border-0';
  // 初始透明，待运行时就绪(wc-ready)后由父页面淡入，消除重渲染闪烁
  iframe.style.opacity = '0';
  iframe.style.transition = 'opacity .18s ease';
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('title', (t && t.title) || '模板实时预览');
  // 关键：仅 allow-scripts，不授权 allow-same-origin。
  // 这样 iframe 为不透明源，浏览器插件无法读取/注入其内部 DOM，预览不被污染。
  iframe.setAttribute('sandbox', 'allow-scripts');
  // 仅移除旧的 iframe（保留加载骨架占位 .wc-skeleton），避免就绪前的空白闪烁
  container.querySelectorAll('iframe').forEach(f => f.remove());
  container.appendChild(iframe);

  const tokens = parseTokens(t);
  const cssWithVars = injectVarTokens(t.css || '', tokens.map);

  const rootVars = `:root{--wc-c1:${tokens.c1};--wc-c2:${tokens.c2};--wc-size:1;--wc-x:0px;--wc-y:0px;--wc-radius:12px;--wc-bg:#ffffff;}`;
  const base = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;background:#fff}
body{display:flex;align-items:center;justify-content:center;min-height:100%;padding:16px;overflow:auto}
#wc-root{display:flex;align-items:center;justify-content:center;max-width:100%}
${rootVars}</style>`;

  const demo = autoDemo ? `<script>${demoScript(t.cat || '', t.id || '')}<\/script>` : '';
  const full = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style id="wc-base">${cssWithVars}</style></head><body>
<div id="wc-root">${t.html || ''}</div>
<script>window.__wcSpeed__=${speed};<\/script>
<script>${t.js || ''}<\/script>
${demo}
${IFRAME_RUNTIME}
</body></html>`;
  // 关键修复：沙箱 iframe（allow-scripts 无 allow-same-origin）的 contentDocument 为
  // null，doc.open()/write() 会抛「Cannot read properties of null (reading 'open')」。
  // 改用 srcdoc 赋值：跨源沙箱下仍可正常加载、内部脚本可执行、postMessage 通信照常。
  iframe.srcdoc = base + full;
  return iframe;
}

// 实时调整演示速度（speed 越大越快；可小数变慢）
export function setDemoSpeed(iframe, speed) {
  try {
    if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'wc-speed', speed }, '*');
  } catch (_) {}
}

// 重新触发预览内的 @keyframes 动画（让「一次性入场动画」在改速度后也能重放）
export function restartAnim(iframe, speed) {
  try {
    if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'wc-speed-restart', speed }, '*');
  } catch (_) {}
}

// 将控制参数应用到 iframe（通过 postMessage，跨源安全通信）。
// 改动某一滑块时只影响目标对象，绝不误伤其它内容。
export function applyParams(iframe, params) {
  if (!iframe || !iframe.contentWindow) return;
  try {
    iframe.contentWindow.postMessage({ type: 'wc-params', params: params }, '*');
  } catch (_) {}
}

// 将「专属控制项」指令下发到 iframe（按 selector+prop 精确应用，隔离安全）。
export function applyControl(iframe, patch) {
  if (!iframe || !iframe.contentWindow) return;
  try {
    iframe.contentWindow.postMessage({ type: 'wc-control', patch }, '*');
  } catch (_) {}
}

// 复制到剪贴板
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

// 从 CSS 中提取「声明了圆形/胶囊圆角」的选择器（border-radius:50% 或 >=999px）。
// 用于导出代码时保护这些语义造型不被通用圆角覆盖。
function extractRoundSelectors(css) {
  const out = [];
  if (!css) return out;
  // 匹配每个规则块：selector { ... }
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selector = m[1].trim();
    const body = m[2];
    const brMatch = /border-radius\s*:\s*([^;]+)/i.exec(body);
    if (!brMatch) continue;
    const val = brMatch[1].trim();
    // 圆形（50%+）或大胶囊圆角（>=999px）视为语义造型
    if (/(^|[^0-9])(5[0-9]|[6-9][0-9]|100)%/.test(val) || /(999|[1-9]\d{3,})px/.test(val)) {
      out.push(selector);
    }
  }
  return out;
}

// 把控制参数合并进模板源码，生成"所见即所得"的可复制代码。
// 返回 { html, css, js } 三个字符串。
// 颜色按「token 变量」写入，与预览效果 100% 一致且只影响目标对象。
// params 额外支持：
//   controls    : 该模板的专属控制项定义数组（来自 inferControls）
//   ctrlValues  : { key: value } 各专属控制项当前值
export function buildCode(t, params = {}) {
  const { size = 1, x = 0, y = 0, radius = null, c1, c2, bg, speed = 1, controls = [], ctrlValues = {} } = params;
  const tokens = parseTokens(t);

  // HTML：在 #wc-root 上叠加实时变换样式
  let html = t.html || '';
  const rootStyle = `transform:scale(${size}) translate(${x}px,${y}px);transform-origin:center center;`;
  if (/id=["']wc-root["']/.test(html)) {
    html = html.replace(/(<[^>]*id=["']wc-root["'][^>]*?)>/i, `$1 style="${rootStyle}">`);
  } else {
    html = `<div id="wc-root" style="${rootStyle}">${html}</div>`;
  }

  // CSS：先把主色/辅色字面量替换为变量，再在 :root 注入默认值与用户调节值
  let css = injectVarTokens(t.css || '', tokens.map);
  let override = '\n/* WebCooler 实时参数（设计 token） */\n';
  override += `:root{\n  --wc-c1: ${c1 || tokens.c1};\n  --wc-c2: ${c2 || tokens.c2};\n}`;
  if (bg) override += `\nbody{background:${bg} !important}`;
  if (radius != null) {
    override += `\n#wc-root div,#wc-root section,#wc-root article,#wc-root aside,#wc-root nav,#wc-root main,#wc-root header,#wc-root footer,#wc-root ul,#wc-root li,#wc-root span,#wc-root a{border-radius:${radius}px !important}`;
    // 保护「语义性圆形/胶囊」：原 CSS 中声明了 border-radius:50%（或 9999px 等大圆角）
    // 的选择器，其圆角是核心造型，不应被上面的通用圆角覆盖。为它们补一条恢复规则。
    const roundSelectors = extractRoundSelectors(t.css || '');
    if (roundSelectors.length) {
      const sel = roundSelectors.map(s => `#wc-root ${s}`).join(',');
      override += `\n/* 保持圆形/胶囊造型不被圆角滑块破坏 */\n${sel}{border-radius:50% !important}`;
    }
  }
  if (speed !== 1) override += `\n/* 动画速度：${speed.toFixed(1)}×（数值越小越慢） */`;

  // ── 专属控制项：自动结构注释 + 精确覆盖规则 ──
  // 对每个被调节的控制项，在导出 CSS 里写入：
  //   /* 【标签】说明——想快速改动，改这里的数值即可 */
  //   #wc-root <selector>{ <prop>: <值> !important }
  // 让用户一眼看懂"改哪个元素的哪个属性"，直接手改即可。
  if (Array.isArray(controls) && controls.length) {
    let block = '';
    controls.forEach(c => {
      const has = Object.prototype.hasOwnProperty.call(ctrlValues, c.key);
      const val = has ? ctrlValues[c.key] : c.value;
      if (c.type === 'toggle') {
        const on = !!val;
        block += `\n/* 【${c.label}】${c.hint || ''}（当前：${on ? '开' : '关'}） */`;
        if (c.prop === 'animation-play-state') {
          block += `\n#wc-root ${c.selector}{animation-play-state:${on ? c.on : c.off} !important}`;
        } else if (c.prop === 'checked') {
          block += `\n/* → 在 HTML 中给 ${c.selector} 添加/移除 checked 属性即可切换 */`;
        }
        return;
      }
      const cssVal = c.format ? c.format(val) : `${val}${c.unit || ''}`;
      block += `\n/* 【${c.label}】${c.hint || ''}（当前 ${val}${c.unit || ''}，改此数值即可） */`;
      if (c.prop === 'content-text') {
        block += `\n/* → 直接修改 ${c.selector} 的文本内容为 "${cssVal}" */`;
      } else if (c.prop === 'value') {
        block += `\n/* → 直接修改 ${c.selector} 的 value 属性为 ${cssVal} */`;
      } else {
        block += `\n#wc-root ${c.selector}{${c.prop}:${cssVal} !important}`;
      }
    });
    if (block) {
      override += `\n\n/* ══════ 专属参数（可直接改下面的数值快速调节）══════ */${block}`;
    }
  }

  css += override;

  // JS：注入速度系数，保证复制后行为一致
  let js = t.js || '';
  if (speed !== 1) {
    js = `// 动画速度系数（越小越慢，越大越快）\nwindow.__wcSpeed__ = ${speed};\n` + js;
  }
  return { html, css, js };
}

// 解析模板 css，提取可调节参数（颜色 + 主要尺寸）。
// 供详情页初始化滑块默认值使用。
export function extractParams(css = '') {
  const tokens = parseTokens({ css: css || '' });
  const colors = Object.keys(tokens.map).map(k => tokens.map[k] === '--wc-c1' ? tokens.c1 : tokens.c2);
  const re = /#[0-9a-fA-F]{3,8}\b/g;
  const all = [];
  let m;
  while ((m = re.exec(css))) {
    const c = m[0].toLowerCase();
    if (!all.includes(c)) all.push(c);
  }
  return {
    colors: all.slice(0, 4),
    c1: tokens.c1,
    c2: tokens.c2,
    maxSize: 200
  };
}

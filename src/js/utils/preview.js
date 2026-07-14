// 在沙箱内渲染模板（html + css + js），支持实时刷新
// 设计目标（深度优化）：
//  - 预览窗口与「实时参数控制」严格一一对应，绝不误伤其他元素
//  - 颜色调节基于「CSS 变量（设计 token）」驱动：仅替换模板中声明的
//    主色/辅色「字面量」为 var(--wc-cN)，所以只影响真正使用该颜色的对象
//  - 彻底移除早期「按全局类名暴力覆盖（如 [class*="b"]）」的写法，
//    该写法会在拖动某一滑块时连带改动其它无关元素。

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
//  2) 否则自动扫描 CSS，挑选出现频率最高、且非中性色的前若干颜色作为主/辅色
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
    // bg 仅作默认值，不参与变量替换（背景由 :root/body 直接控制）
    return {
      c1: explicit.c1 || '#2f83ff',
      c2: explicit.c2 || '#8b5cf6',
      bg: explicit.bg || '',
      map
    };
  }

  // 2) 自动扫描：优先判定「语义主色」
  // 规则：排除中性灰阶/黑白色；在剩余彩色中按「首次出现顺序」取主(c1)/辅(c2)。
  // 这样能正确命中"第一个出现的彩色 = 主元素颜色"，而不会被灰度背景或文字色干扰。
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
    // 精确匹配该颜色（含 3/6 位及带透明度形式），避免误替换子串
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), `var(${varName})`);
  }
  return out;
}

// 自动演示驱动：根据模板种类模拟真实交互（仅当用户主动勾选「自动播放」时启用）。
// 注意：演示脚本只触发「模板自身声明的交互事件」，不会修改任何设计 token，
// 因此不会与「实时参数控制」冲突，也不会造成"来回跳转/误改内容"。
function demoScript(cat, id) {
  return `
  (function(){
    var _stop = false, _rafId = null;
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

// 渲染预览沙箱。返回 iframe。
export function renderPreview(container, t, { autoDemo = false, speed = 1 } = {}) {
  const iframe = document.createElement('iframe');
  iframe.className = 'w-full h-full border-0';
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  container.innerHTML = '';
  container.appendChild(iframe);

  const doc = iframe.contentDocument;
  const tokens = parseTokens(t);
  // 在 CSS 中把「主色/辅色字面量」替换为变量，保证颜色滑块只影响目标对象
  const cssWithVars = injectVarTokens(t.css || '', tokens.map);

  // 将 token 默认值注入 :root，使 var() 有初始值
  const rootVars = `:root{--wc-c1:${tokens.c1};--wc-c2:${tokens.c2};--wc-size:1;--wc-x:0px;--wc-y:0px;--wc-radius:12px;--wc-bg:#ffffff;}`;
  const base = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%}
${rootVars}</style>`;

  const full = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style id="wc-base">${cssWithVars}</style></head><body>
<div id="wc-root">${t.html || ''}</div>
<script>window.__wcSpeed__=${speed};<\/script>
<script>${t.js || ''}<\/script>
</body></html>`;
  doc.open();
  doc.write(base + full);
  doc.close();

  if (autoDemo) {
    const s = doc.createElement('script');
    s.textContent = demoScript(t.cat || '', t.id || '');
    doc.body.appendChild(s);
  }
  return iframe;
}

// 实时调整演示速度（speed 越大越快；可小数变慢）
export function setDemoSpeed(iframe, speed) {
  try {
    if (iframe && iframe.contentWindow) iframe.contentWindow.__wcSpeed__ = speed;
  } catch (_) {}
}

// 将控制参数应用到 iframe。
// 关键优化：只通过「CSS 变量 + #wc-root 作用域 transform」生效，
// 绝不触碰任何具体类名，因此改动某一滑块时不会影响其它内容。
export function applyParams(iframe, params) {
  if (!iframe || !iframe.contentDocument) return;
  const doc = iframe.contentDocument;
  let style = doc.getElementById('wc-override');
  if (!style) {
    style = doc.createElement('style');
    style.id = 'wc-override';
    doc.head.appendChild(style);
  }
  const { size = 1, x = 0, y = 0, c1, c2, bg, radius } = params;
  let rules = '';
  // 1) 布局变换：仅作用于 #wc-root 作用域
  rules += `#wc-root{transform:scale(${size}) translate(${x}px,${y}px);transform-origin:center center;transition:transform .2s}`;
  // 2) 背景：仅作用于 body（预览画布），不影响模板内部元素
  if (bg) rules += `body{background:${bg} !important}`;
  // 3) 圆角：作用于所有带 class 的元素（圆角是全局视觉统一项，符合预期）
  if (radius != null) rules += `*[class]{border-radius:${radius}px !important}`;
  // 4) 颜色：仅更新 :root 变量，模板中 var(--wc-cN) 处才随之变化
  if (c1) rules += `:root{--wc-c1:${c1}}`;
  if (c2) rules += `:root{--wc-c2:${c2}}`;
  style.textContent = rules;
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

// 把控制参数合并进模板源码，生成"所见即所得"的可复制代码。
// 返回 { html, css, js } 三个字符串。
// 优化点：颜色按「token 变量」写入，与预览效果 100% 一致且只影响目标对象。
export function buildCode(t, params = {}) {
  const { size = 1, x = 0, y = 0, radius = 12, c1, c2, bg, speed = 1 } = params;
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
  if (radius != null) override += `\n*[class]{border-radius:${radius}px !important}`;
  if (speed !== 1) override += `\n/* 动画速度：${speed.toFixed(1)}×（数值越小越慢） */`;
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

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
// 主题检测（详情页预览 body 背景自适应）
// ────────────────────────────────────────────────────────────

// 扫描模板 CSS 中按出现顺序的第一个"非透明/非白色"背景色，判定亮/暗主题。
// 暗色模板的预览不再被强制白色 body 包围，视觉效果大幅提升。
const _themeCache = new WeakMap();
export function detectTheme(t) {
  const hit = _themeCache.get(t);
  if (hit !== undefined) return hit;
  const _r = _detectThemeImpl(t);
  _themeCache.set(t, _r);
  return _r;
}
function _detectThemeImpl(t) {
  const css = t.css || '';
  const re = /background(?:-color)?\s*:\s*((?:#[0-9a-fA-F]{3,8})|(?:rgba?\s*\([^)]+\)))\b/gi;
  let m;
  // 第一遍扫描：收集所有非中性背景色
  const bgColors = [];
  while ((m = re.exec(css))) {
    const raw = m[1].toLowerCase();
    if (raw.startsWith('rgba') && raw.includes(',0)')) continue;
    if (raw === '#fff' || raw === '#ffffff' || raw === '#fff0' ||
        raw === '#f8fafc' || raw === '#f1f5f9' || raw === '#eef6ff' || raw === '#f3f4f6') continue;
    const h = raw.replace('#', '');
    if (h.length >= 6) {
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      bgColors.push({ raw, lum });
    } else if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16), g = parseInt(h[1] + h[1], 16), b = parseInt(h[2] + h[2], 16);
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      bgColors.push({ raw, lum });
    }
  }

  // 有显式暗色背景 → dark
  if (bgColors.some(c => c.lum < 55)) return 'dark';
  // 有显式亮色背景 → light（即使后面有白字也不覆盖）
  if (bgColors.some(c => c.lum >= 200)) return 'light';

  // ── 回退信号：无显式背景色、但文字使用纯白 ──
  // 仅当白色文字出现在「结构性选择器」(body/html/*/#wc-root/:root/高层容器)
  // 时判定为暗色主题；排除散落在小元素上的零星白字（如按钮上的白字）。
  // 同时要求 CSS 中没有#fff/#ffffff作为背景色（纯白底+白字=看不见）。
  const cssLower = css.toLowerCase();
  const hasWhiteBg = /background(?:-color)?\s*:\s*(#fff\b|#ffffff\b|white\b)/i.test(cssLower);

  if (!hasWhiteBg) {
    const structSelectors = /(?:^|\})\s*(body|html|\*|:root|#wc-root|\.container|\.wrapper|\.page|\.main)\s*\{/gi;
    const textRe = /(?:^|[^-])color\s*:\s*(#fff\b|#ffffff\b|white\b|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/gi;
    const textMatches = [...cssLower.matchAll(textRe)];

    // 「裸露白字」：所在规则自身没有声明任何不透明背景 → 需暗底才可见
    //（故障风 / 霓虹文字等用 color:#fff 但不写背景）。与「蓝底白字按钮」区分：
    // 后者 white 字规则同时声明了 background，不算裸露，不会误判为暗色主题。
    let bareWhite = 0;
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    let rm;
    while ((rm = ruleRe.exec(cssLower)) !== null) {
      const body = rm[2];
      if (/(^|[^-])color\s*:\s*(#fff\b|#ffffff\b|white\b|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/.test(body)) {
        const hasOwnBg = /background(?:-color)?\s*:\s*((?!transparent|none)[^;]+)/i.test(body) ||
                         /background(?:-image)?\s*:[^;]*(gradient|url\()/i.test(body);
        if (!hasOwnBg) bareWhite++;
      }
    }

    if (textMatches.length >= 3) return 'dark'; // 大量白字 → 大概率暗色主题

    if (bareWhite >= 1) return 'dark'; // 裸露白字 → 暗色主题（白字在白底不可见）

    if (textMatches.length > 0) {
      // 检查是否在结构级选择器上下文中
      const structMatch = structSelectors.test(cssLower);
      if (structMatch) return 'dark';

      // 暗色预设关键词：标题中有霓虹/暗色/深色/暗黑等
      const title = (t.title || '').toLowerCase();
      if (/霓虹|暗色|深色|暗黑|夜间|glitch|neon|dark|night/.test(title)) return 'dark';
    }
  }

  return 'light';
}

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
// 同一模板对象的 token 解析结果不变，按引用缓存：拖动滑块时 buildCode / renderPreview
// 会对同一 t 反复调用 parseTokens，缓存后避免每次都正则全量扫描 CSS。
const _tokensCache = new WeakMap();
function parseTokens(t) {
  const cacheable = t && typeof t === 'object';
  if (cacheable && _tokensCache.has(t)) return _tokensCache.get(t);

  const css = t.css || '';
  const explicit = t.tokens || null;
  let result;

  // 1) 显式 token
  if (explicit && (explicit.c1 || explicit.c2)) {
    const map = {};
    const c1 = (explicit.c1 || '').toLowerCase();
    const c2 = (explicit.c2 || '').toLowerCase();
    if (c1) map[c1] = '--wc-c1';
    if (c2 && c2 !== c1) map[c2] = '--wc-c2';
    result = {
      c1: explicit.c1 || '#2f83ff',
      c2: explicit.c2 || '#8b5cf6',
      bg: explicit.bg || '',
      map
    };
  } else {
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
    result = { c1, c2, bg: '', map };
  }

  if (cacheable) _tokensCache.set(t, result);
  return result;
}

// 将 CSS 中的「字面量颜色」替换为对应 CSS 变量。
// 仅替换 map 中声明的精确值，因此只会改变真正使用该颜色的对象。
function injectVarTokens(css, map) {
  if (!css || !map || !Object.keys(map).length) return css;
  let out = css;
  // 按「原始值长度」降序替换：先替换较长的颜色（如 8 位 #rrggbbaa），再替换较短的
  // （如 6 位 #rrggbb），从根本上避免短值先跑时匹配到长值前缀的顺序依赖问题。
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  for (const [raw, varName] of entries) {
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 关键（真实 bug 修复）：当原始值是十六进制颜色时，末尾追加「非 hex 字符」负向前瞻，
    // 防止 #2f83ff 误匹配 #2f83ff00（8 位含 alpha）的前 7 个字符——否则 #2f83ff00 会被
    // 破坏成 var(--wc-c1)00 这种无效 token，导致该色标（常为透明渐变端）整体失效。
    // 例：ms-follow-dot 的 radial-gradient(circle,#2f83ff,#2f83ff00) 光点渐变。
    const boundary = /^#[0-9a-fA-F]+$/.test(raw) ? '(?![0-9a-fA-F])' : '';
    out = out.replace(new RegExp(escaped + boundary, 'gi'), `var(${varName})`);
  }
  return out;
}

// 把「同一模板的 token 化 CSS」按引用缓存：injectVarTokens 是确定性正则替换
//（仅依赖 t.css 与 parseTokens(t).map），与运行时状态无关；详情页拖拽滑块时
// buildCode 每帧调用，缓存后避免对大段 CSS 反复做多趟正则替换。
const _varCssCache = new WeakMap();
function getTokenizedCss(t) {
  const hit = _varCssCache.get(t);
  if (hit !== undefined) return hit;
  const tokens = parseTokens(t);
  const out = injectVarTokens(t.css || '', tokens.map);
  _varCssCache.set(t, out);
  return out;
}

// 自动演示驱动：根据模板种类模拟真实交互（仅当用户主动勾选「自动播放」时启用）。
// 演示脚本只触发「模板自身声明的交互事件」，不会修改任何设计 token，
// 因此不会与「实时参数控制」冲突，也不会造成"来回跳转/误改内容"。
function demoScript() {
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
      var fields = [].slice.call(document.querySelectorAll('input,textarea,select'));
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
      // 滚动驱动类：优先命中显式滚动容器，兜底自动探测可滚动元素，
      // 模拟 scrollTop 滚动并派发 scroll 事件，驱动所有 scroll 类特效真实演示。
      var sc=(function(){
        var cands=[].slice.call(document.querySelectorAll('.track,.content,.snap,.wrap'));
        for(var k=0;k<cands.length;k++){ if(cands[k].scrollHeight>cands[k].clientHeight+2) return cands[k]; }
        var all=[].slice.call(document.querySelectorAll('#wc-root *'));
        for(var m=0;m<all.length;m++){ var el=all[m]; var cs=getComputedStyle(el);
          if(((cs.overflowY==='auto'||cs.overflowY==='scroll'||cs.overflow==='auto'||cs.overflow==='scroll')&&el.scrollHeight>el.clientHeight+5)||
             ((cs.overflowX==='auto'||cs.overflowX==='scroll')&&el.scrollWidth>el.clientWidth+5)) return el; }
        return null;
      })();
      if(sc){
        var maxY=sc.scrollHeight-sc.clientHeight, maxX=sc.scrollWidth-sc.clientWidth;
        for(var s=0;s<=10;s++){ if(_stop||window.__wcDemoStop__)return;
          sc.scrollTop=maxY*(s/10); sc.scrollLeft=maxX*(s/10); sc.dispatchEvent(new Event('scroll',{bubbles:true})); await sleep(sp(45)); }
        for(var s2=10;s2>=0;s2--){ if(_stop)return;
          sc.scrollTop=maxY*(s2/10); sc.scrollLeft=maxX*(s2/10); sc.dispatchEvent(new Event('scroll',{bubbles:true})); await sleep(sp(35)); }
        return;
      }
      var area = document.querySelector('.area,.glow,.smoke,.fire,.b');
      if(area){
        var r = area.getBoundingClientRect();
        for(var j=0;j<10;j++){
          if (_stop) return;
          var x=r.left+r.width*(0.2+0.6*Math.random());
          var y=r.top+r.height*(0.2+0.6*Math.random());
          area.dispatchEvent(new MouseEvent('mousemove',{clientX:x,clientY:y,bubbles:true}));
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
    // 背景：空串 / 'reset' / null 等同「恢复主题默认」——清除行内覆盖，
    // 回退到 base 里 html,body{background:...} 的主题色。否则点「重置」或拖动其它
    // 滑块后，之前设过的背景色会被「永远残留」无法还原。
    if(p.bg && p.bg !== 'reset'){ document.body.style.background = p.bg; }
    else { document.body.style.background = ''; }
    // radius 仅在用户主动调整时应用；且仅作用于「原本已有圆角」的元素，避免给
    // input/文字块强加圆角。
    //  - 'reset' / null / 0：清除行内圆角，恢复模板原始圆角
    //    （0 与「默认」等价，避免「把滑块拖到 0 反而把圆角元素强行变直角」的陷阱，
    //     也让重置按钮把滑块归 0 后行为一致）
    //  - 其它数值：替换为 Npx
    if(p.radius==='reset' || p.radius==null || p.radius===0){
      // 清除之前叠加的行内圆角，恢复模板原始圆角
      if(_roundEls){ _roundEls.forEach(function(el){ el.style.borderRadius=''; }); }
    } else {
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
  function _flushCtrl(){
    var out = '';
    for(var k in _ctrlRules){ out += _ctrlRules[k] + '\\n'; }
    ensureCtrlStyle().textContent = out;
  }
  function applyControl(p){
    if(!p || !p.selector || !p.prop) return;
    try{
      // 特殊属性：直接操作 DOM 而非样式（始终应用，含默认态，以保证「重置」能还原）
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
      // 常规 CSS 属性：写入一条作用于 #wc-root 内该选择器的规则（!important 保证覆盖）。
      // 当取值恰等于「模板默认值」(p.raw === p.def) 时，不写入、并移除该 key 已有规则：
      //  1) 避免「默认态也强制覆盖」——如 3D 卡片的 transform:rotateX(0) !important 会
      //     用 !important 压制卡片自身的 JS 内联 hover 倾斜，导致一进详情页交互就失效；
      //  2) 保证「重置」能正确还原（把规则删掉，回退到模板原始样式）。
      if(p.raw === p.def){
        if(_ctrlRules[p.key] != null){ delete _ctrlRules[p.key]; _flushCtrl(); }
        return;
      }
      _ctrlRules[p.key] = '#wc-root ' + p.selector + '{' + p.prop + ':' + p.value + ' !important}';
      _flushCtrl();
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
export function renderPreview(container, t, { autoDemo = false, speed = 1, tokenize = true } = {}) {
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
  // tokenize（默认开）：把模板字面量颜色替换为 --wc-c1/--wc-c2 设计 token。
  //   —— 但「用户编辑代码后重新应用」时务必关闭(tokenize:false)！因为此时 t.css
  //      已经是 buildCode() 的产物，内含 `:root{--wc-c1:#xxx}` 覆盖块；若再次
  //      injectVarTokens 会把该块里的 #xxx 也替换成 var(--wc-c1)，造成
  //      `:root{--wc-c1:var(--wc-c1)}` 自引用 -> 颜色整体失效。
  const cssWithVars = tokenize ? getTokenizedCss(t) : (t.css || '');

  const theme = detectTheme(t);
  const bodyBg = theme === 'dark' ? '#111827' : '#ffffff';
  const bodyColor = theme === 'dark' ? '#e2e8f0' : 'inherit';
  const scrollbarColor = theme === 'dark'
    ? '::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#374151;border-radius:999px}::-webkit-scrollbar-thumb:hover{background:#4b5563}'
    : '::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:999px}::-webkit-scrollbar-thumb:hover{background:#9ca3af}';
  const rootVars = `:root{--wc-c1:${tokens.c1};--wc-c2:${tokens.c2};--wc-size:1;--wc-x:0px;--wc-y:0px;--wc-radius:12px;--wc-bg:${bodyBg};}`;
  // 关键：body 使用 overscroll-behavior:contain 阻止滚动链。模板中有大量滚动驱动效果
  //（进度条/渐变/缩放等），该属性确保 body 滚动不会"劫持"用户对模板内部 .track/.content
  // 等元素的滚轮事件，同时又保留 body 在内容溢出时的滚动能力（如 ef-scroll-show）。
  const base = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;background:${bodyBg};color:${bodyColor}}
html{${scrollbarColor}scrollbar-width:thin;scrollbar-color:${theme==='dark'?'#374151 transparent':'#d1d5db transparent'}}
body{display:flex;align-items:center;justify-content:center;min-height:100%;padding:16px;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#wc-root{max-width:100%;min-height:0;position:relative}
${rootVars}</style>`;

  const demo = autoDemo ? `<script>${demoScript()}<\/script>` : '';
  // 关键修复：base 样式需要在 DOCTYPE 之后（html→head 内），否则放在 DOCTYPE 前
  // 会触发浏览器怪异模式，导致样式丢失和布局异常。
  const full = `<!DOCTYPE html><html><head><meta charset="utf-8">
${base}
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
  iframe.srcdoc = full;
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
  // 关键：postMessage 使用结构化克隆，无法序列化函数/复杂对象。
  // state 里包含 controls（含 format 函数）与 ctrlValues，若整体下发会抛
  // DataCloneError 并被静默吞掉，导致 size/x/y/radius/颜色等全局参数
  // 「滑块拖动后预览毫无反应」。这里只挑出 apply() 实际需要的原始类型字段。
  const safe = {};
  if (params && typeof params === 'object') {
    for (const k of ['size', 'x', 'y', 'radius', 'c1', 'c2', 'bg', 'speed']) {
      if (k in params) safe[k] = params[k];
    }
  }
  try {
    iframe.contentWindow.postMessage({ type: 'wc-params', params: safe }, '*');
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

// 提取「原本就带有非 0 圆角」的选择器，用于导出代码时让圆角只作用于这些元素，
// 与实时预览运行时 collectRoundEls 的行为保持一致（保证所见即所得）。
// 排除：语义性圆形/胶囊（border-radius:50% 或 >=999px）与 0 值——
// 前者交给 extractRoundSelectors 单独保护；后者无需处理。
function extractRoundedSelectors(css) {
  const out = [];
  if (!css) return out;
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(css))) {
    const selector = m[1].trim();
    const body = m[2];
    const brMatch = /border-radius\s*:\s*([^;]+)/i.exec(body);
    if (!brMatch) continue;
    const val = brMatch[1].trim();
    if (/^(0|0px)\b/i.test(val)) continue;                                       // 0 值
    if (/(^|[^0-9])(5[0-9]|[6-9][0-9]|100)%/.test(val)) continue;                // 语义圆/胶囊
    if (/(999|[1-9]\d{3,})px/.test(val)) continue;                               // 大圆角胶囊
    out.push(selector);
  }
  return out;
}

// 把控制参数合并进模板源码，生成"所见即所得"的可复制代码。
// 返回 { html, css, js } 三个字符串。
// 颜色按「token 变量」写入，与预览效果 100% 一致且只影响目标对象。
// params 额外支持：
//   controls    : 该模板的专属控制项定义数组（来自 inferControls）
//   ctrlValues  : { key: value } 各专属控制项当前值
// 圆角 selector 提取（extractRoundedSelectors / extractRoundSelectors）也是确定性正则扫描，
// 由 t.css 唯一决定；拖拽圆角滑块时 buildCode 每帧调用，缓存避免重复扫描大段 CSS。
const _roundedCache = new Map();
const _roundCache = new Map();
function cachedRounded(css) {
  const hit = _roundedCache.get(css);
  if (hit !== undefined) return hit;
  const r = extractRoundedSelectors(css);
  _roundedCache.set(css, r);
  return r;
}
function cachedRound(css) {
  const hit = _roundCache.get(css);
  if (hit !== undefined) return hit;
  const r = extractRoundSelectors(css);
  _roundCache.set(css, r);
  return r;
}

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
  let css = getTokenizedCss(t);
  let override = '\n/* WebCooler 实时参数（设计 token） */\n';
  override += `:root{\n  --wc-c1: ${c1 || tokens.c1};\n  --wc-c2: ${c2 || tokens.c2};\n}`;
  if (bg) override += `\nbody{background:${bg} !important}`;
  if (radius != null) {
    // 仅作用于「模板原本就带圆角」的元素，与实时预览运行时 collectRoundEls 一致，
    // 避免旧版把圆角强加给全部 div/span/a/li，导致扁平文本块也被圆角化的不一致。
    const rounded = cachedRounded(t.css || '');
    const targets = rounded.length ? rounded : ['.card', '.box', '.b', '.c'];
    const sel = targets.map(s => `#wc-root ${s}`).join(',');
    override += `\n/* 圆角：仅作用于模板原本有圆角的元素（与实时预览一致） */\n${sel}{border-radius:${radius}px !important}`;
    // 保护「语义性圆形/胶囊」：原 CSS 中声明了 border-radius:50%（或 9999px 等大圆角）
    // 的选择器，其圆角是核心造型，不应被上面的通用圆角覆盖。为它们补一条恢复规则。
    const roundSelectors = cachedRound(t.css || '');
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

// 生成「与预览 100% 一致」的完整可运行 HTML 文档（含居中布局、主题背景、设计 token）。
// 供「复制全部代码」「下载 .html」共用，确保「复制/下载即所见」：
//  - 预览里 #wc-root 被 body(flex 居中) 包裹、并以模板主题色作为背景，下载版完全复刻该布局；
//  - 颜色沿用 buildCode 注入的 :root token（--wc-c1/--wc-c2），与实时参数控制一致。
// 旧版下载/复制的 HTML 是裸 <body>（打开后左上角对齐、白底），与预览效果脱节；
// 现统一收敛到该函数，避免重复拼接逻辑与「所见非所得」。
export function buildStandaloneHtml(t, params = {}, code) {
  // code 可选：传入「当前代码框（可能已被用户编辑）」时直接复用，避免二次 buildCode
  // 重新 token 化导致 :root{--wc-c1:var(--wc-c1)} 自引用、颜色失效，保证与编辑后预览一致。
  // 不传则按 (t, params) 正常构建（首页/分类页等未编辑场景的复制/下载）。
  const built = code || buildCode(t, params);
  const theme = detectTheme(t);
  const bodyBg = theme === 'dark' ? '#111827' : '#ffffff';
  const bodyColor = theme === 'dark' ? '#e2e8f0' : 'inherit';
  const title = (t.title || 'WebCooler 模板').replace(/[<>&"]/g, '');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;background:${bodyBg};color:${bodyColor}}
body{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px;overflow:auto;-webkit-overflow-scrolling:touch}
#wc-root{max-width:100%;position:relative}
</style>
<style>
${built.css}
</style>
</head>
<body>
${built.html}
<script>
${built.js}
<\/script>
</body>
</html>`;
}

// 解析模板 css，提取可调节参数（颜色 + 主要尺寸）。
// 供详情页初始化滑块默认值使用。
export function extractParams(css = '') {
  const tokens = parseTokens({ css: css || '' });
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

// 在沙箱内渲染模板（html + css + js），支持实时刷新
// 额外能力：
//  - runDemo：注入"自动演示脚本"，模拟点击 / 鼠标移动 / 键盘输入，让模板自动循环播放动画
//  - applyParams：通过 CSS 变量 + 直接覆盖，实时调节布局大小 / 位置 / 元素颜色

// 自动演示驱动：根据模板种类模拟真实交互
// 优化：使用 requestAnimationFrame 调度 + 停止控制，避免无限循环消耗
function demoScript(cat, id) {
  return `
  (function(){
    var _stop = false, _rafId = null;
    window.__wcDemoStop__ = false;
    window.__wcDemoPause__ = function(){ _stop = true; };
    window.__wcDemoResume__ = function(){ _stop = false; loop(); };

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
      var clickables = [].slice.call(document.querySelectorAll('button,.b,.box,.card,.ring,.star,.rp,.glow,.item,.nav,.tip,.cell,.wrap,.knob,.h,li,a'));
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
      if(clickables.length){
        var el2 = clickables[Math.floor(Math.random()*clickables.length)];
        el2.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        if(cat==='keyboard'){
          ['a','b','1','Enter','Escape'].forEach(function(k){
            document.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true}));
          });
        }
        return;
      }
      document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    }
    // 使用 requestAnimationFrame 延迟启动，避免阻塞首帧
    requestAnimationFrame(function(){ loop(); });
  })();
  `;
}

export function renderPreview(container, { html, css, js, cat = '', id = '' }, { autoDemo = true, speed = 1 } = {}) {
  const iframe = document.createElement('iframe');
  iframe.className = 'w-full h-full border-0';
  iframe.setAttribute('tabindex', '-1');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  container.innerHTML = '';
  container.appendChild(iframe);

  const doc = iframe.contentDocument;
  const full = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{box-sizing:border-box}html,body{margin:0;height:100%}
/* 控制参数变量默认值 */
:root{
  --wc-size:1; --wc-x:0px; --wc-y:0px; --wc-c1:#2f83ff; --wc-c2:#8b5cf6; --wc-bg:#ffffff; --wc-radius:12px;
}
</style>
<style id="wc-base">${css || ''}</style></head><body>
<div id="wc-root">${html || ''}</div>
<script>window.__wcSpeed__=${speed};<\/script>
<script>${js || ''}<\/script>
</body></html>`;
  doc.open();
  doc.write(full);
  doc.close();

  if (autoDemo) {
    const s = doc.createElement('script');
    s.textContent = demoScript(cat, id);
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

// 把控制参数应用到 iframe：通过注入一个覆盖样式（scoped）
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
  // 将常见颜色 token 替换为用户选择的颜色；缩放整块；平移
  let rules = `#wc-root{transform:scale(${size}) translate(${x}px,${y}px);transform-origin:center center;transition:transform .25s}`;
  if (bg) rules += `body{background:${bg} !important}`;
  if (radius) rules += `*[class]{border-radius:${radius}px !important}`;
  if (c1) {
    // 替换 css 中第一个主色（通过变量覆盖方式：将常用色值替换）
    rules += `\n:root{--wc-c1:${c1}}`;
  }
  if (c2) rules += `\n:root{--wc-c2:${c2}}`;
  // 颜色注入：直接覆盖含 #1664f0 / #2f83ff 等品牌色的规则
  if (c1) {
    rules += `
.wc-root *{}
[class*="b"]{background-color:${c1} !important}
button,.rp,.ring,.star.on{background-color:${c1} !important}`;
  }
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
export function buildCode(t, params = {}) {
  const { size = 1, x = 0, y = 0, radius = 12, c1, c2, bg, speed = 1 } = params;
  // HTML：在 #wc-root 上叠加实时变换样式（圆角仅作用于预览，不写入导出代码）
  let html = t.html || '';
  const rootStyle = `transform:scale(${size}) translate(${x}px,${y}px);transform-origin:center center;`;
  if (/id=["']wc-root["']/.test(html)) {
    html = html.replace(/(<[^>]*id=["']wc-root["'][^>]*?)>/i, `$1 style="${rootStyle}">`);
  } else {
    // 若模板没有 #wc-root，则包一层
    html = `<div id="wc-root" style="${rootStyle}">${html}</div>`;
  }
  // CSS：追加覆盖规则（颜色 / 背景）。圆角不写入代码，仅用于预览。
  let css = t.css || '';
  let override = '\n/* WebCooler 实时参数覆盖 */\n';
  if (bg) override += `body{background:${bg} !important}\n`;
  if (c1) override += `:root{--wc-c1:${c1}}\n[class*="b"],button,.rp,.ring,.star.on{background-color:${c1} !important}\n`;
  if (c2) override += `:root{--wc-c2:${c2}}\n`;
  if (speed !== 1) override += `/* 动画速度：${speed.toFixed(1)}×（数值越小越慢） */\n`;
  css += override;
  // JS：注入速度系数，保证复制后行为一致
  let js = t.js || '';
  if (speed !== 1) {
    js = `// 动画速度系数（越小越慢，越大越快）\nwindow.__wcSpeed__ = ${speed};\n` + js;
  }
  return { html, css, js };
}

// 解析模板 css，提取可调节参数（颜色 + 主要尺寸）
export function extractParams(css = '') {
  const colors = [];
  const re = /#[0-9a-fA-F]{3,8}\b/g;
  let m;
  while ((m = re.exec(css))) {
    const c = m[0].toLowerCase();
    if (!colors.includes(c) && c !== '#fff' && c !== '#ffffff' && c !== '#000' && c !== '#000000') colors.push(c);
  }
  // 提取大尺寸数值（宽/高相关）
  const sizes = [];
  const sre = /(?:width|height|padding|font-size|max-width)\s*:\s*(\d+)px/g;
  while ((m = sre.exec(css))) {
    sizes.push(parseInt(m[1], 10));
  }
  return {
    colors: colors.slice(0, 4),
    maxSize: sizes.length ? Math.max(...sizes) : 200
  };
}

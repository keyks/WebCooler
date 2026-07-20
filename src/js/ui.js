import { CATEGORIES } from './data/categories.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { store } from './utils/storage.js';
import { detectTheme, buildCode, copyText, buildStandaloneHtml } from './utils/preview.js';

// ── 全局工具：Toast 通知系统 ──
let _toastTimer = null;
export function toast(msg, type = 'info') {
  let el = document.getElementById('wc-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'wc-toast';
    el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg pointer-events-none transition-all duration-300 opacity-0 translate-y-4';
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  const colors = { info: 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800', success: 'bg-emerald-600 text-white', error: 'bg-red-600 text-white' };
  // 只移除颜色类（bg/text + 颜色前缀），避免误删 text-sm / text-xs 等字号类
  el.className = el.className.replace(/bg-(slate|emerald|red)-\S+|text-(white|slate|emerald|red)-\S+/g, '');
  el.className += ' ' + (colors[type] || colors.info);
  el.textContent = msg;
  el.classList.remove('opacity-0', 'translate-y-4');
  el.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.classList.remove('opacity-100', 'translate-y-0');
    el.classList.add('opacity-0', 'translate-y-4');
  }, 2200);
}

// ── 卡片快速操作：复制 / 收藏 / 下载（document 级事件委托，全局一次生效） ──
function _resolveCard(btn) {
  const root = btn.closest('[data-card]');
  if (!root) return null;
  const id = root.dataset.card;
  return (window.__WC_TEMPLATES__ || []).find(t => t.id === id) || null;
}
function _downloadTemplateHtml(t) {
  // 复用 buildStandaloneHtml：与详情页「下载」共用同一份逻辑，
  // 保证卡片快速操作下载的 .html 与详情页、预览效果完全一致的居中布局与主题背景。
  const html = buildStandaloneHtml(t, {});
  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${t.id}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function _syncNavFav() {
  const el = document.querySelector('[data-fav-count]');
  if (el) el.textContent = (store.get().favs || []).length;
}
// 向卡片 mini iframe 发送开始/停止指令（跨源沙箱下 postMessage 仍可用）
export function postMini(el, type) {
  const f = el.querySelector('iframe');
  if (f && f.contentWindow) { try { f.contentWindow.postMessage({ type }, '*'); } catch (_) {} }
}
document.addEventListener('click', async (e) => {
  const copyBtn = e.target.closest('.wc-act-copy');
  const favBtn = e.target.closest('.wc-act-fav');
  const dlBtn = e.target.closest('.wc-act-dl');
  if (!copyBtn && !favBtn && !dlBtn) return;
  e.preventDefault();
  e.stopPropagation();
  const t = _resolveCard(copyBtn || favBtn || dlBtn);
  if (!t) return;
  if (copyBtn) {
    const code = buildCode(t, {});
    const parts = [];
    if (t.html) parts.push('<!-- HTML -->\n' + code.html);
    if (t.css) parts.push('/* CSS */\n' + code.css);
    if (t.js) parts.push('/* JS */\n' + code.js);
    await copyText(parts.join('\n\n'));
    toast('已复制代码', 'success');
  } else if (favBtn) {
    const favs = store.toggleFav(t.id);
    const on = favs.includes(t.id);
    favBtn.textContent = on ? '★' : '☆';
    favBtn.classList.toggle('text-amber-500', on);
    _syncNavFav();
    toast(on ? '已收藏' : '已取消收藏', 'info');
  } else if (dlBtn) {
    _downloadTemplateHtml(t);
    toast('已下载 ' + t.id + '.html', 'success');
  }
});

// ── 全局快捷键注册 ──
export function bindGlobalShortcuts() {
  document.addEventListener('keydown', e => {
    // Ctrl+K / Cmd+K → 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('#hero-search, #search');
      if (searchInput) { searchInput.focus(); searchInput.select(); }
    }
    // Esc → 关闭任何打开的弹层
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('[data-modal].active');
      openModals.forEach(m => { m.classList.remove('active'); m.style.display = 'none'; });
    }
  });
}

// 全局导航栏
export function renderNav(active = '') {
  const favCount = (store.get().favs || []).length;
  const links = [
    { href: 'index.html', id: '', label: '首页' },
    { href: 'categories.html', id: 'category', label: '分类' },
    { href: 'workbench.html', id: 'workbench', label: '我的工作台' },
    { href: 'downloads.html', id: 'downloads', label: '关于我们' }
  ];
  const dark = document.documentElement.classList.contains('dark');
  return `
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-slate-900/70">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="index.html" class="flex items-center gap-2 font-extrabold text-lg group" aria-label="WebCooler 首页">
        <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-white grid place-items-center group-hover:scale-110 transition-transform">W</span>
        <span class="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">WebCooler</span>
      </a>
      <nav class="hidden md:flex items-center gap-1" aria-label="主导航">
        ${links.map(l => `<a href="${l.href}" class="px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active===l.id?'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">${l.label}</a>`).join('')}
      </nav>
      <div class="flex items-center gap-2">
        <a href="workbench.html" class="relative text-sm px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="收藏夹，${favCount} 个收藏">
          ⭐ <span class="ml-1 font-mono text-xs" data-fav-count>${favCount}</span>
          ${favCount > 0 ? `<span class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>` : ''}
        </a>
        <button id="theme-toggle" class="w-9 h-9 grid place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-lg transition-colors" aria-label="${dark ? '切换到浅色模式' : '切换到深色模式'}">${dark ? '☀️' : '🌙'}</button>
        <kbd class="hidden lg:inline-flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700" title="搜索快捷键">Ctrl+K</kbd>
      </div>
    </div>
    <div class="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex gap-1 overflow-x-auto scrollbar-none">
      ${links.map(l => `<a href="${l.href}" class="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${active===l.id?'bg-brand-50 dark:bg-slate-800 text-brand-600':'text-slate-600 dark:text-slate-300'}">${l.label}</a>`).join('')}
    </div>
  </header>`;
}

export function renderFooter() {
  return `
  <footer class="border-t border-slate-200 dark:border-slate-800 mt-16 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
    <div class="max-w-7xl mx-auto px-4">
      <p class="font-bold text-slate-700 dark:text-slate-200 mb-2">WebCooler · 万能 Web 前端模板与交互效果库</p>
      <p>免费商用 · 无版权 · 一键复制 · 一键下载 · 在线实时预览</p>
      <div class="flex flex-wrap justify-center gap-2 mt-4">
        ${CATEGORIES.map(c => `<span class="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">${c.icon} ${c.name}</span>`).join('')}
      </div>
      <p class="mt-4 text-xs">© 2026 WebCooler — 由 keysk 开发，保留所有权利。</p>
    </div>
  </footer>`;
}

// 模板卡片（用于网格）。带文件名（template id）+ 悬停实时播放动画
// back：点击卡片进入详情页后，「返回」应跳回的完整 URL（含查询参数）
//   若未提供，则回退到详情页根据 from 推断的默认页
export function templateCard(t, { fav = false, from = '', back = '' } = {}) {
  const params = new URLSearchParams();
  params.set('id', t.id);
  if (from) params.set('from', from);
  if (back) params.set('back', back);
  const isFav = store.isFav(t.id);
  return `
  <a href="detail.html?${params.toString()}" class="group wc-card p-4 block transition-transform duration-150 ease-out will-change-transform" data-card="${t.id}" data-card-3d>
    <div class="preview-frame h-52 mb-3 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800 relative" data-mini="${t.id}">
      <div class="wc-skeleton absolute inset-0" style="animation-delay:${Math.random()*0.5}s"></div>
      <span class="wc-mini-hint text-slate-300 dark:text-slate-600 text-xs absolute z-10">预览</span>
      <span class="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-200 font-mono opacity-0 group-hover:opacity-100 transition z-20">${t.id}.html</span>
      <div class="wc-actions absolute top-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition focus-within:opacity-100">
        <button type="button" class="wc-act-copy w-7 h-7 grid place-items-center rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-sm hover:text-brand-600 transition" title="复制代码" aria-label="复制代码">⧉</button>
        <button type="button" class="wc-act-fav w-7 h-7 grid place-items-center rounded-md bg-white/90 dark:bg-slate-900/90 shadow-sm hover:text-amber-500 transition ${isFav?'text-amber-500':''}" title="收藏" aria-label="收藏">${isFav?'★':'☆'}</button>
        <button type="button" class="wc-act-dl w-7 h-7 grid place-items-center rounded-md bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 shadow-sm hover:text-brand-600 transition" title="下载 .html" aria-label="下载">⤓</button>
      </div>
    </div>
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-semibold text-sm line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">${t.title}</h3>
      ${fav ? '<span class="text-amber-500 shrink-0">★</span>' : ''}
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">${t.desc || t.tags.join(' · ')}</p>
    <div class="flex flex-wrap gap-1 mt-2">
      ${t.tags.slice(0,3).map(tg => `<span class="text-[10px] px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${tg}</span>`).join('')}
    </div>
  </a>`;
}

// ── Mini 预览引擎核心 ──
// mini HTML 缓存：相同模板 ID + staticMode 复用已构建的 HTML（含动态 demo 脚本），
// 避免重复拼接大段字符串；普通用户（非 reduced-motion）也命中，分类页反复 render 复用。
const _miniCache = new Map(); // key: `${id}::${staticMode}` → htmlString
function _miniCacheKey(id, staticMode) { return `${id}::${staticMode}`; }

// 在 mini 预览框内渲染真实效果。
// static=true：仅注入 html+css，保持静态（鼠标脱离卡片的状态）
// static=false：注入 html+css/js + 自动演示脚本，实时播放点击/键盘/鼠标动画
function mountMini(f, t, staticMode) {
  const key = _miniCacheKey(t.id, staticMode);
  let cached = _miniCache.get(key);
  if (cached) {
    // 直接复用缓存 HTML —— srcdoc 赋值是最廉价的重渲染方式，
    // 且避免「沙箱 iframe contentDocument 为 null 导致 doc.open 崩溃」。
    f.srcdoc = cached;
    return;
  }

  const theme = detectTheme(t);
  const miniBg = theme === 'dark' ? '#111827' : '#fff';
  const baseCss = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:auto;scrollbar-width:none}
  html{background:${miniBg}}
  body::-webkit-scrollbar{display:none}
  body{display:flex;align-items:center;justify-content:center;padding:6px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:${miniBg}}
  #wc-fit{transform-origin:center center;transition:transform .2s;max-width:100%;position:relative}</style>
  <style>${t.css||''}</style>`;
  // 自适应缩放脚本：内容超出容器时整体缩小，保证完整显示
  const fit = `<script>
  (function(){
    var tid=null;
    function fit(){
      var w=document.getElementById('wc-fit');if(!w)return;
      w.style.transform='none';
      var vw=document.documentElement.clientWidth-12, vh=document.documentElement.clientHeight-12;
      var cw=w.scrollWidth, ch=w.scrollHeight;
      if(!cw||!ch)return;
      var s=Math.min(1, vw/cw, vh/ch);
      if(s<1) w.style.transform='scale('+s+')';
    }
    function debounceFit(){clearTimeout(tid);tid=setTimeout(fit,80);}
    window.addEventListener('load',fit);
    setTimeout(fit,60);setTimeout(fit,300);
    window.addEventListener('resize',debounceFit);
    // ResizeObserver 监听内容变化，更精准
    if(window.ResizeObserver){new ResizeObserver(debounceFit).observe(document.getElementById('wc-fit'));}
  })();
  <\/script>`;
  const demo = staticMode ? '' : `<script>
  (function(){
    var _stop=true, _rafId=null;
    function reset(){var scs=document.querySelectorAll('.track,.content,.snap,.wrap');scs.forEach(function(s){s.scrollTop=0;s.scrollLeft=0;});var flds=document.querySelectorAll('input,textarea');flds.forEach(function(f){f.value='';if(f.blur)f.blur();});}
    window.__wcMiniStop__=function(){_stop=true;if(_rafId)cancelAnimationFrame(_rafId);reset();};
    window.__wcMiniStart__=function(){if(!_stop)return;_stop=false;loop();};
    window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='wc-mini-start')window.__wcMiniStart__();else if(d.type==='wc-mini-stop')window.__wcMiniStop__();});
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const sp=ms=>{const k=window.__wcMiniSpeed__||1;return Math.max(20,ms/k);};
    async function play(){
      if(_stop)return;
      const fields=[...document.querySelectorAll('input,textarea')];
      if(fields.length){const f0=fields[0];if(f0.blur)f0.blur();f0.readOnly=true;for(var v of['Hi','Web','Cool','123']){f0.value=v;f0.dispatchEvent(new Event('input',{bubbles:true}));await sleep(sp(400));}if(f0.blur)f0.blur();return;}
      // 滚动驱动类：探测滚动容器并模拟滚动，触发 scroll 类特效
      var sc=(function(){var cands=[].slice.call(document.querySelectorAll('.track,.content,.snap,.wrap'));for(var k=0;k<cands.length;k++){if(cands[k].scrollHeight>cands[k].clientHeight+2)return cands[k];}var all=[].slice.call(document.querySelectorAll('#wc-fit *'));for(var m=0;m<all.length;m++){var el=all[m];var cs=getComputedStyle(el);if(((cs.overflowY==='auto'||cs.overflowY==='scroll'||cs.overflow==='auto'||cs.overflow==='scroll')&&el.scrollHeight>el.clientHeight+5)||((cs.overflowX==='auto'||cs.overflowX==='scroll')&&el.scrollWidth>el.clientWidth+5))return el;}return null;})();
      if(sc){var maxY=sc.scrollHeight-sc.clientHeight,maxX=sc.scrollWidth-sc.clientWidth;for(var s=0;s<=10;s++){if(_stop)return;sc.scrollTop=maxY*(s/10);sc.scrollLeft=maxX*(s/10);sc.dispatchEvent(new Event('scroll',{bubbles:true}));await sleep(sp(45));}for(var s2=10;s2>=0;s2--){if(_stop)return;sc.scrollTop=maxY*(s2/10);sc.scrollLeft=maxX*(s2/10);sc.dispatchEvent(new Event('scroll',{bubbles:true}));await sleep(sp(35));}return;}
      const area=document.querySelector('.area,.glow,.smoke,.fire');
      if(area){const r=area.getBoundingClientRect();for(var i=0;i<8;i++){area.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width*(0.2+0.6*Math.random()),clientY:r.top+r.height*(0.2+0.6*Math.random()),bubbles:true}));}return;}
      const els=[...document.querySelectorAll('button,.b,.box,.card,.ring,.star,.rp,.glow,.item,.nav,.tip,.cell,.wrap,li,div')].filter(function(e){return e.offsetWidth>0&&e.tagName!=='A';});
      if(els.length){const e=els[Math.floor(Math.random()*els.length)];e.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    }
    async function loop(){
      while(!_stop){
        try{await play();}catch(e){}
        if(_stop)break;
        await sleep(sp(1300));
      }
    }
    loop();
  })();
  <\/script>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">${baseCss}</head><body><div id="wc-fit">${t.html||''}</div>${staticMode?'':`<script>${t.js||''}<\/script>`}${demo}${fit}</body></html>`;

  // 缓存 mini HTML：内容完全由「模板 t + staticMode」决定，与运行时演示进度无关
  //（demo 脚本是确定性 JS，每次生成相同），因此无论静态还是动态模式都可安全复用
  //（key 已区分 staticMode）。普通用户（prefers-reduced-motion 关闭）走动态模式也命中，
  // 避免每次渲染卡片都重新拼接大段 demo 脚本；分类页反复搜索/切分类重建 grid 后，
  // 同一模板直接复用缓存 srcdoc，显著降低字符串拼接与正则开销。
  _miniCache.set(key, html);
  // 限制缓存大小：最多 320 个条目（覆盖全站 247 个模板 × 静态/动态两种模式），
  // 超出淘汰最早写入者（Map 保持插入序）。足够大以让分类页滚动回看任一卡片时
  // 直接复用已缓存的 srcdoc，避免反复拼接大段 demo 脚本；又不至于无上限增长。
  if (_miniCache.size > 320) {
    const first = _miniCache.keys().next().value;
    _miniCache.delete(first);
  }

  // 沙箱 iframe 下 contentDocument 为 null，doc.open() 会崩溃；
  // 改用 srcdoc 赋值（跨源沙箱仍可加载、脚本可执行）。
  f.srcdoc = html;
}

// ── Mini 预览懒加载 + 可视区域感知 ──
let _miniObserver = null;
let _unmountObserver = null;
let _miniPending = [];
let _miniScheduled = false;

function _getMiniObserver() {
  if (_miniObserver) return _miniObserver;
  _miniObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        _miniObserver.unobserve(el);
        _miniPending.push(el);
        _scheduleMiniRender();
      }
    });
  }, { rootMargin: '600px' }); // 提前 600px 开始加载，保证首屏卡片无需滚动即渲染
  return _miniObserver;
}

// ── 离屏回收：远离视口时卸载 iframe 释放内存/CPU，回到视口（渲染 observer 预载）再重建 ──
function _getUnmountObserver() {
  if (_unmountObserver) return _unmountObserver;
  _unmountObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) return; // 仍在视口附近，保留 iframe
      unmountMini(el);
      // 重新加入渲染队列（保留 600px 预载），回到视口时用缓存 srcdoc 重建
      if (el.isConnected) _getMiniObserver().observe(el);
    });
  }, { rootMargin: '900px 0px 900px 0px' }); // 卸载阈值(900px) 必须 > 渲染预载(600px)，
  // 否则 300~600px 区间的卡片会被「刚渲染又被卸载」反复震荡；900px 外才回收。
  return _unmountObserver;
}

function unmountMini(el) {
  const f = el.querySelector('iframe');
  if (f) f.remove();
  // 卸载后恢复骨架占位，回到视口重建时平滑过渡（避免闪现空白）
  const sk = el.querySelector('.wc-skeleton');
  if (sk) { sk.style.opacity = '1'; sk.style.zIndex = ''; }
  if (_unmountObserver) _unmountObserver.unobserve(el);
}

function _scheduleMiniRender() {
  if (_miniScheduled) return;
  _miniScheduled = true;
  // 用 setTimeout(0) 而非 requestIdleCallback：在大量 iframe 创建/回收的突发场景下，
  // headless/低端机上 rIC 会被长期推迟（即便带 timeout），导致大跨度滚动后预览迟迟不出现。
  // setTimeout(0) 保证队列持续推进；每批 4 个并级联调度，既流畅又不会长时间空白。
  setTimeout(() => {
    _miniScheduled = false;
    const batch = _miniPending.splice(0, 4); // 每批最多处理 4 个，避免单次阻塞过久
    batch.forEach(el => _renderOneMini(el));
    if (_miniPending.length > 0) _scheduleMiniRender(); // 继续下一批
  }, 0);
}

function _renderOneMini(el) {
  const t = window.__WC_TEMPLATES__?.find(x => x.id === el.dataset.mini);
  if (!t || el.querySelector('iframe')) return; // 已渲染则跳过
  const f = document.createElement('iframe');
  // 主题匹配：iframe 背景色跟随模板主题，避免从骨架到内容出现白闪/黑闪
  const theme = detectTheme(t);
  const iframeBg = theme === 'dark' ? '#111827' : '#f8fafc';
  // 绝对铺满并置于骨架之上(z-5)；加载完成后骨架淡出、iframe 淡入显形
  f.style.cssText = `position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .18s ease;background:${iframeBg}`;
  f.setAttribute('tabindex', '-1');
  f.setAttribute('sandbox', 'allow-scripts');
  f.setAttribute('title', t.title || '');
  // 加载骨架：复用 templateCard 已渲染的 .wc-skeleton（置顶 z-99 盖住 iframe），
  // 待 iframe 加载完成后淡出移除，避免「先空白再淡入」的突兀感（与详情页一致）。
  const sk = el.querySelector('.wc-skeleton');
  if (sk) sk.style.zIndex = '99';
  const hint = el.querySelector('.wc-mini-hint');
  el.appendChild(f);
  let _done = false;
  const cleanup = () => {
    if (_done) return; _done = true;
    f.style.opacity = '1';
    if (sk) { sk.style.opacity = '0'; setTimeout(() => sk.remove(), 220); }
    if (hint) hint.remove();
  };
  // 跨源沙箱下 iframe 的 load 事件仍会触发（不依赖 contentWindow），作为主移除时机
  f.addEventListener('load', cleanup, { once: true });
  // 兜底：极端环境 load 未触发时，避免骨架常驻
  setTimeout(cleanup, 800);
  // 尊重「减少动态效果」：reduced-motion 用户以静态（staticMode）渲染 mini 预览，
  // 不注入 js/demo，不自动播放动效，与全局 bindCardTilt 的 reduced-motion 守卫保持一致。
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  mountMini(f, t, reduce);

  // 渲染完成后加入「离屏回收」观察：远离视口时卸载 iframe 释放内存/CPU，
  // 回到视口（渲染 observer 预载）再复用缓存 srcdoc 重建，避免 247 个卡片常驻并发 iframe。
  _getUnmountObserver().observe(el);
}

export function renderMiniPreviews(root = document) {
  const observer = _getMiniObserver();
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.querySelectorAll('[data-mini]').forEach(el => {
    observer.observe(el);
    // hover 一次性绑定（元素级）：进入启动实时演示、离开停止并复位；
    // 移到此处避免每次回收重建 iframe 时重复绑定监听。reduced-motion 下跳过。
    if (!el.dataset._miniHoverBound) {
      el.dataset._miniHoverBound = '1';
      if (!reduce) {
        el.addEventListener('mouseenter', () => { postMini(el, 'wc-mini-start'); setTimeout(() => postMini(el, 'wc-mini-start'), 280); });
        el.addEventListener('mouseleave', () => postMini(el, 'wc-mini-stop'));
      }
    }
  });
}

// 软重置：断开 observer 并清空待渲染队列，但「保留 _miniCache」——
// 分类页反复搜索/切分类时 grid 会被重建，新卡片用同一模板 ID 仍能命中缓存，
// 直接复用已构建的 srcdoc，避免每次 render 都重新拼接大段 demo 脚本。
// 仅在页面彻底销毁（如搜索空结果）时才调用 destroyMiniPreviews（含清缓存）。
export function resetMiniObserver() {
  if (_miniObserver) { _miniObserver.disconnect(); _miniObserver = null; }
  if (_unmountObserver) { _unmountObserver.disconnect(); _unmountObserver = null; }
  _miniPending = [];
  _miniScheduled = false;
}

// 清理：销毁 observer（页面切换时调用可减少内存占用）
export function destroyMiniPreviews() {
  if (_miniObserver) { _miniObserver.disconnect(); _miniObserver = null; }
  if (_unmountObserver) { _unmountObserver.disconnect(); _unmountObserver = null; }
  _miniPending = [];
  _miniScheduled = false;
  _miniCache.clear();
}

// ── 卡片 3D 悬浮倾斜（data-card-3d）：轻量、单次全局委托、rAF 节流 ──
// 仅做一层 3D 视觉反馈，不改变卡片布局、不拦截点击/收藏/下载等交互。
let _tiltBound = false;
function bindCardTilt() {
  if (_tiltBound) return;
  // 尊重「减少动态效果」系统偏好：开启时完全不绑定，避免眩晕
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  _tiltBound = true;
  const MAX = 7; // 最大倾斜角度（deg）
  let raf = null, cur = null;
  // 复位某卡片的倾斜
  function reset(card) { if (card) card.style.transform = ''; if (cur === card) cur = null; }
  document.addEventListener('mousemove', e => {
    const card = e.target.closest ? e.target.closest('[data-card-3d]') : null;
    if (!card) { reset(cur); return; }
    // 跨卡片移动：先复位上一个
    if (card !== cur) { reset(cur); cur = card; }
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5 ~ 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (!cur) return;
      const ry = (px * MAX * 2).toFixed(2);
      const rx = (-py * MAX * 2).toFixed(2);
      cur.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
  }, { passive: true });
  // 离开卡片（relatedTarget 不在卡片内）时复位
  document.addEventListener('mouseout', e => {
    const card = e.target.closest ? e.target.closest('[data-card-3d]') : null;
    if (card && !card.contains(e.relatedTarget)) reset(card);
  });
}

// 绑定主题切换
export function bindThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.onclick = () => {
    const dark = toggleTheme();
    btn.textContent = dark ? '☀️' : '🌙';
  };
}

let _shortcutsBound = false;
export function initAppShell(active) {
  initTheme();
  document.body.insertAdjacentHTML('afterbegin', renderNav(active));
  document.body.insertAdjacentHTML('beforeend', renderFooter());
  bindThemeToggle();
  bindCardTilt();
  if (!_shortcutsBound) { bindGlobalShortcuts(); _shortcutsBound = true; }
}

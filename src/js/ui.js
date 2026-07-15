import { CATEGORIES } from './data/categories.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { store } from './utils/storage.js';

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
  el.className = el.className.replace(/bg-\S+|text-\S+/g, '');
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
          ⭐ <span class="ml-1 font-mono text-xs">${favCount}</span>
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
  return `
  <a href="detail.html?${params.toString()}" class="group wc-card p-4 block" data-card="${t.id}" data-card-3d>
    <div class="preview-frame h-52 mb-3 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800 relative" data-mini="${t.id}">
      <div class="wc-skeleton absolute inset-0" style="animation-delay:${Math.random()*0.5}s"></div>
      <span class="wc-mini-hint text-slate-300 dark:text-slate-600 text-xs absolute z-10">预览</span>
      <span class="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-200 font-mono opacity-0 group-hover:opacity-100 transition z-20">${t.id}.html</span>
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
// 内容缓存：相同模板 ID 复用已构建的 HTML（含自动演示脚本），避免重复构建。
const _miniCache = new Map(); // key: id → htmlString

// clipboard 垫片：沙箱 iframe（opaque origin）下 navigator.clipboard.writeText 会 reject，
// 导致「点击复制」类模板在自动演示时抛 Unhandled Rejection（污染控制台）。
// 注入一个内存版 writeText/readText（返回 resolved），既消除报错又让"已复制"反馈正常显现。
const CLIPBOARD_SHIM = `<script>try{Object.defineProperty(navigator,'clipboard',{value:{writeText:function(){return Promise.resolve()},readText:function(){return Promise.resolve('')}},configurable:true})}catch(e){try{if(navigator.clipboard)navigator.clipboard.writeText=function(){return Promise.resolve()}}catch(_){}}<\/script>`;

// 从模板 CSS 中「派生」出可用 JS 模拟的悬停态：
//  - hoverCss：把所有含 :hover 的规则复制一份，将 :hover 替换为 .wc-hv 类，
//    使我们能用「加/去 .wc-hv class」来平滑模拟真实鼠标悬停（:hover 伪类无法用 JS 触发）。
//  - targets：需要被加 class 的「承载悬停的元素」选择器（:hover 前紧邻的选择器片段）。
function deriveHover(css) {
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let hoverCss = '';
  const targets = new Set();
  let m;
  while ((m = ruleRe.exec(css))) {
    const sel = m[1];
    if (!/:hover/.test(sel)) continue;
    hoverCss += sel.replace(/:hover/g, '.wc-hv') + '{' + m[2] + '}';
    sel.split(',').forEach(s => {
      const idx = s.indexOf(':hover');
      if (idx < 0) return;
      const tok = s.slice(0, idx).split(/[\s>+~]+/).filter(Boolean).pop();
      if (tok) targets.add(tok.trim());
    });
  }
  return { hoverCss, targets: [...targets] };
}

// mini 自动演示引擎（注入 iframe 内运行）：平滑循环演示模板「自身的核心交互」，
// 让 hover / 输入 / 点击 / 鼠标轨迹类模板在卡片里"活"起来。设计要点：
//  - 只演示模板自己的交互，节奏稳定、有进有退，杜绝早期「随机点一堆元素→内容乱跳」的问题；
//  - 通过父页面 postMessage 控制 play/pause，卡片滚出视口即暂停，200+ 卡片也不烧 CPU；
//  - 尊重 prefers-reduced-motion：用户偏好减少动态时不演示，仅保留 CSS 入场。
function miniDemoScript(targets) {
  return `<script>(function(){
    try{ if(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches) return; }catch(e){}
    var HOVER=${JSON.stringify(targets)};
    var stopped=false, paused=true, started=false;
    var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
    function live(){return !paused&&!stopped;}
    function qa(sel){try{return [].slice.call(document.querySelectorAll(sel))}catch(e){return []}}
    function hoverNodes(){var out=[];HOVER.forEach(function(s){qa('#wc-fit '+s).forEach(function(e){if(out.indexOf(e)<0)out.push(e)})});return out;}
    function fields(){return qa('#wc-fit input, #wc-fit textarea');}
    function area(){return document.querySelector('#wc-fit .area,#wc-fit .track,#wc-fit .glow,#wc-fit .smoke,#wc-fit .fire');}
    function clickables(){return qa('#wc-fit button, #wc-fit [id]').filter(function(e){return e.offsetWidth>0 && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName)});}
    window.addEventListener('message',function(e){
      var d=e.data||{};
      if(d.wcMini==='pause') paused=true;
      else if(d.wcMini==='play'){ paused=false; if(!started){started=true; loop();} }
    });
    async function once(){
      var fs=fields();
      if(fs.length){
        var f0=fs[0]; try{f0.readOnly=true;}catch(e){}
        var samples=['Web','Cooler','你好','123'];
        for(var i=0;i<samples.length;i++){ if(!live())return; f0.value=samples[i]; f0.dispatchEvent(new Event('input',{bubbles:true})); f0.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await sleep(420); }
        await sleep(700);
        f0.value=''; f0.dispatchEvent(new Event('input',{bubbles:true}));
        return;
      }
      var hs=hoverNodes();
      if(hs.length){
        hs.forEach(function(e){e.classList.add('wc-hv')});
        await sleep(1200);
        hs.forEach(function(e){e.classList.remove('wc-hv')});
        await sleep(600);
        return;
      }
      var ar=area();
      if(ar){
        var r=ar.getBoundingClientRect();
        for(var j=0;j<18;j++){ if(!live())return; var x=r.left+r.width*(0.15+0.7*(0.5+0.5*Math.sin(j/2.2))); var y=r.top+r.height*(0.15+0.7*(0.5+0.5*Math.cos(j/3.1))); ar.dispatchEvent(new MouseEvent('mousemove',{clientX:x,clientY:y,bubbles:true})); await sleep(85); }
        return;
      }
      var cs=clickables();
      if(cs.length){
        var el=cs[0];
        el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        await sleep(1200);
        if(!live())return;
        // toggle/展开类：再点一次复位；modal 类：尝试点关闭，避免卡在打开态
        el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        var closer=document.querySelector('#wc-fit #close,#wc-fit .close');
        if(closer) closer.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        await sleep(700);
        return;
      }
      await sleep(900);
    }
    async function loop(){
      while(!stopped){
        if(!live()){ await sleep(200); continue; }
        try{ await once(); }catch(e){}
        if(!live())continue;
        await sleep(800);
      }
    }
  })();<\/script>`;
}

// 在 mini 预览框内渲染真实效果：注入 html + css + js + 自动演示引擎，
// 让卡片里的模板"活"起来（hover / 点击 / 输入 / 鼠标轨迹自动循环演示）。
function mountMini(f, t) {
  let cached = _miniCache.get(t.id);
  if (cached) {
    // 直接复用缓存 HTML —— srcdoc 赋值是最廉价的重渲染方式，
    // 且避免「沙箱 iframe contentDocument 为 null 导致 doc.open 崩溃」。
    f.srcdoc = cached;
    return;
  }

  const { hoverCss, targets } = deriveHover(t.css || '');
  const baseCss = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden}
  body{display:flex;align-items:center;justify-content:center;padding:6px}
  #wc-fit{transform-origin:center center;transition:transform .2s}</style>
  <style>${t.css||''}</style>${hoverCss?`<style>${hoverCss}</style>`:''}`;
  // 自适应缩放脚本：内容超出容器时整体缩小，保证完整显示。
  // 首次稳定后停止 ResizeObserver，避免自动演示期间（如 hover 放大）触发反复 refit 抖动。
  const fit = `<script>
  (function(){
    var tid=null, ro=null;
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
    if(window.ResizeObserver){ro=new ResizeObserver(debounceFit);ro.observe(document.getElementById('wc-fit'));}
    // 内容布局稳定后断开监听，演示期的临时尺寸变化不再触发缩放抖动
    setTimeout(function(){ if(ro) ro.disconnect(); }, 1200);
  })();
  <\/script>`;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">${baseCss}</head><body><div id="wc-fit">${t.html||''}</div>${CLIPBOARD_SHIM}<script>${t.js||''}<\/script>${miniDemoScript(targets)}${fit}</body></html>`;

  _miniCache.set(t.id, html);
  // 限制缓存大小：最多 80 个条目
  if (_miniCache.size > 80) {
    const first = _miniCache.keys().next().value;
    _miniCache.delete(first);
  }

  // 沙箱 iframe 下 contentDocument 为 null，doc.open() 会崩溃；
  // 改用 srcdoc 赋值（跨源沙箱仍可加载、脚本可执行）。
  f.srcdoc = html;
}

// ── Mini 预览懒加载 + 可视区域感知 ──
let _miniObserver = null;
let _miniPending = [];
let _miniScheduled = false;
let _playObserver = null;

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

// 播放/暂停观察器：卡片进入视口→通知 iframe 内演示引擎 play；滚出→pause。
// 这样任意时刻只有可视区域内的少量卡片在跑动画，200+ 卡片也不会烧 CPU。
function _getPlayObserver() {
  if (_playObserver) return _playObserver;
  _playObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      const f = en.target.querySelector('iframe');
      if (!f || !f.contentWindow) return;
      try { f.contentWindow.postMessage({ wcMini: en.isIntersecting ? 'play' : 'pause' }, '*'); } catch (e) {}
    });
  }, { rootMargin: '80px' });
  return _playObserver;
}

function _scheduleMiniRender() {
  if (_miniScheduled) return;
  _miniScheduled = true;
  // 使用 requestIdleCallback 在浏览器空闲时渲染，避免阻塞主线程
  const schedule = window.requestIdleCallback || (fn => setTimeout(fn, 1));
  schedule(() => {
    _miniScheduled = false;
    const batch = _miniPending.splice(0, 4); // 每帧最多处理 4 个，避免卡顿
    batch.forEach(el => _renderOneMini(el));
    if (_miniPending.length > 0) _scheduleMiniRender(); // 继续下一批
  }, { timeout: 100 });
}

function _renderOneMini(el) {
  const t = window.__WC_TEMPLATES__?.find(x => x.id === el.dataset.mini);
  if (!t || el.querySelector('iframe')) return; // 已渲染则跳过
  const f = document.createElement('iframe');
  // 绝对铺满并置于骨架之上(z-5)；加载完成后骨架淡出、iframe 淡入显形
  f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .18s ease';
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
  f.addEventListener('load', () => {
    cleanup();
    // iframe 就绪后启动演示（默认 paused），并交由 play 观察器按可见性 play/pause
    try { f.contentWindow.postMessage({ wcMini: 'play' }, '*'); } catch (e) {}
    _getPlayObserver().observe(el);
  }, { once: true });
  // 兜底：极端环境 load 未触发时，避免骨架常驻
  setTimeout(cleanup, 800);
  mountMini(f, t);
}

export function renderMiniPreviews(root = document) {
  const observer = _getMiniObserver();
  root.querySelectorAll('[data-mini]').forEach(el => {
    observer.observe(el);
  });
}

// 清理：销毁 observer（页面切换时调用可减少内存占用）
export function destroyMiniPreviews() {
  if (_miniObserver) {
    _miniObserver.disconnect();
    _miniObserver = null;
  }
  if (_playObserver) {
    _playObserver.disconnect();
    _playObserver = null;
  }
  _miniPending = [];
  _miniScheduled = false;
  _miniCache.clear();
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
  if (!_shortcutsBound) { bindGlobalShortcuts(); _shortcutsBound = true; }
}

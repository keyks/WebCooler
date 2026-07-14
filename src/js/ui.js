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
      <p class="mt-4 text-xs">© 2026 WebCooler — 使用 CodeBuddy SDK 与 codebuddy-chat-web 构建</p>
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
      <span class="text-slate-300 dark:text-slate-600 text-xs absolute z-10">预览</span>
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
// 静态内容缓存：相同模板 ID + staticMode 复用已构建的 HTML，避免重复 doc.write
const _miniCache = new Map(); // key: `${id}::${staticMode}` → htmlString
function _miniCacheKey(id, staticMode) { return `${id}::${staticMode}`; }

// 在 mini 预览框内渲染真实效果。
// static=true：仅注入 html+css，保持静态（鼠标脱离卡片的状态）
// static=false：注入 html+css/js + 自动演示脚本，实时播放点击/键盘/鼠标动画
function mountMini(f, t, staticMode) {
  const key = _miniCacheKey(t.id, staticMode);
  let cached = _miniCache.get(key);
  if (cached) {
    // 直接复用缓存 HTML —— 对 doc.open/write/close 是最耗性能的操作
    const doc = f.contentDocument;
    if (doc && doc.body) {
      doc.open();
      doc.write(cached);
      doc.close();
      return;
    }
  }

  const doc = f.contentDocument;
  const baseCss = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden}
  body{display:flex;align-items:center;justify-content:center;padding:6px}
  #wc-fit{transform-origin:center center;transition:transform .2s}</style>
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
    var _stop=false, _rafId=null;
    window.__wcMiniStop__=function(){_stop=true;if(_rafId)cancelAnimationFrame(_rafId);};
    window.__wcMiniStart__=function(){_stop=false;loop();};
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const sp=ms=>{const k=window.__wcMiniSpeed__||1;return Math.max(20,ms/k);};
    async function play(){
      if(_stop)return;
      const fields=[...document.querySelectorAll('input,textarea')];
      const area=document.querySelector('.area,.track,.glow,.smoke,.fire');
      if(fields.length){const f0=fields[0];if(f0.blur)f0.blur();f0.readOnly=true;['Hi','Web','Cool','123'].forEach(function(v){f0.value=v;f0.dispatchEvent(new Event('input',{bubbles:true}));});if(f0.blur)f0.blur();return;}
      if(area){const r=area.getBoundingClientRect();for(var i=0;i<8;i++){area.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width*(0.2+0.6*Math.random()),clientY:r.top+r.height*(0.2+0.6*Math.random()),bubbles:true}));}return;}
      const els=[...document.querySelectorAll('button,.b,.box,.card,.ring,.star,.rp,.glow,.item,.nav,.tip,.cell,.wrap,li,a,div')].filter(function(e){return e.offsetWidth>0;});
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

  // 缓存静态内容（动态内容不缓存，因为每次可能需要不同状态）
  if (staticMode) {
    _miniCache.set(key, html);
    // 限制缓存大小：最多 60 个条目
    if (_miniCache.size > 60) {
      const first = _miniCache.keys().next().value;
      _miniCache.delete(first);
    }
  }

  doc.open();
  doc.write(html);
  doc.close();
}

// ── Mini 预览懒加载 + 可视区域感知 ──
let _miniObserver = null;
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
  }, { rootMargin: '200px' }); // 提前 200px 开始加载
  return _miniObserver;
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
  f.style.cssText = 'width:100%;height:100%;border:0;pointer-events:none';
  f.setAttribute('tabindex', '-1');
  f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  f.setAttribute('loading', 'lazy');
  f.setAttribute('title', t.title || '');
  el.innerHTML = '';
  el.appendChild(f);
  mountMini(f, t, true);

  const card = el.closest('[data-card]');
  if (card) {
    // 使用 once 避免重复绑定
    card.addEventListener('mouseenter', () => {
      mountMini(f, t, false);
      try { f.blur(); } catch (_) {}
      window.focus();
    }, { once: false });
    card.addEventListener('mouseleave', () => {
      mountMini(f, t, true);
    }, { once: false });
  }
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
    document.querySelectorAll('[data-theme-icon]').forEach(()=>{});
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

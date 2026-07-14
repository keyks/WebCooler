import { CATEGORIES } from './data/categories.js';
import { initTheme, toggleTheme } from './utils/theme.js';
import { store } from './utils/storage.js';

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
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="index.html" class="flex items-center gap-2 font-extrabold text-lg">
        <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-white grid place-items-center">W</span>
        <span class="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">WebCooler</span>
      </a>
      <nav class="hidden md:flex items-center gap-1">
        ${links.map(l => `<a href="${l.href}" class="px-3 py-2 rounded-lg text-sm font-medium ${active===l.id?'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">${l.label}</a>`).join('')}
      </nav>
      <div class="flex items-center gap-2">
        <a href="workbench.html" class="relative text-sm px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">⭐ ${favCount}</a>
        <button id="theme-toggle" class="w-9 h-9 grid place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-lg">${dark ? '☀️' : '🌙'}</button>
      </div>
    </div>
    <div class="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex gap-1 overflow-x-auto">
      ${links.map(l => `<a href="${l.href}" class="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${active===l.id?'bg-brand-50 dark:bg-slate-800 text-brand-600':'text-slate-600 dark:text-slate-300'}">${l.label}</a>`).join('')}
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
  <a href="detail.html?${params.toString()}" class="group wc-card p-4 block hover:-translate-y-1" data-card="${t.id}">
    <div class="preview-frame h-52 mb-3 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800 relative" data-mini="${t.id}">
      <span class="text-slate-300 dark:text-slate-600 text-xs absolute">预览</span>
      <span class="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-200 font-mono opacity-0 group-hover:opacity-100 transition">${t.id}.html</span>
    </div>
    <div class="flex items-start justify-between gap-2">
      <h3 class="font-semibold text-sm line-clamp-1">${t.title}</h3>
      ${fav ? '<span class="text-amber-500">★</span>' : ''}
    </div>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">${t.desc || t.tags.join(' · ')}</p>
    <div class="flex flex-wrap gap-1 mt-2">
      ${t.tags.slice(0,3).map(tg => `<span class="text-[10px] px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${tg}</span>`).join('')}
    </div>
  </a>`;
}

// 在 mini 预览框内渲染真实效果。
// static=true：仅注入 html+css，保持静态（鼠标脱离卡片的状态）
// static=false：注入 html+css/js + 自动演示脚本，实时播放点击/键盘/鼠标动画
function mountMini(f, t, staticMode) {
  const doc = f.contentDocument;
  const baseCss = `<style>*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden}
  body{display:flex;align-items:center;justify-content:center;padding:6px}
  #wc-fit{transform-origin:center center;transition:transform .2s}</style>
  <style>${t.css||''}</style>`;
  // 自适应缩放脚本：内容超出容器时整体缩小，保证完整显示
  const fit = `<script>
  (function(){
    function fit(){
      var w=document.getElementById('wc-fit');if(!w)return;
      w.style.transform='none';
      var vw=document.documentElement.clientWidth-12, vh=document.documentElement.clientHeight-12;
      var cw=w.scrollWidth, ch=w.scrollHeight;
      if(!cw||!ch)return;
      var s=Math.min(1, vw/cw, vh/ch);
      if(s<1) w.style.transform='scale('+s+')';
    }
    window.addEventListener('load',fit);
    setTimeout(fit,60);setTimeout(fit,300);
    window.addEventListener('resize',fit);
  })();
  <\/script>`;
  const demo = staticMode ? '' : `<script>
  (function(){
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    const sp=ms=>{const k=window.__wcMiniSpeed__||1;return Math.max(20,ms/k);};
    async function play(){
      const fields=[...document.querySelectorAll('input,textarea')];
      const area=document.querySelector('.area,.track,.glow,.smoke,.fire');
      if(fields.length){const f0=fields[0];f0.blur&&f0.blur();f0.readOnly=true;['Hi','Web','Cool','123'].forEach(v=>{f0.value=v;f0.dispatchEvent(new Event('input',{bubbles:true}))});f0.blur&&f0.blur();return;}
      if(area){const r=area.getBoundingClientRect();for(let i=0;i<8;i++){area.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width*(0.2+0.6*Math.random()),clientY:r.top+r.height*(0.2+0.6*Math.random()),bubbles:true}));}return;}
      const els=[...document.querySelectorAll('button,.b,.box,.card,.ring,.star,.rp,.glow,.item,.nav,.tip,.cell,.wrap,li,a,div')].filter(e=>e.offsetWidth>0);
      if(els.length){const e=els[Math.floor(Math.random()*els.length)];e.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    }
    (async()=>{while(true){try{await play()}catch(e){}await sleep(sp(1300));}})();
  })();
  <\/script>`;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8">${baseCss}</head><body><div id="wc-fit">${t.html||''}</div>${staticMode?'':`<script>${t.js||''}<\/script>`}${demo}${fit}</body></html>`);
  doc.close();
}

export function renderMiniPreviews(root = document) {
  root.querySelectorAll('[data-mini]').forEach(el => {
    const t = window.__WC_TEMPLATES__?.find(x => x.id === el.dataset.mini);
    if (!t) return;
    const f = document.createElement('iframe');
    // 关键：预览 iframe 始终不接收鼠标事件，让点击穿透到卡片的 <a> 链接，保证卡片可正常跳转
    f.style.cssText = 'width:100%;height:100%;border:0;pointer-events:none';
    f.setAttribute('tabindex', '-1'); // 防止 iframe 成为键盘/滚动焦点目标
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    el.innerHTML = '';
    el.appendChild(f);
    mountMini(f, t, true); // 默认静态

    const card = el.closest('[data-card]');
    if (card) {
      card.addEventListener('mouseenter', () => {
        mountMini(f, t, false); // 悬停卡片：开始动画（自动演示，无需 iframe 接收鼠标）
        // 兜底：确保焦点始终停留在外层页面，避免焦点意外进入预览 iframe 导致页面乱滚动
        try { f.blur(); } catch (_) {}
        window.focus();
      });
      card.addEventListener('mouseleave', () => {
        mountMini(f, t, true); // 脱离卡片：恢复静态（动画停止）
      });
    }
  });
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

export function initAppShell(active) {
  initTheme();
  document.body.insertAdjacentHTML('afterbegin', renderNav(active));
  document.body.insertAdjacentHTML('beforeend', renderFooter());
  bindThemeToggle();
}

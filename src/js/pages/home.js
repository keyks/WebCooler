import { initAppShell, templateCard, renderMiniPreviews } from '../ui.js';
import { TEMPLATES, getById, FEATURED, HOT } from '../data/index.js';
import { CATEGORIES } from '../data/categories.js';

window.__WC_TEMPLATES__ = TEMPLATES;

initAppShell('');

const app = document.getElementById('app');

const hero = `
<section class="relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent"></div>
  <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
    <span class="inline-block px-3 py-1 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300 text-xs font-medium mb-4" data-reveal>免费商用 · 无版权 · 100% 覆盖</span>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4" data-reveal>
      万能 <span class="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">Web 前端</span><br>模板与交互效果库
    </h1>
    <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8" data-reveal>最全、最新、可直接复制、可在线预览、可一键下载的布局 / 动态效果 / 鼠标 & 键盘交互 / 文本美化 / 组件库一站式平台。共 <b class="text-brand-600 dark:text-brand-300">${TEMPLATES.length}</b> 个真实可运行模板。</p>
    <div class="flex flex-wrap justify-center gap-3 mb-8" data-reveal>
      <a href="categories.html" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/40 active:scale-95">浏览全部模板</a>
    </div>
    <div class="max-w-xl mx-auto relative" data-reveal>
      <input id="hero-search" placeholder="搜索任何效果，如：淡入、3D、打字机…" class="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm" />
      <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">Ctrl+K</kbd>
    </div>
  </div>
</section>`;

// 预计算各分类模板数（单次遍历），避免在模板字面量里对每个分类都 filter 一次全量数组
const catCounts = {};
TEMPLATES.forEach(t => { if (t.cat) catCounts[t.cat] = (catCounts[t.cat] || 0) + 1; });
const catSection = `
<section class="max-w-7xl mx-auto px-4 mb-16">
  <h2 class="text-2xl font-bold mb-6">分类导航</h2>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    ${CATEGORIES.map(c => {
      const count = catCounts[c.id] || 0;
      return `<a href="categories.html?cat=${c.id}" class="wc-card p-5 hover:-translate-y-1 group">
        <div class="text-3xl mb-2">${c.icon}</div>
        <h3 class="font-semibold">${c.name}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${count} 个模板</p>
      </a>`;
    }).join('')}
  </div>
</section>`;

const featured = `
<section class="max-w-7xl mx-auto px-4 mb-16">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold">⭐ 推荐模板</h2>
    <a href="categories.html" class="text-sm text-brand-600 dark:text-brand-300">查看全部 →</a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${FEATURED.map(id => getById(id)).filter(Boolean).map(t => templateCard(t, { from: 'home' })).join('')}
  </div>
</section>`;

const hot = `
<section class="max-w-7xl mx-auto px-4 mb-16">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold">🔥 热门效果</h2>
    <a href="categories.html?sort=hot" class="text-sm text-brand-600 dark:text-brand-300">更多 →</a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${HOT.map(id => getById(id)).filter(Boolean).map(t => templateCard(t, { from: 'home' })).join('')}
  </div>
</section>`;

app.innerHTML = hero + catSection + featured + hot;

// ── 滚动入场动画（IntersectionObserver） ──
// 尊重「减少动态效果」系统偏好：开启时直接显示最终态、跳过位移动画，避免眩晕。
const revealEls = app.querySelectorAll('[data-reveal]');
const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduce) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
}

// 3D 卡片悬停倾斜已由 ui.js 的 bindCardTilt() 全局委托统一处理（覆盖所有页面），
// 此处不再逐卡绑定，避免重复实现与潜在冲突。
renderMiniPreviews();

const search = document.getElementById('hero-search');
search.addEventListener('keydown', e => {
  if (e.key === 'Enter' && search.value.trim()) {
    location.href = 'categories.html?q=' + encodeURIComponent(search.value.trim());
  }
});

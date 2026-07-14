import { initAppShell, templateCard, renderMiniPreviews } from '../ui.js';
import { TEMPLATES, getByCat, search } from '../data/index.js';
import { CATEGORIES } from '../data/categories.js';

window.__WC_TEMPLATES__ = TEMPLATES;
initAppShell('category');

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
let curCat = params.get('cat') || '';
let curQ = params.get('q') || '';

app.innerHTML = `
<section class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold">模板库</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1" id="count"></p>
    </div>
    <input id="search" value="${curQ}" placeholder="搜索效果…" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-72" />
  </div>

  <div class="flex flex-wrap gap-2 mb-6" id="cats">
    <button data-c="" class="cat px-3 py-1.5 rounded-lg text-sm ${!curCat?'bg-brand-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}">全部</button>
    ${CATEGORIES.map(c => `<button data-c="${c.id}" class="cat px-3 py-1.5 rounded-lg text-sm ${curCat===c.id?'bg-brand-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}">${c.icon} ${c.name}</button>`).join('')}
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="grid"></div>
  <div id="empty" class="text-center text-slate-400 py-20 hidden">未找到匹配的模板</div>
</section>`;

const grid = document.getElementById('grid');
const countEl = document.getElementById('count');
const emptyEl = document.getElementById('empty');

function render() {
  let list = curCat ? getByCat(curCat) : TEMPLATES.slice();
  if (curQ) list = search(curQ);
  countEl.textContent = `共 ${list.length} 个模板`;
  if (!list.length) {
    grid.innerHTML = ''; emptyEl.classList.remove('hidden'); return;
  }
  emptyEl.classList.add('hidden');
  // 返回时携带当前分类/搜索筛选，确保回到原来的筛选结果
  const backUrl = 'categories.html' + (location.search ? location.search : '');
  grid.innerHTML = list.map(t => templateCard(t, { from: 'category', back: backUrl })).join('');
  renderMiniPreviews();
}

document.getElementById('cats').addEventListener('click', e => {
  const b = e.target.closest('.cat');
  if (!b) return;
  curCat = b.dataset.c;
  document.querySelectorAll('.cat').forEach(x => {
    const on = x.dataset.c === curCat;
    x.className = 'cat px-3 py-1.5 rounded-lg text-sm ' + (on ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700');
  });
  render();
});

document.getElementById('search').addEventListener('input', e => {
  curQ = e.target.value.trim();
  render();
});

render();

import { initAppShell, templateCard, renderMiniPreviews, toast } from '../ui.js';
import { getById, TEMPLATES } from '../data/index.js';
import { store } from '../utils/storage.js';

window.__WC_TEMPLATES__ = TEMPLATES;
initAppShell('workbench');

const app = document.getElementById('app');
const s = store.get();
const favs = (s.favs || []).map(getById).filter(Boolean);
const history = (s.history || []).map(getById).filter(Boolean);
const shares = (s.shares || []);

function section(title, list, empty) {
  if (!list.length) return `<div class="mb-10"><h2 class="text-xl font-bold mb-4">${title}</h2><p class="text-slate-400 text-sm">${empty}</p></div>`;
  return `<div class="mb-10"><h2 class="text-xl font-bold mb-4">${title} <span class="text-sm font-normal text-slate-400">(${list.length})</span></h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${list.map(t => templateCard(t, { fav: true, from: 'workbench' })).join('')}</div></div>`;
}

/* ---------- 新建共享：布局 / 元素设计卡片 ---------- */
function shareCard(p) {
  const typeLabel = p.type === 'element' ? '🌟 共享元素' : '🧩 共享布局';
  return `
  <div class="wc-card p-4">
    <div class="flex items-start justify-between gap-2 mb-2">
      <span class="text-[11px] px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${typeLabel}</span>
      <button data-del="${p.id}" class="text-xs text-slate-400 hover:text-red-500" title="删除">✕</button>
    </div>
    <h3 class="font-semibold text-sm">${p.name}</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${p.desc || '（无描述）'}</p>
    ${p.preview ? `<div class="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" style="height:96px">${p.preview}</div>` : ''}
    <div class="flex gap-2 mt-3">
      <button data-use="${p.id}" class="flex-1 text-xs px-2 py-1.5 rounded bg-brand-600 text-white">使用</button>
      <button data-copy="${p.id}" class="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700">复制代码</button>
    </div>
  </div>`;
}

function newShareForm() {
  return `
  <div class="wc-card p-5 border-dashed border-2 border-brand-200 dark:border-slate-700">
    <h3 class="font-semibold mb-3">➕ 新建共享卡片</h3>
    <div class="grid sm:grid-cols-2 gap-3 mb-3">
      <input id="ns-name" placeholder="卡片名称，如：首页 Hero 布局" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      <select id="ns-type" class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
        <option value="layout">🧩 共享布局</option>
        <option value="element">🌟 共享元素</option>
      </select>
    </div>
    <textarea id="ns-desc" placeholder="一句话描述它的用途（可选）" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3" rows="2"></textarea>
    <textarea id="ns-code" placeholder="粘贴你的 HTML / 布局片段 / 元素代码…" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 mb-3" rows="4"></textarea>
    <button id="ns-add" class="px-4 py-2 rounded-lg text-sm bg-brand-600 text-white">保存到我的共享</button>
  </div>`;
}

function sharesSection() {
  const grid = shares.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">${shares.map(shareCard).join('')}</div>`
    : `<p class="text-slate-400 text-sm mb-6">还没有共享卡片，先在下方新建一个吧。</p>`;
  return `
  <div class="mb-12">
    <h2 class="text-xl font-bold mb-4">📦 我的共享卡片</h2>
    ${grid}
    ${newShareForm()}
  </div>`;
}

app.innerHTML = `
<section class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-6">我的工作台</h1>
  ${section('⭐ 我的收藏', favs, '还没有收藏，去模板详情页点击收藏吧。')}
  ${section('🕘 浏览历史', history, '暂无浏览记录。')}
  ${sharesSection()}
</section>`;

renderMiniPreviews();

/* ---------- 共享卡片交互 ---------- */
function escapeHtml(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt')}

function refreshShares() {
  const data = store.get();
  shares.length = 0;
  (data.shares || []).forEach(x => shares.push(x));
  const target = document.querySelector('#app .mb-12');
  if (target) {
    const tmp = document.createElement('div');
    tmp.innerHTML = sharesSection();
    target.replaceWith(tmp.firstElementChild);
    bindShareEvents();
  }
}

function bindShareEvents() {
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const id = b.dataset.del;
    const data = store.get();
    data.shares = (data.shares || []).filter(x => x.id !== id);
    store.set({ shares: data.shares });
    refreshShares();
  });
  document.querySelectorAll('[data-use]').forEach(b => b.onclick = () => {
    const p = shares.find(x => x.id === b.dataset.use);
    if (!p) return;
    navigator.clipboard?.writeText(p.code || '').catch(()=>{});
    toast('已复制「' + p.name + '」到剪贴板', 'success');
  });
  document.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => {
    const p = shares.find(x => x.id === b.dataset.copy);
    if (!p) return;
    navigator.clipboard?.writeText(p.code || '').catch(()=>{});
    toast('代码已复制', 'success');
  });
  // 为 3D 卡片绑定鼠标跟踪
  document.querySelectorAll('[data-card-3d]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -8, ry = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

document.getElementById('ns-add').onclick = () => {
  const name = document.getElementById('ns-name').value.trim();
  const type = document.getElementById('ns-type').value;
  const desc = document.getElementById('ns-desc').value.trim();
  const code = document.getElementById('ns-code').value;
  if (!name) return toast('请填写卡片名称', 'error');
  if (!code.trim()) return toast('请粘贴你的布局 / 元素代码', 'error');
  const data = store.get();
  data.shares = data.shares || [];
  data.shares.unshift({
    id: 's' + Date.now(),
    name, type, desc,
    code,
    preview: '',
    at: Date.now()
  });
  store.set({ shares: data.shares });
  refreshShares();
  toast('共享卡片已保存', 'success');
};

bindShareEvents();

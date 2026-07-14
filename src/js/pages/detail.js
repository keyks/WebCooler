import { initAppShell } from '../ui.js';
import { getById } from '../data/index.js';
import { highlight } from '../utils/highlight.js';
import { renderPreview, copyText, applyParams, extractParams, setDemoSpeed, buildCode } from '../utils/preview.js';
import { store } from '../utils/storage.js';

const qs0 = new URLSearchParams(location.search);
const back0 = qs0.get('back');
const from0 = qs0.get('from');
// 顶部导航高亮：根据来源精确对应（不传空串，否则会高亮「首页」）
let navActive = 'category';
if (back0 && /(^|\/)index\.html/.test(back0)) navActive = '';
else if (/categories\.html/.test(back0 || '')) navActive = 'category';
else if (/workbench\.html/.test(back0 || '')) navActive = 'workbench';
else if (/downloads\.html/.test(back0 || '')) navActive = 'downloads';
else if (from0 === 'home') navActive = '';
else if (from0 === 'workbench' || from0 === 'fav') navActive = 'workbench';

initAppShell(navActive);
const app = document.getElementById('app');
const id = new URLSearchParams(location.search).get('id');
const t = getById(id);

if (!t) {
  app.innerHTML = '<div class="max-w-3xl mx-auto px-4 py-20 text-center"><h1 class="text-2xl font-bold mb-4">模板未找到</h1><a href="categories.html" class="text-brand-600">返回模板库</a></div>';
} else {
  // 计算「返回」目标：
  // 1) 优先用卡片链接携带的 back 参数（完整返回 URL，最准确，含分类/搜索筛选）
  // 2) 否则用 from 参数推断默认来源页
  // 不再依赖 referrer / sessionStorage（跨页共享且会污染，导致返回错页）
  //
  // 安全：back/from 均为用户可控的 URL 参数，必须校验为「站内白名单页面」，
  // 否则存在开放重定向风险（如 back=https://evil.com）。
  const SAFE_PAGES = ['index.html', 'categories.html', 'workbench.html', 'downloads.html'];
  const isSafeBack = raw => {
    if (!raw) return false;
    // 拒绝协议相对(//)、任何绝对协议(http/https/data:/javascript:/mailto: 等)
    if (raw.startsWith('//') || raw.includes('://')) return false;
    const path = raw.replace(/^\/+/, ''); // 允许 /index.html
    return SAFE_PAGES.some(p => path === p || path.startsWith(p + '?'));
  };

  const back = back0;
  const from = from0;
  let backHref;
  if (back && isSafeBack(back)) {
    backHref = back;
  } else {
    switch (from) {
      case 'home':
        backHref = 'index.html';
        break;
      case 'workbench':
      case 'fav':
        backHref = 'workbench.html';
        break;
      default:
        backHref = t.cat ? `categories.html?cat=${t.cat}` : 'categories.html';
    }
  }
  store.addHistory(t.id);
  const isFav = store.isFav(t.id);
  const params = extractParams(t.css);
  const c1 = params.colors[0] || '#2f83ff';
  const c2 = params.colors[1] || '#8b5cf6';

  app.innerHTML = `
  <section class="max-w-6xl mx-auto px-4 py-8">
    <button type="button" id="wc-back" class="text-sm text-slate-500 hover:text-brand-600 cursor-pointer bg-transparent border-0 p-0">← 返回</button>
    <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
      <div>
        <h1 class="text-2xl font-bold">${t.title}</h1>
        <div class="flex flex-wrap gap-1.5 mt-2">${t.tags.map(tg=>`<span class="text-xs px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${tg}</span>`).join('')}</div>
      </div>
      <div class="flex gap-2">
        <button id="fav" class="px-4 py-2 rounded-lg text-sm border ${isFav?'border-amber-400 text-amber-500':'border-slate-200 dark:border-slate-700'}">${isFav?'★ 已收藏':'☆ 收藏'}</button>
        <button id="copy-all" class="px-4 py-2 rounded-lg text-sm bg-brand-600 text-white">复制全部代码</button>
        <button id="download" class="px-4 py-2 rounded-lg text-sm bg-slate-800 dark:bg-slate-700 text-white">下载</button>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      <div>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400">实时预览（自动演示 · 可直接交互）</h2>
          <label class="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" id="auto-demo" checked class="accent-brand-600"> 自动播放
          </label>
        </div>
        <div class="preview-frame h-[58vw] max-h-[440px] sm:h-[420px]" id="preview"></div>
        <p class="text-xs text-slate-400 mt-2">提示：直接编辑下方代码后按 <b>回车键</b> 即可应用并静态显示效果（不再自动循环）；在预览区内移动鼠标 / 点击可手动触发交互。</p>
      </div>
      <div class="space-y-4">
        <div class="control-panel">
          <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">🎛 实时参数控制</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="text-xs text-slate-600 dark:text-slate-300">布局大小 <span id="v-size">100%</span>
              <input type="range" id="p-size" min="0.5" max="1.6" step="0.02" value="1" class="wc-range w-full mt-1">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">水平位置 <span id="v-x">0px</span>
              <input type="range" id="p-x" min="-60" max="60" step="1" value="0" class="wc-range w-full mt-1">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">垂直位置 <span id="v-y">0px</span>
              <input type="range" id="p-y" min="-60" max="60" step="1" value="0" class="wc-range w-full mt-1">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">圆角 <span id="v-radius">12px</span>
              <input type="range" id="p-radius" min="0" max="40" step="1" value="12" class="wc-range w-full mt-1">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">动画速度 <span id="v-speed">1.0×（数值越小越慢）</span>
              <input type="range" id="p-speed" min="0.2" max="3" step="0.1" value="1" class="wc-range w-full mt-1">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">主元素颜色
              <input type="color" id="p-c1" value="${c1}" class="wc-color w-full mt-1 h-8">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">辅助颜色
              <input type="color" id="p-c2" value="${c2}" class="wc-color w-full mt-1 h-8">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">背景颜色
              <input type="color" id="p-bg" value="#ffffff" class="wc-color w-full mt-1 h-8">
            </label>
            <div class="flex items-end">
              <button id="p-reset" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600">重置参数</button>
            </div>
          </div>
        </div>
        ${t.html ? codeBlock('HTML', t.html, 'html', 'code-html') : ''}
        ${t.css ? codeBlock('CSS', t.css, 'css', 'code-css') : ''}
        ${t.js ? codeBlock('JavaScript', t.js, 'js', 'code-js') : ''}
      </div>
    </div>
  </section>`;

  // 返回按钮：跳回进入详情页前的来源页（由卡片链接的 from/back 参数精确决定）
  const backBtn = document.getElementById('wc-back');
  if (backBtn) backBtn.onclick = e => {
    e.preventDefault();
    const q = new URLSearchParams(location.search);
    const hasFrom = q.get('from');
    const hasBack = q.get('back');
    // 无 from/back（理论上不会，因卡片都携带）：尝试回退上一页，再兜底分类页
    if (!hasFrom && !hasBack) {
      if (window.history.length > 1) history.back();
      else location.href = t.cat ? `categories.html?cat=${t.cat}` : 'categories.html';
      return;
    }
    // 跳回计算的来源页（backHref 已在上面经过站内白名单校验，仍可二次兜底）
    const SAFE = ['index.html', 'categories.html', 'workbench.html', 'downloads.html'];
    const ok = SAFE.some(p => backHref === p || backHref.startsWith(p + '?'));
    location.href = ok ? backHref : (t.cat ? `categories.html?cat=${t.cat}` : 'categories.html');
  };

  const previewEl = document.getElementById('preview');
  let iframe = renderPreview(previewEl, t, { autoDemo: true });

  // 自动播放开关
  document.getElementById('auto-demo').addEventListener('change', e => {
    const on = e.target.checked;
    try {
      const doc = iframe.contentDocument;
      if (doc && doc.defaultView) {
        doc.defaultView.__wcDemoStop__ = !on;
      }
    } catch (_) {}
    // 重新渲染以干净启停，并保留当前速度
    const speed = parseFloat(document.getElementById('p-speed').value) || 1;
    iframe = renderPreview(previewEl, t, { autoDemo: on, speed });
  });

  // 控制面板：实时改变预览
  const state = { size: 1, x: 0, y: 0, radius: 12, c1, c2, bg: '', speed: 1 };

  // 参数变动后，把最新代码写回展示区（所见即所得，方便复制）
  function updateCode() {
    const code = buildCode(t, state);
    const refresh = (cid, lang, snippet) => {
      const box = document.getElementById(cid);
      if (!box) return;
      box.querySelector('pre').innerHTML = highlight(snippet, lang);
    };
    if (t.html) refresh('code-html', 'html', code.html);
    if (t.css) refresh('code-css', 'css', code.css);
    if (t.js) refresh('code-js', 'js', code.js);
  }

  const bind = (pid, key, fmt, transform = v => v) => {
    const el = document.getElementById(pid);
    const out = document.getElementById('v-' + key.replace('p-', ''));
    el.addEventListener('input', () => {
      const v = transform(el.value);
      state[key] = v;
      if (out) out.textContent = fmt(v);
      applyParams(iframe, state);
      updateCode();
    });
  };
  bind('p-size', 'size', v => Math.round(v*100)+'%', v => parseFloat(v));
  bind('p-x', 'x', v => v+'px', v => parseInt(v,10));
  bind('p-y', 'y', v => v+'px', v => parseInt(v,10));
  bind('p-radius', 'radius', v => v+'px', v => parseInt(v,10));
  bind('p-c1', 'c1', v => v);
  bind('p-c2', 'c2', v => v);
  bind('p-bg', 'bg', v => v);
  // 演示速度（数值越小越慢，越大越快；范围 0.2~3）
  document.getElementById('p-speed').addEventListener('input', e => {
    const s = parseFloat(e.target.value) || 1;
    state.speed = s;
    document.getElementById('v-speed').textContent = s.toFixed(1) + '×';
    setDemoSpeed(iframe, s);
    updateCode();
  });
  document.getElementById('p-reset').addEventListener('click', () => {
    state.size=1; state.x=0; state.y=0; state.radius=12; state.c1=c1; state.c2=c2; state.bg=''; state.speed=1;
    ['p-size','p-x','p-y','p-radius'].forEach(id=>document.getElementById(id).value = id==='p-radius'?12:(id==='p-size'?1:0));
    document.getElementById('p-c1').value=c1;
    document.getElementById('p-c2').value=c2;
    document.getElementById('p-bg').value='#ffffff';
    document.getElementById('p-speed').value=1;
    document.getElementById('v-speed').textContent='1.0×';
    setDemoSpeed(iframe, 1);
    ['v-size','v-x','v-y','v-radius'].forEach((id,i)=>document.getElementById(id).textContent=['100%','0px','0px','12px'][i]);
    applyParams(iframe, state);
    updateCode();
  });

  // 编辑代码后按回车：用当前代码重新渲染并静态定格（停止自动演示）
  function currentCode() {
    const read = sel => { const p = document.querySelector(sel); return p ? p.innerText : ''; };
    return {
      html: t.html ? read('#code-html pre') : '',
      css: t.css ? read('#code-css pre') : '',
      js: t.js ? read('#code-js pre') : '',
      cat: t.cat, id: t.id
    };
  }
  function applyEditedCode() {
    const code = currentCode();
    // 关闭自动播放并静态渲染
    const chk = document.getElementById('auto-demo');
    if (chk) chk.checked = false;
    iframe = renderPreview(previewEl, code, { autoDemo: false });
    // 保留当前参数覆盖（大小/位置/颜色等）
    applyParams(iframe, state);
  }
  document.querySelectorAll('.wc-editable').forEach(pre => {
    pre.addEventListener('keydown', e => {
      // 回车应用；Shift+Enter 保留换行编辑
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        applyEditedCode();
        pre.blur();
      }
    });
  });

  // 复制按钮：读取当前（可编辑）代码块的纯文本
  document.querySelectorAll('.copy-inline').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.group').querySelector('pre');
      const text = pre ? pre.innerText : '';
      await copyText(text);
      const old = btn.textContent; btn.textContent = '已复制!';
      setTimeout(() => btn.textContent = old, 1200);
    });
  });

  document.getElementById('copy-all').addEventListener('click', async () => {
    const parts = [];
    if (t.html) parts.push(`<!-- HTML -->\n${document.querySelector('#code-html pre').innerText}`);
    if (t.css) parts.push(`/* CSS */\n${document.querySelector('#code-css pre').innerText}`);
    if (t.js) parts.push(`/* JS */\n${document.querySelector('#code-js pre').innerText}`);
    await copyText(parts.join('\n\n'));
    const b = document.getElementById('copy-all'); b.textContent = '已复制全部!';
    setTimeout(() => b.textContent = '复制全部代码', 1200);
  });

  document.getElementById('download').addEventListener('click', () => {
    const html = `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>${t.css}</style></head>\n<body>\n${t.html}\n<script>${t.js}<\/script>\n</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${t.id}.html`;
    a.click();
  });

  const favBtn = document.getElementById('fav');
  favBtn.addEventListener('click', () => {
    const favs = store.toggleFav(t.id);
    const on = favs.includes(t.id);
    favBtn.textContent = on ? '★ 已收藏' : '☆ 收藏';
    favBtn.className = 'px-4 py-2 rounded-lg text-sm border ' + (on ? 'border-amber-400 text-amber-500' : 'border-slate-200 dark:border-slate-700');
  });
}

function codeBlock(label, code, lang, cid) {
  return `
  <div class="relative group" id="${cid}">
    <div class="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-t-lg">
      <span class="font-mono">${label} <span class="text-slate-400">· 可直接编辑</span></span>
      <button class="copy-inline text-slate-300 hover:text-white" data-lang="${lang}">复制</button>
    </div>
    <div class="code-block rounded-b-lg"><pre class="wc-editable" contenteditable="true" spellcheck="false" data-lang="${lang}">${highlight(code, lang)}</pre></div>
  </div>`;
}

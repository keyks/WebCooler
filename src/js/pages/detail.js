import { initAppShell, toast } from '../ui.js';
import { getById } from '../data/index.js';
import { highlight } from '../utils/highlight.js';
import { renderPreview, copyText, applyParams, applyControl, extractParams, setDemoSpeed, buildCode } from '../utils/preview.js';
import { inferControls, controlToPatch } from '../utils/controls.js';
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
  const c1 = params.c1 || '#2f83ff';
  const c2 = params.c2 || '#8b5cf6';

  // 该模板的「专属控制项」（逐个推断，贴合自身特点）
  const controls = inferControls(t);
  // 专属控制项当前值
  const ctrlValues = {};
  controls.forEach(c => { ctrlValues[c.key] = c.value; });

  // 渲染单个专属控制项为一段表单 HTML
  function renderControl(c) {
    const cid = 'wcc-' + c.key;
    if (c.type === 'toggle') {
      return `<label class="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2 col-span-1 sm:col-span-2">
        <span>✨ ${c.label}</span>
        <input type="checkbox" id="${cid}" data-key="${c.key}" ${c.value ? 'checked' : ''} class="accent-brand-600 w-4 h-4">
      </label>`;
    }
    return `<label class="text-xs text-slate-600 dark:text-slate-300">✨ ${c.label} <span id="v-${cid}">${c.value}${c.unit || ''}</span>
      <input type="range" id="${cid}" data-key="${c.key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}" class="wc-range w-full mt-1">
    </label>`;
  }
  const controlsHtml = controls.length ? `
    <div class="control-panel mt-4">
      <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">🎚 该模板专属参数</h2>
      <p class="text-[11px] text-slate-400 mb-3">根据本卡片特点定制，拖动即可实时调节；代码框会同步写入带注释的可改动数值。</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        ${controls.map(renderControl).join('')}
      </div>
    </div>` : '';

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
          <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400">实时预览（可直接交互）</h2>
          <label class="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
            <input type="checkbox" id="auto-demo" class="accent-brand-600"> 自动播放
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
            <label class="text-xs text-slate-600 dark:text-slate-300">圆角 <span id="v-radius">默认</span>
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
        ${controlsHtml}
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
  // 预览就绪标记：运行时(iframe)通过 wc-ready 通知父页面已可接收参数/控制项。
  // 用握手代替固定延时，彻底消除「拖动滑块偶发无反应 / 初始值未应用」的竞态。
  let _previewReady = false;

  // 统一渲染 + 同步当前参数/专属控制项。新 iframe 初始透明，就绪后淡入。
  function syncPreview(template, opts) {
    _previewReady = false;
    iframe = renderPreview(previewEl, template, opts);
    // 兜底：若 200ms 内未收到 wc-ready（极个别环境），仍强制同步一次
    setTimeout(() => {
      if (!_previewReady && iframe) {
        iframe.style.opacity = '1';
        applyParams(iframe, state);
        controls.forEach(c => applyControl(iframe, controlToPatch(c, ctrlValues[c.key])));
      }
    }, 200);
  }

  // 监听 iframe 运行时就绪信号
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === 'wc-ready' && iframe && e.source === iframe.contentWindow) {
      _previewReady = true;
      iframe.style.opacity = '1';
      applyParams(iframe, state);
      controls.forEach(c => applyControl(iframe, controlToPatch(c, ctrlValues[c.key])));
    }
  });

  let iframe;
  syncPreview(t, { autoDemo: false });

  // 自动播放开关
  document.getElementById('auto-demo').addEventListener('change', e => {
    const on = e.target.checked;
    const speed = parseFloat(document.getElementById('p-speed').value) || 1;
    syncPreview(t, { autoDemo: on, speed }); // 重渲染后由 wc-ready 自动恢复参数/控制项
  });

  // ── 控制面板：实时改变预览（含防抖 + 撤销历史） ──
  // radius 默认 null 表示「未调整」——不会给模板元素强加圆角；
  // 仅当用户主动拖动圆角滑块后才变成具体数值并只作用于原本有圆角的元素。
  const state = { size: 1, x: 0, y: 0, radius: null, c1, c2, bg: '', speed: 1, controls, ctrlValues };
  let _undoStack = [];    // 撤销栈
  let _undoIdx = -1;
  const MAX_UNDO = 30;

  function _pushUndo(snapshot) {
    _undoStack = _undoStack.slice(0, _undoIdx + 1);
    // 深拷贝专属控制项值，保证撤销/重做能精确回滚
    _undoStack.push({ ...snapshot, ctrlValues: { ...(snapshot.ctrlValues || {}) } });
    if (_undoStack.length > MAX_UNDO) _undoStack.shift();
    _undoIdx = _undoStack.length - 1;
  }
  function _applyState(s) {
    Object.assign(state, s);
    // 保持 controls/ctrlValues 始终指向原始引用（buildCode 依赖它）
    state.controls = controls;
    state.ctrlValues = ctrlValues;
    // 恢复专属控制项值并同步 UI + 预览
    if (s.ctrlValues) {
      Object.assign(ctrlValues, s.ctrlValues);
      controls.forEach(c => {
        const el = document.getElementById('wcc-' + c.key);
        const v = ctrlValues[c.key];
        if (el) {
          if (c.type === 'toggle') el.checked = !!v;
          else { el.value = v; const out = document.getElementById('v-wcc-' + c.key); if (out) out.textContent = v + (c.unit || ''); }
        }
        applyControl(iframe, controlToPatch(c, v));
      });
    }
    applyParams(iframe, state);
    updateCode();
    // 同步 UI 控件值
    const mapping = { size: 'p-size', x: 'p-x', y: 'p-y', radius: 'p-radius', c1: 'p-c1', c2: 'p-c2', bg: 'p-bg', speed: 'p-speed' };
    Object.entries(mapping).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el && s[k] !== undefined) {
        if (id === 'p-speed') { el.value = s[k]; document.getElementById('v-speed').textContent = s[k].toFixed(1) + '×'; setDemoSpeed(iframe, s[k]); }
        else if (id === 'p-bg') el.value = s[k] || '#ffffff';
        else el.value = s[k];
      }
    });
    ['v-size','v-x','v-y','v-radius'].forEach((vid, i) => {
      const out = document.getElementById(vid);
      if (out) {
        const vals = [Math.round(state.size*100)+'%', state.x+'px', state.y+'px', state.radius==null?'默认':state.radius+'px'];
        out.textContent = vals[i];
      }
    });
  }
  // Ctrl+Z 撤销
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && document.activeElement?.closest('.wc-editable') === null) {
      e.preventDefault();
      if (_undoIdx > 0) { _undoIdx--; _applyState(_undoStack[_undoIdx]); toast('已撤销', 'info'); }
    }
    // Ctrl+Shift+Z 重做
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      if (_undoIdx < _undoStack.length - 1) { _undoIdx++; _applyState(_undoStack[_undoIdx]); toast('已重做', 'info'); }
    }
  });

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

  // ── 防抖绑定：滑块拖拽时减少 applyParams 调用频率 ──
  let _debounceTimer = null;
  function _debouncedApply() {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => {
      applyParams(iframe, state);
      updateCode();
      _pushUndo(state);
    }, 80); // 80ms 防抖
  }

  const bind = (pid, key, fmt, transform = v => v) => {
    const el = document.getElementById(pid);
    const out = document.getElementById('v-' + key.replace('p-', ''));
    el.addEventListener('input', () => {
      const v = transform(el.value);
      state[key] = v;
      if (out) out.textContent = fmt(v);
      _debouncedApply();
    });
    // change 事件（鼠标松开）立即应用，保证响应
    el.addEventListener('change', () => {
      clearTimeout(_debounceTimer);
      applyParams(iframe, state);
      updateCode();
      _pushUndo(state);
    });
  };
  bind('p-size', 'size', v => Math.round(v*100)+'%', v => parseFloat(v));
  bind('p-x', 'x', v => v+'px', v => parseInt(v,10));
  bind('p-y', 'y', v => v+'px', v => parseInt(v,10));
  bind('p-radius', 'radius', v => v+'px', v => parseInt(v,10));
  bind('p-c1', 'c1', v => v);
  bind('p-c2', 'c2', v => v);
  bind('p-bg', 'bg', v => v);
  // 演示速度
  document.getElementById('p-speed').addEventListener('input', e => {
    const s = parseFloat(e.target.value) || 1;
    state.speed = s;
    document.getElementById('v-speed').textContent = s.toFixed(1) + '×';
    _debouncedApply();
    setDemoSpeed(iframe, s);
  });
  document.getElementById('p-speed').addEventListener('change', () => {
    clearTimeout(_debounceTimer);
    const s = parseFloat(document.getElementById('p-speed').value) || 1;
    state.speed = s;
    applyParams(iframe, state);
    updateCode();
    _pushUndo(state);
  });
  // ── 专属控制项：绑定事件（应用由 syncPreview/wc-ready 统一处理） ──
  controls.forEach(c => {
    const el = document.getElementById('wcc-' + c.key);
    if (!el) return;
    if (c.type === 'toggle') {
      el.addEventListener('change', () => {
        ctrlValues[c.key] = el.checked;
        applyControl(iframe, controlToPatch(c, el.checked));
        updateCode();
        _pushUndo(state);
      });
    } else {
      const out = document.getElementById('v-wcc-' + c.key);
      el.addEventListener('input', () => {
        const v = parseFloat(el.value);
        ctrlValues[c.key] = v;
        if (out) out.textContent = v + (c.unit || '');
        applyControl(iframe, controlToPatch(c, v));
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(() => { updateCode(); _pushUndo(state); }, 80);
      });
      el.addEventListener('change', () => {
        clearTimeout(_debounceTimer);
        updateCode();
        _pushUndo(state);
      });
    }
  });

  // 初始状态入栈
  _pushUndo(state);

  document.getElementById('p-reset').addEventListener('click', () => {
    state.size=1; state.x=0; state.y=0; state.c1=c1; state.c2=c2; state.bg=''; state.speed=1;
    applyParams(iframe, { radius: 'reset' }); // 先清除已应用的圆角，恢复模板原始圆角
    state.radius=null;
    ['p-size','p-x','p-y','p-radius'].forEach(id=>document.getElementById(id).value = id==='p-radius'?12:(id==='p-size'?1:0));
    document.getElementById('p-c1').value=c1;
    document.getElementById('p-c2').value=c2;
    document.getElementById('p-bg').value='#ffffff';
    document.getElementById('p-speed').value=1;
    document.getElementById('v-speed').textContent='1.0×';
    setDemoSpeed(iframe, 1);
    ['v-size','v-x','v-y','v-radius'].forEach((id,i)=>document.getElementById(id).textContent=['100%','0px','0px','默认'][i]);
    // 恢复专属控制项默认值 + 同步 UI + 重新应用
    controls.forEach(c => {
      ctrlValues[c.key] = c.value;
      const el = document.getElementById('wcc-' + c.key);
      if (el) {
        if (c.type === 'toggle') el.checked = !!c.value;
        else { el.value = c.value; const out = document.getElementById('v-wcc-' + c.key); if (out) out.textContent = c.value + (c.unit || ''); }
      }
      applyControl(iframe, controlToPatch(c, c.value));
    });
    applyParams(iframe, state);
    updateCode();
    _pushUndo(state);
    toast('参数已重置', 'info');
  });

  // ── 编辑代码后按回车：用当前代码重新渲染并静态定格 ──
  function currentCode() {
    const read = sel => { const p = document.querySelector(sel); return p ? p.innerText : ''; };
    return {
      html: t.html ? read('#code-html pre') : '',
      css: t.css ? read('#code-css pre') : '',
      js: t.js ? read('#code-js pre') : '',
      cat: t.cat, id: t.id
    };
  }
  // ── 快速语法校验（客户端轻量） ──
  function _validateCode(lang, code) {
    if (lang === 'js') {
      try { new Function(code); return null; } catch (e) { return `JS 语法错误: ${e.message}`; }
    }
    if (lang === 'css') {
      // 简单检测未闭合的大括号
      const open = (code.match(/{/g) || []).length;
      const close = (code.match(/}/g) || []).length;
      if (open !== close) return `CSS: 大括号不匹配 (${open} 开, ${close} 闭)`;
      return null;
    }
    if (lang === 'html') {
      const openTags = (code.match(/<(\w+)[^>]*>/g) || []).filter(t => !t.includes('/')).length;
      const closeTags = (code.match(/<\/\w+>/g) || []).length;
      // 宽松检测
      if (Math.abs(openTags - closeTags) > 3) return `HTML: 标签可能不匹配 (开标签 ${openTags}, 闭标签 ${closeTags})`;
      return null;
    }
    return null;
  }
  function applyEditedCode() {
    const code = currentCode();
    // 快速校验
    const errors = [];
    if (code.html) { const e = _validateCode('html', code.html); if (e) errors.push(e); }
    if (code.css) { const e = _validateCode('css', code.css); if (e) errors.push(e); }
    if (code.js) { const e = _validateCode('js', code.js); if (e) errors.push(e); }
    if (errors.length) {
      toast(errors[0], 'error');
      // 高亮错误代码块
      errors.forEach(err => {
        const lang = err.split(':')[0].toLowerCase();
        const box = document.getElementById('code-' + (lang === 'js' ? 'js' : lang === 'html' ? 'html' : 'css'));
        if (box) { box.style.outline = '2px solid #ef4444'; setTimeout(() => box.style.outline = '', 2000); }
      });
      return;
    }
    const chk = document.getElementById('auto-demo');
    if (chk) chk.checked = false;
    syncPreview(code, { autoDemo: false });
    toast('代码已应用', 'success');
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

  // 复制按钮
  document.querySelectorAll('.copy-inline').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pre = btn.closest('.group').querySelector('pre');
      const text = pre ? pre.innerText : '';
      await copyText(text);
      toast('已复制到剪贴板', 'success');
    });
  });

  document.getElementById('copy-all').addEventListener('click', async () => {
    const parts = [];
    if (t.html) parts.push(`<!-- HTML -->\n${document.querySelector('#code-html pre').innerText}`);
    if (t.css) parts.push(`/* CSS */\n${document.querySelector('#code-css pre').innerText}`);
    if (t.js) parts.push(`/* JS */\n${document.querySelector('#code-js pre').innerText}`);
    await copyText(parts.join('\n\n'));
    toast('全部代码已复制!', 'success');
  });

  document.getElementById('download').addEventListener('click', () => {
    const html = `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><style>${t.css}</style></head>\n<body>\n${t.html}\n<script>${t.js}<\/script>\n</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${t.id}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`已下载 ${t.id}.html`, 'success');
  });

  const favBtn = document.getElementById('fav');
  favBtn.addEventListener('click', () => {
    const favs = store.toggleFav(t.id);
    const on = favs.includes(t.id);
    favBtn.textContent = on ? '★ 已收藏' : '☆ 收藏';
    favBtn.className = 'px-4 py-2 rounded-lg text-sm border transition-all ' + (on ? 'border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700');
    toast(on ? '已加入收藏 ★' : '已取消收藏', on ? 'success' : 'info');
  });
}

function codeBlock(label, code, lang, cid) {
  // 生成行号
  const lines = code.split('\n');
  const lineNums = lines.map((_, i) => `<span class="code-line-num">${i + 1}</span>`).join('\n');
  return `
  <div class="relative group" id="${cid}">
    <div class="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-t-lg">
      <span class="font-mono">${label} <span class="text-slate-400">· 可直接编辑 · 按 Enter 应用</span></span>
      <button class="copy-inline text-slate-300 hover:text-white transition-colors" data-lang="${lang}">复制</button>
    </div>
    <div class="code-block rounded-b-lg">
      <div class="code-with-lines">
        <div class="code-lines" aria-hidden="true">${lineNums}</div>
        <pre class="wc-editable" contenteditable="true" spellcheck="false" data-lang="${lang}">${highlight(code, lang)}</pre>
      </div>
    </div>
  </div>`;
}

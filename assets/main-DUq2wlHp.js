import{n as a,S as o,p as n,A as i,L as s,Y as l,H as c,$ as x}from"./index-DrRY-Jl8-612mL4fq.js";window.__WC_TEMPLATES__=a;o("");const m=document.getElementById("app"),b=`
<section class="relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-purple-500/5 to-transparent"></div>
  <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
    <span class="inline-block px-3 py-1 rounded-full bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300 text-xs font-medium mb-4">免费商用 · 无版权 · 100% 覆盖</span>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
      万能 <span class="bg-gradient-to-r from-brand-500 to-purple-500 bg-clip-text text-transparent">Web 前端</span><br>模板与交互效果库
    </h1>
    <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">最全、最新、可直接复制、可在线预览、可一键下载的布局 / 动态效果 / 鼠标 & 键盘交互 / 文本美化 / 组件库一站式平台。共 <b class="text-brand-600 dark:text-brand-300">${a.length}</b> 个真实可运行模板。</p>
    <div class="flex flex-wrap justify-center gap-3 mb-8">
      <a href="categories.html" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-lg shadow-brand-500/30">浏览全部模板</a>
    </div>
    <div class="max-w-xl mx-auto relative">
      <input id="hero-search" placeholder="搜索任何效果，如：淡入、3D、打字机…" class="w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500" />
    </div>
  </div>
</section>`,g=`
<section class="max-w-7xl mx-auto px-4 mb-16">
  <h2 class="text-2xl font-bold mb-6">分类导航</h2>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    ${n.map(t=>{const r=a.filter(d=>d.cat===t.id).length;return`<a href="categories.html?cat=${t.id}" class="wc-card p-5 hover:-translate-y-1 group">
        <div class="text-3xl mb-2">${t.icon}</div>
        <h3 class="font-semibold">${t.name}</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${r} 个模板</p>
      </a>`}).join("")}
  </div>
</section>`,p=`
<section class="max-w-7xl mx-auto px-4 mb-16">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold">⭐ 推荐模板</h2>
    <a href="categories.html" class="text-sm text-brand-600 dark:text-brand-300">查看全部 →</a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${i.map(t=>s(l(t),{from:"home"})).join("")}
  </div>
</section>`,h=`
<section class="max-w-7xl mx-auto px-4 mb-16">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-2xl font-bold">🔥 热门效果</h2>
    <a href="categories.html?sort=hot" class="text-sm text-brand-600 dark:text-brand-300">更多 →</a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    ${c.map(t=>s(l(t),{from:"home"})).join("")}
  </div>
</section>`;m.innerHTML=b+g+p+h;x();const e=document.getElementById("hero-search");e.addEventListener("keydown",t=>{t.key==="Enter"&&e.value.trim()&&(location.href="categories.html?q="+encodeURIComponent(e.value.trim()))});

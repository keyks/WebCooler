import{n as m,S as p,m as r,Y as c,$ as x,L as g}from"./index-DrRY-Jl8-612mL4fq.js";window.__WC_TEMPLATES__=m;p("workbench");const h=document.getElementById("app"),l=r.get(),f=(l.favs||[]).map(c).filter(Boolean),v=(l.history||[]).map(c).filter(Boolean),d=l.shares||[];function n(e,s,t){return s.length?`<div class="mb-10"><h2 class="text-xl font-bold mb-4">${e} <span class="text-sm font-normal text-slate-400">(${s.length})</span></h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">${s.map(a=>g(a,{fav:!0,from:"workbench"})).join("")}</div></div>`:`<div class="mb-10"><h2 class="text-xl font-bold mb-4">${e}</h2><p class="text-slate-400 text-sm">${t}</p></div>`}function y(e){return`
  <div class="wc-card p-4">
    <div class="flex items-start justify-between gap-2 mb-2">
      <span class="text-[11px] px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${e.type==="element"?"🌟 共享元素":"🧩 共享布局"}</span>
      <button data-del="${e.id}" class="text-xs text-slate-400 hover:text-red-500" title="删除">✕</button>
    </div>
    <h3 class="font-semibold text-sm">${e.name}</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${e.desc||"（无描述）"}</p>
    ${e.preview?`<div class="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" style="height:96px">${e.preview}</div>`:""}
    <div class="flex gap-2 mt-3">
      <button data-use="${e.id}" class="flex-1 text-xs px-2 py-1.5 rounded bg-brand-600 text-white">使用</button>
      <button data-copy="${e.id}" class="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700">复制代码</button>
    </div>
  </div>`}function w(){return`
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
  </div>`}function i(){return`
  <div class="mb-12">
    <h2 class="text-xl font-bold mb-4">📦 我的共享卡片</h2>
    ${d.length?`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">${d.map(y).join("")}</div>`:'<p class="text-slate-400 text-sm mb-6">还没有共享卡片，先在下方新建一个吧。</p>'}
    ${w()}
  </div>`}h.innerHTML=`
<section class="max-w-7xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-6">我的工作台</h1>
  ${n("⭐ 我的收藏",f,"还没有收藏，去模板详情页点击收藏吧。")}
  ${n("🕘 浏览历史",v,"暂无浏览记录。")}
  ${i()}
</section>`;x();function u(){const e=r.get();d.length=0,(e.shares||[]).forEach(t=>d.push(t));const s=document.querySelector("#app .mb-12");if(s){const t=document.createElement("div");t.innerHTML=i(),s.replaceWith(t.firstElementChild),b()}}function b(){document.querySelectorAll("[data-del]").forEach(e=>e.onclick=()=>{const s=e.dataset.del,t=r.get();t.shares=(t.shares||[]).filter(a=>a.id!==s),r.set({shares:t.shares}),u()}),document.querySelectorAll("[data-use]").forEach(e=>e.onclick=()=>{var s;const t=d.find(a=>a.id===e.dataset.use);t&&((s=navigator.clipboard)==null||s.writeText(t.code||"").catch(()=>{}),alert("已复制「"+t.name+"」的代码到剪贴板，可直接粘贴使用。"))}),document.querySelectorAll("[data-copy]").forEach(e=>e.onclick=()=>{var s;const t=d.find(a=>a.id===e.dataset.use);t&&((s=navigator.clipboard)==null||s.writeText(t.code||"").catch(()=>{}),alert("代码已复制。"))})}document.getElementById("ns-add").onclick=()=>{const e=document.getElementById("ns-name").value.trim(),s=document.getElementById("ns-type").value,t=document.getElementById("ns-desc").value.trim(),a=document.getElementById("ns-code").value;if(!e)return alert("请填写卡片名称");if(!a.trim())return alert("请粘贴你的布局 / 元素代码");const o=r.get();o.shares=o.shares||[],o.shares.unshift({id:"s"+Date.now(),name:e,type:s,desc:t,code:a,preview:"",at:Date.now()}),r.set({shares:o.shares}),u()};b();

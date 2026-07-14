import{T as c,i as g,C as m,g as b,s as u,t as p,r as x}from"./index-Bln418yw.js";window.__WC_TEMPLATES__=c;g("category");const h=document.getElementById("app"),o=new URLSearchParams(location.search);let t=o.get("cat")||"",r=o.get("q")||"";h.innerHTML=`
<section class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold">模板库</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1" id="count"></p>
    </div>
    <input id="search" value="${r}" placeholder="搜索效果…" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-72" />
  </div>

  <div class="flex flex-wrap gap-2 mb-6" id="cats">
    <button data-c="" class="cat px-3 py-1.5 rounded-lg text-sm ${t?"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700":"bg-brand-600 text-white"}">全部</button>
    ${m.map(e=>`<button data-c="${e.id}" class="cat px-3 py-1.5 rounded-lg text-sm ${t===e.id?"bg-brand-600 text-white":"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}">${e.icon} ${e.name}</button>`).join("")}
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="grid"></div>
  <div id="empty" class="text-center text-slate-400 py-20 hidden">未找到匹配的模板</div>
</section>`;const n=document.getElementById("grid"),y=document.getElementById("count"),l=document.getElementById("empty");function s(){let e=t?b(t):c.slice();if(r&&(e=u(r)),y.textContent=`共 ${e.length} 个模板`,!e.length){n.innerHTML="",l.classList.remove("hidden");return}l.classList.add("hidden");const a="categories.html"+(location.search?location.search:"");n.innerHTML=e.map(d=>p(d,{from:"category",back:a})).join(""),x()}document.getElementById("cats").addEventListener("click",e=>{const a=e.target.closest(".cat");a&&(t=a.dataset.c,document.querySelectorAll(".cat").forEach(d=>{const i=d.dataset.c===t;d.className="cat px-3 py-1.5 rounded-lg text-sm "+(i?"bg-brand-600 text-white":"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700")}),s())});document.getElementById("search").addEventListener("input",e=>{r=e.target.value.trim(),s()});s();

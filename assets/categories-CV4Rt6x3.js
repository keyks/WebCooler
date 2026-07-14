import{n as o,S as g,p as m,D as b,X as u,L as p,$ as x}from"./index-DrRY-Jl8-612mL4fq.js";window.__WC_TEMPLATES__=o;g("category");const h=document.getElementById("app"),c=new URLSearchParams(location.search);let e=c.get("cat")||"",r=c.get("q")||"";h.innerHTML=`
<section class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold">模板库</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1" id="count"></p>
    </div>
    <input id="search" value="${r}" placeholder="搜索效果…" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-72" />
  </div>

  <div class="flex flex-wrap gap-2 mb-6" id="cats">
    <button data-c="" class="cat px-3 py-1.5 rounded-lg text-sm ${e?"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700":"bg-brand-600 text-white"}">全部</button>
    ${m.map(t=>`<button data-c="${t.id}" class="cat px-3 py-1.5 rounded-lg text-sm ${e===t.id?"bg-brand-600 text-white":"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}">${t.icon} ${t.name}</button>`).join("")}
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="grid"></div>
  <div id="empty" class="text-center text-slate-400 py-20 hidden">未找到匹配的模板</div>
</section>`;const n=document.getElementById("grid"),y=document.getElementById("count"),l=document.getElementById("empty");function s(){let t=e?b(e):o.slice();if(r&&(t=u(r)),y.textContent=`共 ${t.length} 个模板`,!t.length){n.innerHTML="",l.classList.remove("hidden");return}l.classList.add("hidden");const a="categories.html"+(location.search?location.search:"");n.innerHTML=t.map(d=>p(d,{from:"category",back:a})).join(""),x()}document.getElementById("cats").addEventListener("click",t=>{const a=t.target.closest(".cat");a&&(e=a.dataset.c,document.querySelectorAll(".cat").forEach(d=>{const i=d.dataset.c===e;d.className="cat px-3 py-1.5 rounded-lg text-sm "+(i?"bg-brand-600 text-white":"bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700")}),s())});document.getElementById("search").addEventListener("input",t=>{r=t.target.value.trim(),s()});s();

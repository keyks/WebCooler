import{i as H,a as P,b as _}from"./index-Bln418yw.js";function B(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function W(n){let t=B(n);return t=t.replace(/(&lt;!--[\s\S]*?--&gt;)/g,'<span class="tok-comment">$1</span>'),t=t.replace(/(&lt;\/?)([\w-]+)/g,'$1<span class="tok-tag">$2</span>'),t=t.replace(/([\w-]+)(=)(&quot;[^&]*&quot;|"[^"]*")/g,'<span class="tok-attr">$1</span>$2<span class="tok-string">$3</span>'),t}function O(n){let t=B(n);return t=t.replace(/(\/\*[\s\S]*?\*\/)/g,'<span class="tok-comment">$1</span>'),t=t.replace(/([\w-]+)(\s*:)/g,'<span class="tok-attr">$1</span>$2'),t=t.replace(/(:\s*)([^;{}]+)(;)/g,'$1<span class="tok-string">$2</span>$3'),t=t.replace(/@[\w-]+/g,o=>`<span class="tok-keyword">${o}</span>`),t}function R(n){let t=B(n);return t=t.replace(/(\/\/[^\n]*)/g,'<span class="tok-comment">$1</span>'),t=t.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g,'<span class="tok-string">$1</span>'),t=t.replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|export|from|await|async|document|window|this)\b/g,'<span class="tok-keyword">$1</span>'),t=t.replace(/\b(\d+\.?\d*)\b/g,'<span class="tok-num">$1</span>'),t=t.replace(/([\w-]+)(\s*\()/g,'<span class="tok-fn">$1</span>$2'),t}function q(n,t){return t==="html"?W(n):t==="css"?O(n):t==="js"?R(n):B(n)}function J(n,t){return`
  (function(){
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    // 速度系数：外部可通过 window.__wcSpeed__ 调节（值越大越快，值越小越慢）
    // sp(ms) = ms / k  →  k=0.2 时等待变 5 倍（动画放慢），k=3 时等待变 1/3（动画加快）
    function sp(ms){ const k = window.__wcSpeed__ || 1; return Math.max(20, ms / k); }
    async function loop(){
      while(true){
        try{
          await play();
        }catch(e){}
        await sleep(sp(1400));
      }
    }
    async function play(){
      const cat = ${JSON.stringify(n)};
      const id = ${JSON.stringify(t)};
      // 通用：点击任何可见可点击元素
      const clickables = [...document.querySelectorAll('button,.b,.box,.card,.ring,.star,.rp,.glow,.item,.nav,.tip,.cell,.wrap,.knob,.h,li,a')];
      const fields = [...document.querySelectorAll('input,textarea,select')];
      const area = document.querySelector('.area,.track,.glow,.smoke,.fire,.b');
      if(fields.length){
        const f = fields[0]; if(f.blur) f.blur(); f.readOnly=true;
        const samples=['Hello','WebCooler','你好','123','ABC','Code'];
        for(const s of samples){ f.value=s; f.dispatchEvent(new Event('input',{bubbles:true})); await sleep(sp(280)); }
        f.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
        if(f.blur) f.blur();
        return;
      }
      if((cat==='mouse' && (id||'').includes('follow')) || area){
        const el = area || document.body;
        const r = el.getBoundingClientRect();
        for(let i=0;i<10;i++){
          const x=r.left+r.width*(0.2+0.6*Math.random());
          const y=r.top+r.height*(0.2+0.6*Math.random());
          el.dispatchEvent(new MouseEvent('mousemove',{clientX:x,clientY:y,bubbles:true}));
          await sleep(sp(60));
        }
        return;
      }
      if(clickables.length){
        const el = clickables[Math.floor(Math.random()*clickables.length)];
        el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        // 键盘类额外触发按键
        if(cat==='keyboard'){
          ['a','b','1','Enter','Escape'].forEach(k=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true})));
        }
        return;
      }
      // 兜底：触发一次 body 点击
      document.body.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    }
    // 启动循环
    window.__wcDemoStop__ = false;
    loop();
  })();
  `}function I(n,{html:t,css:o,js:r,cat:i="",id:g=""},{autoDemo:d=!0,speed:f=1}={}){const p=document.createElement("iframe");p.className="w-full h-full border-0",p.setAttribute("tabindex","-1"),p.setAttribute("sandbox","allow-scripts allow-same-origin"),n.innerHTML="",n.appendChild(p);const m=p.contentDocument,b=`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{box-sizing:border-box}html,body{margin:0;height:100%}
/* 控制参数变量默认值 */
:root{
  --wc-size:1; --wc-x:0px; --wc-y:0px; --wc-c1:#2f83ff; --wc-c2:#8b5cf6; --wc-bg:#ffffff; --wc-radius:12px;
}
</style>
<style id="wc-base">${o||""}</style></head><body>
<div id="wc-root">${t||""}</div>
<script>window.__wcSpeed__=${f};<\/script>
<script>${r||""}<\/script>
</body></html>`;if(m.open(),m.write(b),m.close(),d){const c=m.createElement("script");c.textContent=J(i,g),m.body.appendChild(c)}return p}function T(n,t){try{n&&n.contentWindow&&(n.contentWindow.__wcSpeed__=t)}catch{}}function j(n,t){if(!n||!n.contentDocument)return;const o=n.contentDocument;let r=o.getElementById("wc-override");r||(r=o.createElement("style"),r.id="wc-override",o.head.appendChild(r));const{size:i=1,x:g=0,y:d=0,c1:f,c2:p,bg:m,radius:b}=t;let c=`#wc-root{transform:scale(${i}) translate(${g}px,${d}px);transform-origin:center center;transition:transform .25s}`;m&&(c+=`body{background:${m} !important}`),b&&(c+=`*[class]{border-radius:${b}px !important}`),f&&(c+=`
:root{--wc-c1:${f}}`),p&&(c+=`
:root{--wc-c2:${p}}`),f&&(c+=`
.wc-root *{}
[class*="b"]{background-color:${f} !important}
button,.rp,.ring,.star.on{background-color:${f} !important}`),r.textContent=c}async function z(n){try{return await navigator.clipboard.writeText(n),!0}catch{const t=document.createElement("textarea");return t.value=n,document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t),!0}}function U(n,t={}){const{size:o=1,x:r=0,y:i=0,radius:g=12,c1:d,c2:f,bg:p,speed:m=1}=t;let b=n.html||"";const c=`transform:scale(${o}) translate(${r}px,${i}px);transform-origin:center center;`;/id=["']wc-root["']/.test(b)?b=b.replace(/(<[^>]*id=["']wc-root["'][^>]*?)>/i,`$1 style="${c}">`):b=`<div id="wc-root" style="${c}">${b}</div>`;let u=n.css||"",w=`
/* WebCooler 实时参数覆盖 */
`;p&&(w+=`body{background:${p} !important}
`),d&&(w+=`:root{--wc-c1:${d}}
[class*="b"],button,.rp,.ring,.star.on{background-color:${d} !important}
`),f&&(w+=`:root{--wc-c2:${f}}
`),m!==1&&(w+=`/* 动画速度：${m.toFixed(1)}×（数值越小越慢） */
`),u+=w;let h=n.js||"";return m!==1&&(h=`// 动画速度系数（越小越慢，越大越快）
window.__wcSpeed__ = ${m};
`+h),{html:b,css:u,js:h}}function N(n=""){const t=[],o=/#[0-9a-fA-F]{3,8}\b/g;let r;for(;r=o.exec(n);){const d=r[0].toLowerCase();!t.includes(d)&&d!=="#fff"&&d!=="#ffffff"&&d!=="#000"&&d!=="#000000"&&t.push(d)}const i=[],g=/(?:width|height|padding|font-size|max-width)\s*:\s*(\d+)px/g;for(;r=g.exec(n);)i.push(parseInt(r[1],10));return{colors:t.slice(0,4),maxSize:i.length?Math.max(...i):200}}const A=new URLSearchParams(location.search),$=A.get("back"),S=A.get("from");let k="category";$&&/(^|\/)index\.html/.test($)?k="":/categories\.html/.test($||"")?k="category":/workbench\.html/.test($||"")?k="workbench":/downloads\.html/.test($||"")?k="downloads":S==="home"?k="":(S==="workbench"||S==="fav")&&(k="workbench");H(k);const M=document.getElementById("app"),K=new URLSearchParams(location.search).get("id"),a=P(K);if(!a)M.innerHTML='<div class="max-w-3xl mx-auto px-4 py-20 text-center"><h1 class="text-2xl font-bold mb-4">模板未找到</h1><a href="categories.html" class="text-brand-600">返回模板库</a></div>';else{let w=function(){const e=U(a,u),s=(l,x,y)=>{const v=document.getElementById(l);v&&(v.querySelector("pre").innerHTML=q(y,x))};a.html&&s("code-html","html",e.html),a.css&&s("code-css","css",e.css),a.js&&s("code-js","js",e.js)},D=function(){const e=s=>{const l=document.querySelector(s);return l?l.innerText:""};return{html:a.html?e("#code-html pre"):"",css:a.css?e("#code-css pre"):"",js:a.js?e("#code-js pre"):"",cat:a.cat,id:a.id}},F=function(){const e=D(),s=document.getElementById("auto-demo");s&&(s.checked=!1),c=I(b,e,{autoDemo:!1}),j(c,u)};const n=["index.html","categories.html","workbench.html","downloads.html"],t=e=>{if(!e||e.startsWith("//")||e.includes("://"))return!1;const s=e.replace(/^\/+/,"");return n.some(l=>s===l||s.startsWith(l+"?"))},o=$,r=S;let i;if(o&&t(o))i=o;else switch(r){case"home":i="index.html";break;case"workbench":case"fav":i="workbench.html";break;default:i=a.cat?`categories.html?cat=${a.cat}`:"categories.html"}_.addHistory(a.id);const g=_.isFav(a.id),d=N(a.css),f=d.colors[0]||"#2f83ff",p=d.colors[1]||"#8b5cf6";M.innerHTML=`
  <section class="max-w-6xl mx-auto px-4 py-8">
    <button type="button" id="wc-back" class="text-sm text-slate-500 hover:text-brand-600 cursor-pointer bg-transparent border-0 p-0">← 返回</button>
    <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
      <div>
        <h1 class="text-2xl font-bold">${a.title}</h1>
        <div class="flex flex-wrap gap-1.5 mt-2">${a.tags.map(e=>`<span class="text-xs px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${e}</span>`).join("")}</div>
      </div>
      <div class="flex gap-2">
        <button id="fav" class="px-4 py-2 rounded-lg text-sm border ${g?"border-amber-400 text-amber-500":"border-slate-200 dark:border-slate-700"}">${g?"★ 已收藏":"☆ 收藏"}</button>
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
              <input type="color" id="p-c1" value="${f}" class="wc-color w-full mt-1 h-8">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">辅助颜色
              <input type="color" id="p-c2" value="${p}" class="wc-color w-full mt-1 h-8">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">背景颜色
              <input type="color" id="p-bg" value="#ffffff" class="wc-color w-full mt-1 h-8">
            </label>
            <div class="flex items-end">
              <button id="p-reset" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600">重置参数</button>
            </div>
          </div>
        </div>
        ${a.html?L("HTML",a.html,"html","code-html"):""}
        ${a.css?L("CSS",a.css,"css","code-css"):""}
        ${a.js?L("JavaScript",a.js,"js","code-js"):""}
      </div>
    </div>
  </section>`;const m=document.getElementById("wc-back");m&&(m.onclick=e=>{e.preventDefault();const s=new URLSearchParams(location.search),l=s.get("from"),x=s.get("back");if(!l&&!x){window.history.length>1?history.back():location.href=a.cat?`categories.html?cat=${a.cat}`:"categories.html";return}const v=["index.html","categories.html","workbench.html","downloads.html"].some(E=>i===E||i.startsWith(E+"?"));location.href=v?i:a.cat?`categories.html?cat=${a.cat}`:"categories.html"});const b=document.getElementById("preview");let c=I(b,a,{autoDemo:!0});document.getElementById("auto-demo").addEventListener("change",e=>{const s=e.target.checked;try{const x=c.contentDocument;x&&x.defaultView&&(x.defaultView.__wcDemoStop__=!s)}catch{}const l=parseFloat(document.getElementById("p-speed").value)||1;c=I(b,a,{autoDemo:s,speed:l})});const u={size:1,x:0,y:0,radius:12,c1:f,c2:p,bg:"",speed:1},h=(e,s,l,x=y=>y)=>{const y=document.getElementById(e),v=document.getElementById("v-"+s.replace("p-",""));y.addEventListener("input",()=>{const E=x(y.value);u[s]=E,v&&(v.textContent=l(E)),j(c,u),w()})};h("p-size","size",e=>Math.round(e*100)+"%",e=>parseFloat(e)),h("p-x","x",e=>e+"px",e=>parseInt(e,10)),h("p-y","y",e=>e+"px",e=>parseInt(e,10)),h("p-radius","radius",e=>e+"px",e=>parseInt(e,10)),h("p-c1","c1",e=>e),h("p-c2","c2",e=>e),h("p-bg","bg",e=>e),document.getElementById("p-speed").addEventListener("input",e=>{const s=parseFloat(e.target.value)||1;u.speed=s,document.getElementById("v-speed").textContent=s.toFixed(1)+"×",T(c,s),w()}),document.getElementById("p-reset").addEventListener("click",()=>{u.size=1,u.x=0,u.y=0,u.radius=12,u.c1=f,u.c2=p,u.bg="",u.speed=1,["p-size","p-x","p-y","p-radius"].forEach(e=>document.getElementById(e).value=e==="p-radius"?12:e==="p-size"?1:0),document.getElementById("p-c1").value=f,document.getElementById("p-c2").value=p,document.getElementById("p-bg").value="#ffffff",document.getElementById("p-speed").value=1,document.getElementById("v-speed").textContent="1.0×",T(c,1),["v-size","v-x","v-y","v-radius"].forEach((e,s)=>document.getElementById(e).textContent=["100%","0px","0px","12px"][s]),j(c,u),w()}),document.querySelectorAll(".wc-editable").forEach(e=>{e.addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),F(),e.blur())})}),document.querySelectorAll(".copy-inline").forEach(e=>{e.addEventListener("click",async()=>{const s=e.closest(".group").querySelector("pre"),l=s?s.innerText:"";await z(l);const x=e.textContent;e.textContent="已复制!",setTimeout(()=>e.textContent=x,1200)})}),document.getElementById("copy-all").addEventListener("click",async()=>{const e=[];a.html&&e.push(`<!-- HTML -->
${document.querySelector("#code-html pre").innerText}`),a.css&&e.push(`/* CSS */
${document.querySelector("#code-css pre").innerText}`),a.js&&e.push(`/* JS */
${document.querySelector("#code-js pre").innerText}`),await z(e.join(`

`));const s=document.getElementById("copy-all");s.textContent="已复制全部!",setTimeout(()=>s.textContent="复制全部代码",1200)}),document.getElementById("download").addEventListener("click",()=>{const e=`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${a.css}</style></head>
<body>
${a.html}
<script>${a.js}<\/script>
</body></html>`,s=new Blob([e],{type:"text/html"}),l=document.createElement("a");l.href=URL.createObjectURL(s),l.download=`${a.id}.html`,l.click()});const C=document.getElementById("fav");C.addEventListener("click",()=>{const s=_.toggleFav(a.id).includes(a.id);C.textContent=s?"★ 已收藏":"☆ 收藏",C.className="px-4 py-2 rounded-lg text-sm border "+(s?"border-amber-400 text-amber-500":"border-slate-200 dark:border-slate-700")})}function L(n,t,o,r){return`
  <div class="relative group" id="${r}">
    <div class="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-t-lg">
      <span class="font-mono">${n} <span class="text-slate-400">· 可直接编辑</span></span>
      <button class="copy-inline text-slate-300 hover:text-white" data-lang="${o}">复制</button>
    </div>
    <div class="code-block rounded-b-lg"><pre class="wc-editable" contenteditable="true" spellcheck="false" data-lang="${o}">${q(t,o)}</pre></div>
  </div>`}

import{S as H,T as O,m as _}from"./index-DrRY-Jl8-DrRY-Jl8-gkoO4HHx.js";function I(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function P(s){let t=I(s);return t=t.replace(/(&lt;!--[\s\S]*?--&gt;)/g,'<span class="tok-comment">$1</span>'),t=t.replace(/(&lt;\/?)([\w-]+)/g,'$1<span class="tok-tag">$2</span>'),t=t.replace(/([\w-]+)(=)(&quot;[^&]*&quot;|"[^"]*")/g,'<span class="tok-attr">$1</span>$2<span class="tok-string">$3</span>'),t}function R(s){let t=I(s);return t=t.replace(/(\/\*[\s\S]*?\*\/)/g,'<span class="tok-comment">$1</span>'),t=t.replace(/([\w-]+)(\s*:)/g,'<span class="tok-attr">$1</span>$2'),t=t.replace(/(:\s*)([^;{}]+)(;)/g,'$1<span class="tok-string">$2</span>$3'),t=t.replace(/@[\w-]+/g,r=>`<span class="tok-keyword">${r}</span>`),t}function W(s){let t=I(s);return t=t.replace(/(\/\/[^\n]*)/g,'<span class="tok-comment">$1</span>'),t=t.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g,'<span class="tok-string">$1</span>'),t=t.replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|export|from|await|async|document|window|this)\b/g,'<span class="tok-keyword">$1</span>'),t=t.replace(/\b(\d+\.?\d*)\b/g,'<span class="tok-num">$1</span>'),t=t.replace(/([\w-]+)(\s*\()/g,'<span class="tok-fn">$1</span>$2'),t}function A(s,t){return t==="html"?P(s):t==="css"?R(s):t==="js"?W(s):I(s)}function U(s,t){return`
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
      const cat = ${JSON.stringify(s)};
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
  `}function j(s,{html:t,css:r,js:o,cat:f="",id:g=""},{autoDemo:i=!0,speed:l=1}={}){const m=document.createElement("iframe");m.className="w-full h-full border-0",m.setAttribute("tabindex","-1"),m.setAttribute("sandbox","allow-scripts allow-same-origin"),s.innerHTML="",s.appendChild(m);const p=m.contentDocument,u=`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{box-sizing:border-box}html,body{margin:0;height:100%}
/* 控制参数变量默认值 */
:root{
  --wc-size:1; --wc-x:0px; --wc-y:0px; --wc-c1:#2f83ff; --wc-c2:#8b5cf6; --wc-bg:#ffffff; --wc-radius:12px;
}
</style>
<style id="wc-base">${r||""}</style></head><body>
<div id="wc-root">${t||""}</div>
<script>window.__wcSpeed__=${l};<\/script>
<script>${o||""}<\/script>
</body></html>`;if(p.open(),p.write(u),p.close(),i){const d=p.createElement("script");d.textContent=U(f,g),p.body.appendChild(d)}return m}function z(s,t){try{s&&s.contentWindow&&(s.contentWindow.__wcSpeed__=t)}catch{}}function L(s,t){if(!s||!s.contentDocument)return;const r=s.contentDocument;let o=r.getElementById("wc-override");o||(o=r.createElement("style"),o.id="wc-override",r.head.appendChild(o));const{size:f=1,x:g=0,y:i=0,c1:l,c2:m,bg:p,radius:u}=t;let d=`#wc-root{transform:scale(${f}) translate(${g}px,${i}px);transform-origin:center center;transition:transform .25s}`;p&&(d+=`body{background:${p} !important}`),u&&(d+=`*[class]{border-radius:${u}px !important}`),l&&(d+=`
:root{--wc-c1:${l}}`),m&&(d+=`
:root{--wc-c2:${m}}`),l&&(d+=`
.wc-root *{}
[class*="b"]{background-color:${l} !important}
button,.rp,.ring,.star.on{background-color:${l} !important}`),o.textContent=d}async function D(s){try{return await navigator.clipboard.writeText(s),!0}catch{const t=document.createElement("textarea");return t.value=s,document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t),!0}}function J(s,t={}){const{size:r=1,x:o=0,y:f=0,radius:g=12,c1:i,c2:l,bg:m,speed:p=1}=t;let u=s.html||"";const d=`transform:scale(${r}) translate(${o}px,${f}px);transform-origin:center center;`;/id=["']wc-root["']/.test(u)?u=u.replace(/(<[^>]*id=["']wc-root["'][^>]*?)>/i,`$1 style="${d}">`):u=`<div id="wc-root" style="${d}">${u}</div>`;let S=s.css||"",w=`
/* WebCooler 实时参数覆盖 */
`;m&&(w+=`body{background:${m} !important}
`),i&&(w+=`:root{--wc-c1:${i}}
[class*="b"],button,.rp,.ring,.star.on{background-color:${i} !important}
`),l&&(w+=`:root{--wc-c2:${l}}
`),p!==1&&(w+=`/* 动画速度：${p.toFixed(1)}×（数值越小越慢） */
`),S+=w;let x=s.js||"";return p!==1&&(x=`// 动画速度系数（越小越慢，越大越快）
window.__wcSpeed__ = ${p};
`+x),{html:u,css:S,js:x}}function N(s=""){const t=[],r=/#[0-9a-fA-F]{3,8}\b/g;let o;for(;o=r.exec(s);){const i=o[0].toLowerCase();!t.includes(i)&&i!=="#fff"&&i!=="#ffffff"&&i!=="#000"&&i!=="#000000"&&t.push(i)}const f=[],g=/(?:width|height|padding|font-size|max-width)\s*:\s*(\d+)px/g;for(;o=g.exec(s);)f.push(parseInt(o[1],10));return{colors:t.slice(0,4),maxSize:f.length?Math.max(...f):200}}const F=new URLSearchParams(location.search),E=F.get("back"),C=F.get("from");let $="category";E&&/(^|\/)index\.html/.test(E)?$="":/categories\.html/.test(E||"")?$="category":/workbench\.html/.test(E||"")?$="workbench":/downloads\.html/.test(E||"")?$="downloads":C==="home"?$="":(C==="workbench"||C==="fav")&&($="workbench");H($);const q=document.getElementById("app"),K=new URLSearchParams(location.search).get("id"),n=O(K);if(!n)q.innerHTML='<div class="max-w-3xl mx-auto px-4 py-20 text-center"><h1 class="text-2xl font-bold mb-4">模板未找到</h1><a href="categories.html" class="text-brand-600">返回模板库</a></div>';else{let s=function(){const e=J(n,b),a=(c,h,y)=>{const v=document.getElementById(c);v&&(v.querySelector("pre").innerHTML=A(y,h))};n.html&&a("code-html","html",e.html),n.css&&a("code-css","css",e.css),n.js&&a("code-js","js",e.js)},t=function(){const e=a=>{const c=document.querySelector(a);return c?c.innerText:""};return{html:n.html?e("#code-html pre"):"",css:n.css?e("#code-css pre"):"",js:n.js?e("#code-js pre"):"",cat:n.cat,id:n.id}},r=function(){const e=t(),a=document.getElementById("auto-demo");a&&(a.checked=!1),x=j(w,e,{autoDemo:!1}),L(x,b)};const o=["index.html","categories.html","workbench.html","downloads.html"],f=e=>{if(!e||e.startsWith("//")||e.includes("://"))return!1;const a=e.replace(/^\/+/,"");return o.some(c=>a===c||a.startsWith(c+"?"))},g=E,i=C;let l;if(g&&f(g))l=g;else switch(i){case"home":l="index.html";break;case"workbench":case"fav":l="workbench.html";break;default:l=n.cat?`categories.html?cat=${n.cat}`:"categories.html"}_.addHistory(n.id);const m=_.isFav(n.id),p=N(n.css),u=p.colors[0]||"#2f83ff",d=p.colors[1]||"#8b5cf6";q.innerHTML=`
  <section class="max-w-6xl mx-auto px-4 py-8">
    <button type="button" id="wc-back" class="text-sm text-slate-500 hover:text-brand-600 cursor-pointer bg-transparent border-0 p-0">← 返回</button>
    <div class="flex flex-wrap items-center justify-between gap-3 mt-3">
      <div>
        <h1 class="text-2xl font-bold">${n.title}</h1>
        <div class="flex flex-wrap gap-1.5 mt-2">${n.tags.map(e=>`<span class="text-xs px-2 py-0.5 rounded bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-300">${e}</span>`).join("")}</div>
      </div>
      <div class="flex gap-2">
        <button id="fav" class="px-4 py-2 rounded-lg text-sm border ${m?"border-amber-400 text-amber-500":"border-slate-200 dark:border-slate-700"}">${m?"★ 已收藏":"☆ 收藏"}</button>
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
              <input type="color" id="p-c1" value="${u}" class="wc-color w-full mt-1 h-8">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">辅助颜色
              <input type="color" id="p-c2" value="${d}" class="wc-color w-full mt-1 h-8">
            </label>
            <label class="text-xs text-slate-600 dark:text-slate-300">背景颜色
              <input type="color" id="p-bg" value="#ffffff" class="wc-color w-full mt-1 h-8">
            </label>
            <div class="flex items-end">
              <button id="p-reset" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600">重置参数</button>
            </div>
          </div>
        </div>
        ${n.html?T("HTML",n.html,"html","code-html"):""}
        ${n.css?T("CSS",n.css,"css","code-css"):""}
        ${n.js?T("JavaScript",n.js,"js","code-js"):""}
      </div>
    </div>
  </section>`;const S=document.getElementById("wc-back");S&&(S.onclick=e=>{e.preventDefault();const a=new URLSearchParams(location.search),c=a.get("from"),h=a.get("back");if(!c&&!h){window.history.length>1?history.back():location.href=n.cat?`categories.html?cat=${n.cat}`:"categories.html";return}const y=["index.html","categories.html","workbench.html","downloads.html"].some(v=>l===v||l.startsWith(v+"?"));location.href=y?l:n.cat?`categories.html?cat=${n.cat}`:"categories.html"});const w=document.getElementById("preview");let x=j(w,n,{autoDemo:!0});document.getElementById("auto-demo").addEventListener("change",e=>{const a=e.target.checked;try{const h=x.contentDocument;h&&h.defaultView&&(h.defaultView.__wcDemoStop__=!a)}catch{}const c=parseFloat(document.getElementById("p-speed").value)||1;x=j(w,n,{autoDemo:a,speed:c})});const b={size:1,x:0,y:0,radius:12,c1:u,c2:d,bg:"",speed:1},k=(e,a,c,h=y=>y)=>{const y=document.getElementById(e),v=document.getElementById("v-"+a.replace("p-",""));y.addEventListener("input",()=>{const M=h(y.value);b[a]=M,v&&(v.textContent=c(M)),L(x,b),s()})};k("p-size","size",e=>Math.round(e*100)+"%",e=>parseFloat(e)),k("p-x","x",e=>e+"px",e=>parseInt(e,10)),k("p-y","y",e=>e+"px",e=>parseInt(e,10)),k("p-radius","radius",e=>e+"px",e=>parseInt(e,10)),k("p-c1","c1",e=>e),k("p-c2","c2",e=>e),k("p-bg","bg",e=>e),document.getElementById("p-speed").addEventListener("input",e=>{const a=parseFloat(e.target.value)||1;b.speed=a,document.getElementById("v-speed").textContent=a.toFixed(1)+"×",z(x,a),s()}),document.getElementById("p-reset").addEventListener("click",()=>{b.size=1,b.x=0,b.y=0,b.radius=12,b.c1=u,b.c2=d,b.bg="",b.speed=1,["p-size","p-x","p-y","p-radius"].forEach(e=>document.getElementById(e).value=e==="p-radius"?12:e==="p-size"?1:0),document.getElementById("p-c1").value=u,document.getElementById("p-c2").value=d,document.getElementById("p-bg").value="#ffffff",document.getElementById("p-speed").value=1,document.getElementById("v-speed").textContent="1.0×",z(x,1),["v-size","v-x","v-y","v-radius"].forEach((e,a)=>document.getElementById(e).textContent=["100%","0px","0px","12px"][a]),L(x,b),s()}),document.querySelectorAll(".wc-editable").forEach(e=>{e.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),r(),e.blur())})}),document.querySelectorAll(".copy-inline").forEach(e=>{e.addEventListener("click",async()=>{const a=e.closest(".group").querySelector("pre"),c=a?a.innerText:"";await D(c);const h=e.textContent;e.textContent="已复制!",setTimeout(()=>e.textContent=h,1200)})}),document.getElementById("copy-all").addEventListener("click",async()=>{const e=[];n.html&&e.push(`<!-- HTML -->
${document.querySelector("#code-html pre").innerText}`),n.css&&e.push(`/* CSS */
${document.querySelector("#code-css pre").innerText}`),n.js&&e.push(`/* JS */
${document.querySelector("#code-js pre").innerText}`),await D(e.join(`

`));const a=document.getElementById("copy-all");a.textContent="已复制全部!",setTimeout(()=>a.textContent="复制全部代码",1200)}),document.getElementById("download").addEventListener("click",()=>{const e=`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>${n.css}</style></head>
<body>
${n.html}
<script>${n.js}<\/script>
</body></html>`,a=new Blob([e],{type:"text/html"}),c=document.createElement("a");c.href=URL.createObjectURL(a),c.download=`${n.id}.html`,c.click()});const B=document.getElementById("fav");B.addEventListener("click",()=>{const e=_.toggleFav(n.id).includes(n.id);B.textContent=e?"★ 已收藏":"☆ 收藏",B.className="px-4 py-2 rounded-lg text-sm border "+(e?"border-amber-400 text-amber-500":"border-slate-200 dark:border-slate-700")})}function T(s,t,r,o){return`
  <div class="relative group" id="${o}">
    <div class="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-t-lg">
      <span class="font-mono">${s} <span class="text-slate-400">· 可直接编辑</span></span>
      <button class="copy-inline text-slate-300 hover:text-white" data-lang="${r}">复制</button>
    </div>
    <div class="code-block rounded-b-lg"><pre class="wc-editable" contenteditable="true" spellcheck="false" data-lang="${r}">${A(t,r)}</pre></div>
  </div>`}

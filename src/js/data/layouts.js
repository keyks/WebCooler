// 布局设计 —— 全覆盖常用布局 + 特殊布局
const layouts = [
  {
    id: 'ly-fixed-top', cat: 'layout', title: '顶部导航固定布局', tags: ['固定', '导航', 'PC'],
    desc: '顶部导航栏固定，内容滚动时始终可见。',
    html: `<header class="topbar">顶部导航固定</header>
<main class="content">向下滚动，导航栏始终固定在顶部。<br>内容区可自由滚动。</main>`,
    css: `.topbar{position:sticky;top:0;background:#2f83ff;color:#fff;padding:14px 20px;font-weight:600;z-index:10}
.content{padding:24px;line-height:2;color:#334}`,
    js: ``
  },
  {
    id: 'ly-fixed-side', cat: 'layout', title: '侧边栏固定布局', tags: ['固定', '侧边', '后台'],
    desc: '左侧栏固定，右侧内容滚动。',
    html: `<div class="wrap"><aside class="side">侧边栏<br>固定</aside><main class="main">右侧内容区可滚动，左侧导航始终可见，常用于后台管理。</main></div>`,
    css: `.wrap{display:flex;height:240px}.side{width:120px;background:#0f172a;color:#cbd5e1;padding:16px;flex:none}.main{flex:1;padding:20px;overflow:auto;color:#334}`,
    js: ``
  },
  {
    id: 'ly-two-col', cat: 'layout', title: '双栏布局', tags: ['双栏'],
    desc: '左右等分两列内容。',
    html: `<div class="cols"><div class="c">左栏内容</div><div class="c alt">右栏内容</div></div>`,
    css: `.cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}.c{background:#eef6ff;padding:24px;border-radius:12px;text-align:center;color:#334}.alt{background:#fef3c7}`,
    js: ``
  },
  {
    id: 'ly-three-col', cat: 'layout', title: '三栏布局', tags: ['三栏'],
    desc: '左中右三列布局。',
    html: `<div class="cols"><div class="c">左</div><div class="c mid">中</div><div class="c">右</div></div>`,
    css: `.cols{display:grid;grid-template-columns:1fr 2fr 1fr;gap:12px}.c{background:#e0f2fe;padding:20px;text-align:center;border-radius:10px;color:#334}.mid{background:#bae6fd}`,
    js: ``
  },
  {
    id: 'ly-grid12', cat: 'layout', title: '栅格布局（12列）', tags: ['栅格', 'Grid'],
    desc: '基于 12 列栅格系统。',
    html: `<div class="grid"><div class="g col-4">col-4</div><div class="g col-8">col-8</div><div class="g col-6">col-6</div><div class="g col-6">col-6</div></div>`,
    css: `.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:10px}.g{background:#2f83ff;color:#fff;text-align:center;padding:14px;border-radius:8px}.col-4{grid-column:span 4}.col-6{grid-column:span 6}.col-8{grid-column:span 8}`,
    js: ``
  },
  {
    id: 'ly-card-flow', cat: 'layout', title: '卡片流布局', tags: ['卡片'],
    desc: '自适应卡片网格流。',
    html: `<div class="flow">${[1,2,3,4,5,6].map(i=>`<div class="card">卡片 ${i}</div>`).join('')}</div>`,
    css: `.flow{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px}.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:22px;text-align:center;color:#334;box-shadow:0 1px 3px rgba(0,0,0,.06)}`,
    js: ``
  },
  {
    id: 'ly-waterfall', cat: 'layout', title: '瀑布流布局', tags: ['瀑布流', 'CSS'],
    desc: '不等高卡片瀑布流（columns 实现）。',
    html: `<div class="masonry">${[80,140,100,160,120,90,150,110].map(h=>`<div class="item" style="height:${h}px">${h}</div>`).join('')}</div>`,
    css: `.masonry{column-count:3;column-gap:12px}.item{background:linear-gradient(135deg,#2f83ff,#8ec6ff);color:#fff;margin-bottom:12px;border-radius:10px;display:flex;align-items:center;justify-content:center;break-inside:avoid}`,
    js: ``
  },
  {
    id: 'ly-fullscreen', cat: 'layout', title: '全屏布局', tags: ['全屏'],
    desc: '占满视口的全屏区块。',
    html: `<div class="full"><h1>全屏英雄区</h1><p>占满整个视口高度</p></div>`,
    css: `.full{height:100vh;background:linear-gradient(135deg,#0f172a,#1664f0);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}`,
    js: ``
  },
  {
    id: 'ly-split-lr', cat: 'layout', title: '左右分屏布局', tags: ['分屏'],
    desc: '左右各占一半的分屏。',
    html: `<div class="split"><div class="l">左侧</div><div class="r">右侧</div></div>`,
    css: `.split{display:flex;height:200px}.l,.r{flex:1;display:flex;align-items:center;justify-content:center;color:#fff}.l{background:#1664f0}.r{background:#c084fc}`,
    js: ``
  },
  {
    id: 'ly-split-tb', cat: 'layout', title: '上下分屏布局', tags: ['分屏'],
    desc: '上下等分分屏。',
    html: `<div class="split"><div class="t">上</div><div class="b">下</div></div>`,
    css: `.split{display:flex;flex-direction:column;height:200px}.t,.b{flex:1;display:flex;align-items:center;justify-content:center;color:#fff}.t{background:#0ea5e9}.b{background:#f59e0b}`,
    js: ``
  },
  {
    id: 'ly-center', cat: 'layout', title: '居中布局', tags: ['居中'],
    desc: '水平垂直完全居中。',
    html: `<div class="box"><div class="center">居中内容</div></div>`,
    css: `.box{height:200px;display:grid;place-items:center;background:#f1f5f9}.center{background:#2f83ff;color:#fff;padding:18px 32px;border-radius:12px}`,
    js: ``
  },
  {
    id: 'ly-flex', cat: 'layout', title: '弹性布局（Flex）', tags: ['Flex'],
    desc: 'Flex 弹性盒子排列。',
    html: `<div class="flex"><div class="i">1</div><div class="i">2</div><div class="i">3</div></div>`,
    css: `.flex{display:flex;gap:12px;justify-content:center}.i{flex:1;max-width:90px;background:#34d399;color:#064e3b;padding:20px;text-align:center;border-radius:10px}`,
    js: ``
  },
  {
    id: 'ly-grid', cat: 'layout', title: '网格布局（Grid）', tags: ['Grid'],
    desc: 'CSS Grid 二维网格。',
    html: `<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div></div>`,
    css: `.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.grid>div{background:#a78bfa;color:#fff;padding:24px;text-align:center;border-radius:10px}`,
    js: ``
  },
  {
    id: 'ly-multicol', cat: 'layout', title: '多列文本布局', tags: ['文本', '多列'],
    desc: '报纸式多列文本。',
    html: `<div class="cols">这是一段用于演示多列文本布局的内容。WebCooler 提供最全的布局模板。采用 CSS column 实现，文本会自动在多个栏目间流动，适合新闻与杂志排版风格，提升阅读体验。</div>`,
    css: `.cols{column-count:3;column-gap:20px;line-height:1.8;color:#334;text-align:justify}`,
    js: ``
  },
  {
    id: 'ly-mix', cat: 'layout', title: '图文混排布局', tags: ['图文'],
    desc: '图片与文字环绕混排。',
    html: `<div class="mix"><img src="https://picsum.photos/120/120" alt=""><p>文字环绕图片排布。WebCooler 提供最全的图文混排模板，适用于文章、产品介绍、新闻资讯等场景，提升版式美感与可读性。</p></div>`,
    css: `.mix img{float:left;margin:0 16px 8px 0;border-radius:10px}.mix p{line-height:1.9;color:#334}`,
    js: ``
  },
  {
    id: 'ly-shop', cat: 'layout', title: '商城商品布局', tags: ['商城'],
    desc: '商品网格 + 价格。',
    html: `<div class="shop">${[1,2,3,4].map(i=>`<div class="prod"><div class="pic"></div><div class="name">商品 ${i}</div><div class="price">¥${(i*39+9)}</div></div>`).join('')}</div>`,
    css: `.shop{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:14px}.prod{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff}.pic{height:90px;background:linear-gradient(135deg,#2f83ff,#8ec6ff)}.name{padding:8px 10px;color:#334;font-size:14px}.price{color:#ef4444;font-weight:700;padding:0 10px 10px}`,
    js: ``
  },
  {
    id: 'ly-blog', cat: 'layout', title: '博客文章布局', tags: ['博客'],
    desc: '标题 + 元信息 + 正文。',
    html: `<article class="post"><h2>如何高效学习前端</h2><div class="meta">2026-07-13 · 阅读 1.2k</div><p class="body">本文介绍 WebCooler 提供的博客布局模板，结构清晰，适合内容型站点。</p></article>`,
    css: `.post{max-width:420px;margin:0 auto}.post h2{font-size:22px;margin:0 0 8px;color:#0f172a}.meta{color:#94a3b8;font-size:13px;margin-bottom:12px}.body{line-height:1.9;color:#475}`,
    js: ``
  },
  {
    id: 'ly-admin', cat: 'layout', title: '后台管理布局', tags: ['后台'],
    desc: '侧边 + 顶栏 + 内容区。',
    html: `<div class="admin"><aside class="s">菜单</aside><div class="r"><div class="h">顶栏</div><div class="b">内容区</div></div></div>`,
    css: `.admin{display:flex;height:240px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}.s{width:90px;background:#0f172a;color:#cbd5e1;padding:14px}.r{flex:1;display:flex;flex-direction:column}.h{background:#f1f5f9;padding:10px 16px;color:#334}.b{flex:1;padding:16px;color:#647}`,
    js: ``
  },
  {
    id: 'ly-login', cat: 'layout', title: '登录注册布局', tags: ['登录'],
    desc: '居中登录卡片。',
    html: `<div class="auth"><div class="card"><h3>登录</h3><input placeholder="用户名"><input type="password" placeholder="密码"><button>登录</button></div></div>`,
    css: `.auth{height:240px;display:grid;place-items:center;background:linear-gradient(135deg,#eef6ff,#fff)}.card{width:240px;background:#fff;padding:24px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);text-align:center}.card h3{margin:0 0 16px;color:#0f172a}.card input{display:block;width:100%;box-sizing:border-box;margin-bottom:10px;padding:10px;border:1px solid #cbd5e1;border-radius:8px}.card button{width:100%;background:#2f83ff;color:#fff;border:0;padding:10px;border-radius:8px}`,
    js: ``
  },
  {
    id: 'ly-landing', cat: 'layout', title: '着陆页（Landing）布局', tags: ['Landing'],
    desc: '英雄区 + CTA。',
    html: `<section class="hero"><h1>打造你的下一个网站</h1><p>WebCooler 一站式模板库</p><button>立即开始</button></section>`,
    css: `.hero{text-align:center;padding:48px 20px;background:radial-gradient(circle at 50% 0,#2f83ff22,#fff);color:#0f172a}.hero h1{font-size:30px;margin:0 0 10px}.hero p{color:#647;margin:0 0 18px}.hero button{background:#1664f0;color:#fff;border:0;padding:12px 28px;border-radius:999px;font-size:15px}`,
    js: ``
  },
  {
    id: 'ly-responsive', cat: 'layout', title: '移动端适配布局', tags: ['响应式', '移动'],
    desc: '响应式自适应布局。',
    html: `<div class="resp"><div></div><div></div><div></div></div>`,
    css: `.resp{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:10px}.resp>div{background:#2f83ff;color:#fff;padding:20px;text-align:center;border-radius:10px}`,
    js: ``
  },
  {
    id: 'ly-landscape', cat: 'layout', title: '横屏 / 竖屏布局', tags: ['横竖屏'],
    desc: '根据屏幕方向切换布局。',
    html: `<div class="orient">当前方向：<span id="o">检测中</span></div>`,
    css: `.orient{padding:30px;text-align:center;color:#334;font-size:18px}`,
    js: `const o=document.getElementById('o');function up(){o.textContent=window.innerWidth>window.innerHeight?'横屏':'竖屏'}up();window.addEventListener('resize',up);`
  },
  {
    id: 'ly-no-margin', cat: 'layout', title: '无边距全屏布局', tags: ['全屏', '无间距'],
    desc: '去除默认边距的全屏区块。',
    html: `<div class="nom"><h2>无边距全屏</h2></div>`,
    css: `body{margin:0}.nom{width:100vw;height:200px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center}`,
    js: ``
  },
  {
    id: 'ly-snap', cat: 'layout', title: '滚动吸附布局', tags: ['吸附', '滚动'],
    desc: '滚动时整屏吸附。',
    html: `<div class="snap">${[1,2,3].map(i=>`<section class="s s${i}">第 ${i} 屏</section>`).join('')}</div>`,
    css: `.snap{height:220px;overflow-y:auto;scroll-snap-type:y mandatory;border-radius:10px}.s{height:220px;scroll-snap-align:start;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px}.s1{background:#1664f0}.s2{background:#0ea5e9}.s3{background:#8b5cf6}`,
    js: ``
  },
  {
    id: 'ly-float', cat: 'layout', title: '分层悬浮布局', tags: ['悬浮', '分层'],
    desc: '多层悬浮卡片叠加。',
    html: `<div class="stack"><div class="layer l1"></div><div class="layer l2"></div><div class="layer l3"></div></div>`,
    css: `.stack{position:relative;height:220px}.layer{position:absolute;width:140px;height:90px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.15)}.l1{background:#2f83ff;top:20px;left:30px;z-index:1}.l2{background:#8b5cf6;top:60px;left:90px;z-index:2}.l3{background:#f59e0b;top:100px;left:50px;z-index:3}`,
    js: ``
  },
  // 特殊布局
  {
    id: 'ly-3d-layer', cat: 'layout', title: '3D 分层布局', tags: ['3D', '特殊'],
    desc: 'CSS 3D 透视分层。',
    html: `<div class="scene"><div class="box3d"><span class="f f1">A</span><span class="f f2">B</span><span class="f f3">C</span></div></div>`,
    css: `.scene{perspective:700px;display:grid;place-items:center;height:220px}.box3d{transform-style:preserve-3d;animation:sway 6s ease-in-out infinite}@keyframes sway{0%,100%{transform:rotateX(18deg) rotateY(-24deg)}50%{transform:rotateX(18deg) rotateY(24deg)}}.f{position:absolute;left:-45px;top:-45px;width:90px;height:90px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,.25)}.f1{background:#1664f0;transform:translateZ(60px)}.f2{background:#8b5cf6;transform:translateZ(0)}.f3{background:#f59e0b;transform:translateZ(-60px)}`,
    js: ``
  },
  {
    id: 'ly-parallax', cat: 'layout', title: '视差滚动布局', tags: ['视差', '特殊'],
    desc: '多层不同速度滚动。',
    html: `<div class="px"><div class="bg"></div><div class="fg">前景内容</div><div class="fill"></div></div>`,
    css: `.px{position:relative;height:220px;overflow-y:auto;border-radius:10px}.px .fill{height:240px}.bg{position:absolute;inset:0;background:linear-gradient(135deg,#1e3a8a,#0ea5e9);transform:translateY(0)}.fg{position:relative;top:120px;left:30px;color:#fff;font-size:22px;font-weight:700}`,
    js: `const bg=document.querySelector('.bg');document.querySelector('.px').addEventListener('scroll',e=>{bg.style.transform='translateY('+e.target.scrollTop*0.4+'px')});`
  },
  {
    id: 'ly-circle', cat: 'layout', title: '圆形布局', tags: ['圆形', '特殊'],
    desc: '元素沿圆环分布。',
    html: `<div class="circ"><div class="center">菜单</div>${[0,1,2,3,4].map(i=>`<span class="dot d${i}"></span>`).join('')}</div>`,
    css: `.circ{position:relative;width:200px;height:200px;margin:10px auto}.center{position:absolute;inset:70px;background:#2f83ff;color:#fff;border-radius:50%;display:grid;place-items:center}.dot{position:absolute;width:24px;height:24px;background:#8b5cf6;border-radius:50%;top:50%;left:50%;margin:-12px;transform-origin:12px 88px}.d0{transform:rotate(0deg) translateY(-88px)}.d1{transform:rotate(72deg) translateY(-88px)}.d2{transform:rotate(144deg) translateY(-88px)}.d3{transform:rotate(216deg) translateY(-88px)}.d4{transform:rotate(288deg) translateY(-88px)}`,
    js: ``
  },
  {
    id: 'ly-slant', cat: 'layout', title: '斜切布局', tags: ['斜切', '特殊'],
    desc: '斜切分隔的两块区域。',
    html: `<div class="slant"><div class="a">区块 A</div><div class="b">区块 B</div></div>`,
    css: `.slant{position:relative;height:200px;overflow:hidden}.a,.b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px}.a{background:#1664f0;clip-path:polygon(0 0,100% 0,100% 60%,0 100%)}.b{background:#8b5cf6;clip-path:polygon(0 100%,100% 60%,100% 100%)}`,
    js: ``
  },
  {
    id: 'ly-irregular', cat: 'layout', title: '不规则布局', tags: ['不规则', '特殊'],
    desc: '破碎感不规则网格。',
    html: `<div class="irr"><div class="i1">1</div><div class="i2">2</div><div class="i3">3</div><div class="i4">4</div></div>`,
    css: `.irr{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:50px;gap:8px}.i1{grid-column:1/3;grid-row:1/3;background:#2f83ff}.i2{grid-column:3/5;background:#8b5cf6}.i3{grid-column:3/4;background:#f59e0b}.i4{grid-column:4/5;grid-row:1/3;background:#10b981}.irr>div{color:#fff;display:grid;place-items:center;border-radius:8px}`,
    js: ``
  },
  {
    id: 'ly-collapse', cat: 'layout', title: '折叠布局', tags: ['折叠', '特殊'],
    desc: '可折叠的手风琴区域。',
    html: `<div class="acc"><button class="hd" data-t>面板 1 ▾</button><div class="bd">折叠内容 A</div><button class="hd" data-t>面板 2 ▾</button><div class="bd">折叠内容 B</div></div>`,
    css: `.hd{width:100%;text-align:left;background:#eef6ff;color:#0f172a;border:0;padding:12px;border-radius:8px;margin-top:6px;cursor:pointer}.bd{max-height:0;overflow:hidden;transition:max-height .3s;color:#334;padding:0 12px}.bd.open{max-height:120px;padding:10px 12px}`,
    js: `document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const bd=b.nextElementSibling;bd.classList.toggle('open')});`
  },
  {
    id: 'ly-expand', cat: 'layout', title: '展开收缩布局', tags: ['收缩', '特殊'],
    desc: '点击展开更多内容。',
    html: `<div class="exp"><div class="short">简要内容…<button id="more">展开</button></div><div class="more" id="full" style="display:none">这是展开后的完整详细内容，展示更多信息与说明。</div></div>`,
    css: `.exp{padding:16px;color:#334}.short button{background:#2f83ff;color:#fff;border:0;padding:6px 14px;border-radius:8px;margin-left:8px}`,
    js: `document.getElementById('more').onclick=()=>{const f=document.getElementById('full');f.style.display=f.style.display==='none'?'block':'none';document.getElementById('more').textContent=f.style.display==='none'?'展开':'收起'};`
  },
  {
    id: 'ly-timeline', cat: 'layout', title: '时间轴布局', tags: ['时间轴', '特殊'],
    desc: '垂直时间轴节点。',
    html: `<div class="tl">${[2023,2024,2025,2026].map(y=>`<div class="node"><div class="dot"></div><div class="txt">${y} 里程碑</div></div>`).join('')}</div>`,
    css: `.tl{position:relative;padding-left:24px;border-left:2px solid #cbd5e1}.node{position:relative;margin:14px 0}.dot{position:absolute;left:-31px;top:4px;width:14px;height:14px;background:#2f83ff;border-radius:50%}.txt{color:#334}`,
    js: ``
  },
  {
    id: 'ly-steps', cat: 'layout', title: '步骤条布局', tags: ['步骤条', '特殊'],
    desc: '横向步骤进度条。',
    html: `<div class="steps"><div class="st done">1</div><div class="bar done"></div><div class="st done">2</div><div class="bar"></div><div class="st">3</div></div>`,
    css: `.steps{display:flex;align-items:center;justify-content:center}.st{width:34px;height:34px;border-radius:50%;background:#e2e8f0;color:#647;display:grid;place-items:center;font-weight:700}.st.done{background:#2f83ff;color:#fff}.bar{width:50px;height:3px;background:#e2e8f0}.bar.done{background:#2f83ff}`,
    js: ``
  },
  {
    id: 'ly-compare', cat: 'layout', title: '对比布局（左右对比）', tags: ['对比', '特殊'],
    desc: '左右方案对比。',
    html: `<div class="cmp"><div class="col a"><h4>方案 A</h4><p>轻量、快速</p></div><div class="col b"><h4>方案 B</h4><p>功能丰富</p></div></div>`,
    css: `.cmp{display:grid;grid-template-columns:1fr 1fr;gap:0;text-align:center;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}.col{padding:24px;color:#334}.a{background:#eff6ff}.b{background:#fef3c7}`,
    js: ``
  }
];

export default layouts;

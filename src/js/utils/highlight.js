// 极简代码高亮（无依赖），支持 html / css / js 基本着色
// 关键修复：采用「占位符 tokenize」策略——先把字符串/注释抽成占位符，
// 完成关键字/函数/数字着色后再还原。这样关键字表里的 class / span 等词
// 永远不会误匹配到已生成的 <span class="..."> 标签内部，杜绝坏嵌套。
// 纯函数 + 幂等：相同 (lang, code) 必然产生相同输出。记忆化可避免详情页拖拽滑块时
//（每帧 updateCode）对大段 HTML/CSS/JS 反复做多趟正则高亮的开销。
const _hlCache = new Map(); // key: `${lang} ${raw}` → highlighted html
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 生成占位符：用私有区字符包裹「私有区编码的索引」，
// 索引每位数字 0-9 映射到 \uE010–\uE019，避免被数字/单词正则误匹配。
function ph(i) {
  const enc = String(i).replace(/\d/g, d => String.fromCharCode(0xE010 + Number(d)));
  return `\uE000${enc}\uE001`;
}

function highlightHtml(code) {
  let s = escapeHtml(code);
  const store = [];
  const stash = (cls, text) => { store.push(`<span class="${cls}">${text}</span>`); return ph(store.length - 1); };

  // 注释
  s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (m) => stash('tok-comment', m));
  // 属性字符串值（escapeHtml 后裸 " 已变 &quot;，且属性值内可能含 &amp;，
  // 故用非贪婪 [\s\S]*? 跨任意字符匹配，避免被 & 截断导致后续高亮嵌套破碎）
  s = s.replace(/&quot;[\s\S]*?&quot;/g, (m) => stash('tok-string', m));
  // 标签名
  s = s.replace(/(&lt;\/?)([\w-]+)/g, (_m, p1, p2) => p1 + stash('tok-tag', p2));
  // 属性名
  s = s.replace(/([\w-]+)(=)/g, (_m, p1, p2) => stash('tok-attr', p1) + p2);

  return restore(s, store);
}

function highlightCss(code) {
  let s = escapeHtml(code);
  const store = [];
  const stash = (cls, text) => { store.push(`<span class="${cls}">${text}</span>`); return ph(store.length - 1); };

  s = s.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => stash('tok-comment', m));
  s = s.replace(/(@[\w-]+)/g, (m) => stash('tok-keyword', m));
  // 属性名: 值;
  s = s.replace(/([\w-]+)(\s*:\s*)([^;{}]+)(;)/g,
    (_m, name, sep, val, semi) => stash('tok-attr', name) + sep + stash('tok-string', val) + semi);

  return restore(s, store);
}

function highlightJs(code) {
  let s = escapeHtml(code);
  const store = [];
  const stash = (cls, text) => { store.push(`<span class="${cls}">${text}</span>`); return ph(store.length - 1); };

  // 1) 注释、字符串先抽走（避免其内部被后续规则误伤）
  s = s.replace(/(\/\/[^\n]*)/g, (m) => stash('tok-comment', m));
  // escapeHtml 后双引号已转成 &quot;，故 JS 双引号字符串需用 &quot;[\s\S]*?&quot; 提取
  s = s.replace(/('[^']*'|&quot;[\s\S]*?&quot;|`[^`]*`)/g, (m) => stash('tok-string', m));
  // 2) 函数名（标识符后紧跟左括号）
  s = s.replace(/([A-Za-z_$][\w$]*)(\s*\()/g, (_m, name, paren) => stash('tok-fn', name) + paren);
  // 3) 关键字
  s = s.replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|export|from|await|async|document|window|this)\b/g,
    (m) => stash('tok-keyword', m));
  // 4) 数字
  s = s.replace(/\b(\d+\.?\d*)\b/g, (m) => stash('tok-num', m));

  return restore(s, store);
}

// 还原占位符为对应的高亮片段（支持嵌套：函数名/关键字可能落在同一段里，
// 但因为都用占位符，还原时按索引精确替换，不会产生坏嵌套）
function restore(s, store) {
  return s.replace(/\uE000([\uE010-\uE019]+)\uE001/g, (_m, enc) => {
    const i = Number(enc.replace(/[\uE010-\uE019]/g, ch => String(ch.charCodeAt(0) - 0xE010)));
    return store[i] || '';
  });
}

// 把「可能已经过一次高亮」的内容还原成纯文本，保证多次高亮幂等，
// 不会产生 <span <span ...> 的坏嵌套。
function stripHighlight(s) {
  // 1) 去掉所有 <span class="tok-..."> 开标签与 </span> 闭标签（保留内部文字）
  let r = s.replace(/<span class="tok-[^"]*">/g, '').replace(/<\/span>/g, '');
  // 2) 还原之前被转义的符号（&lt; &gt; &amp; &quot;），交给后续高亮重新正确转义
  r = r.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return r;
}

export function highlight(code, lang) {
  // 防御：若输入里已含高亮 span，先还原为纯文本再高亮，保证幂等
  const raw = /class="tok-/.test(code) ? stripHighlight(code) : code;
  const key = lang + ' ' + raw;
  const hit = _hlCache.get(key);
  if (hit !== undefined) return hit;
  let out;
  if (lang === 'html') out = highlightHtml(raw);
  else if (lang === 'css') out = highlightCss(raw);
  else if (lang === 'js') out = highlightJs(raw);
  else out = escapeHtml(raw);
  // 上限保护：模板数量有限，正常极少触发；防止极端情况下缓存无限增长
  if (_hlCache.size > 400) _hlCache.clear();
  _hlCache.set(key, out);
  return out;
}

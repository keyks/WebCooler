// 极简代码高亮（无依赖），支持 html / css / js 基本着色
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightHtml(code) {
  let s = escapeHtml(code);
  // 注释
  s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-comment">$1</span>');
  // 标签
  s = s.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="tok-tag">$2</span>');
  // 属性
  s = s.replace(/([\w-]+)(=)(&quot;[^&]*&quot;|"[^"]*")/g,
    '<span class="tok-attr">$1</span>$2<span class="tok-string">$3</span>');
  return s;
}

function highlightCss(code) {
  let s = escapeHtml(code);
  s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tok-comment">$1</span>');
  s = s.replace(/([\w-]+)(\s*:)/g, '<span class="tok-attr">$1</span>$2');
  s = s.replace(/(:\s*)([^;{}]+)(;)/g, '$1<span class="tok-string">$2</span>$3');
  s = s.replace(/@[\w-]+/g, m => `<span class="tok-keyword">${m}</span>`);
  return s;
}

function highlightJs(code) {
  let s = escapeHtml(code);
  s = s.replace(/(\/\/[^\n]*)/g, '<span class="tok-comment">$1</span>');
  s = s.replace(/('[^']*'|"[^"]*"|`[^`]*`)/g, '<span class="tok-string">$1</span>');
  s = s.replace(/\b(const|let|var|function|return|if|else|for|while|class|new|import|export|from|await|async|document|window|this)\b/g,
    '<span class="tok-keyword">$1</span>');
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
  s = s.replace(/([\w-]+)(\s*\()/g, '<span class="tok-fn">$1</span>$2');
  return s;
}

export function highlight(code, lang) {
  if (lang === 'html') return highlightHtml(code);
  if (lang === 'css') return highlightCss(code);
  if (lang === 'js') return highlightJs(code);
  return escapeHtml(code);
}

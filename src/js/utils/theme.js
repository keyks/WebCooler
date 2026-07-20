// 深色 / 浅色主题
// localStorage 不可用时（隐私模式 / 禁用）读写需容错，避免切换主题时抛异常崩溃。
export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('webcooler_theme'); } catch (_) { saved = null; }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved ? saved === 'dark' : prefersDark;
  applyTheme(dark);
  return dark;
}
export function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  try { localStorage.setItem('webcooler_theme', dark ? 'dark' : 'light'); } catch (_) {}
}
export function toggleTheme() {
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  return dark;
}

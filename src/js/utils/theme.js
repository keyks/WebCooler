// 深色 / 浅色主题
export function initTheme() {
  const saved = localStorage.getItem('webcooler_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = saved ? saved === 'dark' : prefersDark;
  applyTheme(dark);
  return dark;
}
export function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('webcooler_theme', dark ? 'dark' : 'light');
}
export function toggleTheme() {
  const dark = !document.documentElement.classList.contains('dark');
  applyTheme(dark);
  return dark;
}

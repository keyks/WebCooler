import layouts from './layouts.js';
import effects from './effects.js';
import mouse from './mouse.js';
import keyboard from './keyboard.js';
import text from './text.js';
import components from './components.js';
import { CATEGORIES as CATS } from './categories.js';
export const CATEGORIES = CATS;

export const TEMPLATES = [
  ...layouts, ...effects, ...mouse, ...keyboard, ...text, ...components
];

export function getById(id) {
  return TEMPLATES.find(t => t.id === id);
}
export function getByCat(cat) {
  return TEMPLATES.filter(t => t.cat === cat);
}
export function search(q) {
  q = (q || '').trim().toLowerCase();
  if (!q) return TEMPLATES;
  return TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(q) ||
    (t.desc || '').toLowerCase().includes(q) ||
    (t.tags || []).some(tg => tg.toLowerCase().includes(q))
  );
}

// 首页推荐 / 热门
export const FEATURED = ['ly-grid12', 'ef-scroll-progress', 'ms-click-ripple', 'kb-enter', 'tb-typewriter', 'cp-card-3d'];
export const HOT = ['ly-waterfall', 'd3-card', 'ms-follow-particle', 'tc-gradient', 'cp-btn-ripple', 'ef-scroll-show', 'cp-prog-circle', 'tf-glitch'];

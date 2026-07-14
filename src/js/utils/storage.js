// 本地存储：收藏、历史、项目、主题
const KEY = 'webcooler_state_v1';

export function loadState() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export const store = {
  get() { return loadState(); },
  set(patch) {
    const s = loadState();
    Object.assign(s, patch);
    saveState(s);
    return s;
  },
  toggleFav(id) {
    const s = loadState();
    s.favs = s.favs || [];
    const i = s.favs.indexOf(id);
    if (i >= 0) s.favs.splice(i, 1); else s.favs.push(id);
    saveState(s);
    return s.favs;
  },
  isFav(id) {
    const s = loadState();
    return (s.favs || []).includes(id);
  },
  addHistory(id) {
    const s = loadState();
    s.history = s.history || [];
    s.history = [id, ...s.history.filter(x => x !== id)].slice(0, 50);
    saveState(s);
  },
  addProject(p) {
    const s = loadState();
    s.projects = s.projects || [];
    s.projects.unshift({ ...p, id: 'p' + Date.now(), at: Date.now() });
    saveState(s);
  }
};

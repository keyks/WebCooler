// 本地存储：收藏、历史、项目、主题
// 健壮性设计：
//  - localStorage 可能在隐私模式 / 配额超限 / 被禁用时抛异常，若裸调用会让
//    「收藏」「历史」等交互直接崩溃；这里统一 try/catch，并在不可用时退化为
//    内存对象，保证应用持续可用。
//  - 解析缓存：避免每次 get / isFav 都重复 JSON.parse 同一份小数据。
const KEY = 'webcooler_state_v1';

let _cache = null;  // 已解析状态缓存（首次读取后复用）
let _mem = null;    // 内存兜底：写入失败时仍保留最后状态，保证后续读取一致

function _read() {
  if (_cache) return _cache;
  let obj = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) obj = JSON.parse(raw);
  } catch (_) { obj = null; }
  if (!obj) obj = _mem ? { ..._mem } : {};
  _cache = obj;
  return obj;
}

function _write(state) {
  _cache = state;             // 同步解析缓存
  _mem = { ...state };        // 同步内存兜底
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (_) {
    // 写入失败（配额/隐私模式/禁用）：静默降级到内存，不向上抛错
  }
}

export function loadState() { return _read(); }
export function saveState(state) { _write(state); }

export const store = {
  get() { return _read(); },
  set(patch) {
    const s = { ..._read(), ...patch };
    _write(s);
    return s;
  },
  toggleFav(id) {
    const s = _read();
    s.favs = s.favs || [];
    const i = s.favs.indexOf(id);
    if (i >= 0) s.favs.splice(i, 1); else s.favs.push(id);
    _write(s);
    return s.favs;
  },
  isFav(id) {
    const s = _read();
    return (s.favs || []).includes(id);
  },
  addHistory(id) {
    const s = _read();
    s.history = s.history || [];
    s.history = [id, ...s.history.filter(x => x !== id)].slice(0, 50);
    _write(s);
  },
  addProject(p) {
    const s = _read();
    s.projects = s.projects || [];
    s.projects.unshift({ ...p, id: 'p' + Date.now(), at: Date.now() });
    _write(s);
  }
};

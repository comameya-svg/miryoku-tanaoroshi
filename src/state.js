// 保存データの生成・正規化・更新（純粋関数。常に新しいオブジェクトを返す）
import { THEMES, MAX_CELL, MAX_CENTER, MAX_WHO, PATTERNS } from './config.js';

export function clampText(value, max) {
  if (typeof value !== 'string') return '';
  return Array.from(value.trim()).slice(0, max).join('');
}

export function createEmpty() {
  const cells = {};
  for (const t of THEMES) cells[t.id] = Array(8).fill('');
  return { v: 1, center: '', cells, mix: { m: null, k: null, who: '', pattern: 0 }, card: { showText: false }, savedAt: null };
}

function normalizePick(pick, kind) {
  if (!pick || typeof pick !== 'object') return null;
  const theme = THEMES.find((t) => t.id === pick.t && t.kind === kind);
  if (!theme || !Number.isInteger(pick.i) || pick.i < 0 || pick.i > 7) return null;
  return { t: theme.id, i: pick.i };
}

export function normalize(raw) {
  const base = createEmpty();
  if (!raw || typeof raw !== 'object') return base;
  base.center = clampText(raw.center, MAX_CENTER);
  const cells = raw.cells && typeof raw.cells === 'object' ? raw.cells : {};
  for (const t of THEMES) {
    const arr = Array.isArray(cells[t.id]) ? cells[t.id] : [];
    base.cells[t.id] = Array.from({ length: 8 }, (_, i) => clampText(arr[i], MAX_CELL));
  }
  const mix = raw.mix && typeof raw.mix === 'object' ? raw.mix : {};
  base.mix.m = normalizePick(mix.m, 'miryoku');
  base.mix.k = normalizePick(mix.k, 'kadai');
  base.mix.who = clampText(mix.who, MAX_WHO);
  base.mix.pattern = Number.isInteger(mix.pattern) && mix.pattern >= 0 && mix.pattern < PATTERNS.length ? mix.pattern : 0;
  base.card.showText = !!(raw.card && raw.card.showText === true);
  base.savedAt = typeof raw.savedAt === 'string' ? raw.savedAt : null;
  // 選ばれているマスが空になっていたら選択を外す
  if (base.mix.m && !base.cells[base.mix.m.t][base.mix.m.i]) base.mix.m = null;
  if (base.mix.k && !base.cells[base.mix.k.t][base.mix.k.i]) base.mix.k = null;
  return base;
}

export function setCenter(state, value) {
  return normalize({ ...state, center: value });
}

export function setCell(state, themeId, index, value) {
  if (!state.cells[themeId] || index < 0 || index > 7) return state;
  const cells = { ...state.cells, [themeId]: state.cells[themeId].map((v, i) => (i === index ? value : v)) };
  return normalize({ ...state, cells });
}

export function setMix(state, patch) {
  return normalize({ ...state, mix: { ...state.mix, ...patch } });
}

export function setShowText(state, showText) {
  return normalize({ ...state, card: { showText } });
}

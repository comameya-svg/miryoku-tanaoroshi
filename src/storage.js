// localStorage アダプタ。例外は投げずに結果値で返す（FR-STORE-001〜004）
import { STORAGE_KEY } from './config.js';
import { normalize, createEmpty } from './state.js';

export function load(storage) {
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return { ok: true, state: createEmpty(), restored: false };
    return { ok: true, state: normalize(JSON.parse(text)), restored: true };
  } catch (e) {
    return { ok: false, state: createEmpty(), restored: false };
  }
}

export function save(storage, state, now = () => new Date().toISOString()) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: now() }));
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

export function clear(storage) {
  try {
    storage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

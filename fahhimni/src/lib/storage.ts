import type { Progress } from '../types';

const KEY = 'fahhimni:v1';

interface Saved {
  progress: Progress | null;
  /** المهمات المنجزة: معرّف المهمة ← اللقب الذي حصل عليه الفضائي */
  completed: Record<string, string>;
  /** دليل الفضائي: معرّف المهمة ← ما انشرح فيها */
  guideBook: Record<string, string[]>;
}

const EMPTY: Saved = { progress: null, completed: {}, guideBook: {} };

export function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const data = JSON.parse(raw);
    const progress = data?.progress;
    const valid = progress && typeof progress.missionId === 'string' && Array.isArray(progress.messages) && Array.isArray(progress.guide);
    return {
      progress: valid ? progress : null,
      completed: data?.completed && typeof data.completed === 'object' ? data.completed : {},
      guideBook: data?.guideBook && typeof data.guideBook === 'object' ? data.guideBook : {},
    };
  } catch {
    return EMPTY;
  }
}

export function save(data: Saved) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* التخزين ممتلئ أو معطّل: اللعبة تكمل بدون حفظ */
  }
}

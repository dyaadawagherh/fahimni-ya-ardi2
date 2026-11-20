import type { Message, Mode, TurnResponse } from '../types';

export class ApiError extends Error {}

const FALLBACK = 'انقطع الإرسال بين الأرض والمركبة. جرّب كمان مرة.';

export async function fetchMode(): Promise<Mode | null> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return null;
    const data = await res.json();
    return data.mode === 'live' ? 'live' : 'demo';
  } catch {
    return null;
  }
}

/** يرسل تاريخ المهمة كاملاً مع كل سؤال؛ الخادم لا يحتفظ بأي حالة. */
export async function sendTurn(missionId: string, history: Message[]): Promise<TurnResponse> {
  let res: Response;
  try {
    res = await fetch('/api/turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionId, history: history.map(({ role, text }) => ({ role, text })) }),
    });
  } catch {
    throw new ApiError(FALLBACK);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.reply) throw new ApiError(body?.error || FALLBACK);
  return body as TurnResponse;
}

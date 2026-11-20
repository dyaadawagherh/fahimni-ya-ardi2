// الاتصال بخدمة الذكاء الاصطناعي عبر واجهة ‎/chat/completions‎ المتوافقة مع OpenAI.
// المفتاح يُقرأ من متغيرات البيئة هنا فقط ولا يصل للمتصفح.

const BASE_URL = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const API_KEY = process.env.AI_API_KEY || '';
const MODEL = process.env.AI_MODEL || '';

export const aiConfigured = Boolean(API_KEY && MODEL);

// بعض النماذج الأحدث ترفض max_tokens وتطلب max_completion_tokens؛ نبدّل الاسم مرة واحدة إن لزم.
let tokenParam = 'max_tokens';

function extractJson(content) {
  const text = Array.isArray(content) ? content.map((p) => p?.text || '').join('') : String(content || '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('no JSON object in model output');
  return JSON.parse(text.slice(start, end + 1));
}

async function request(messages, maxTokens) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, messages, [tokenParam]: maxTokens }),
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    if (res.status === 400 && tokenParam === 'max_tokens' && detail.includes('max_completion_tokens')) {
      tokenParam = 'max_completion_tokens';
      return request(messages, maxTokens);
    }
    throw new Error(`AI service responded ${res.status}: ${detail}`);
  }
  const data = await res.json();
  return extractJson(data.choices?.[0]?.message?.content);
}

// يحاول مرتين: النماذج أحياناً تُخرج JSON ناقصاً أو يفشل التحقق من شكله.
export async function askModel(messages, maxTokens, shape) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return shape(await request(messages, maxTokens));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

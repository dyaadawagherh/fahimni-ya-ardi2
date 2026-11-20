// «فهّمني يا أرضي!» — الخادم: يقدّم الواجهة ويستدعي خدمة الذكاء الاصطناعي.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile(path.join(root, '.env'));
} catch {
  /* لا يوجد ملف .env: نعتمد على متغيرات البيئة أو وضع العرض */
}

// الاستيراد بعد تحميل .env لأن ai.js يقرأ المتغيرات عند التحميل.
const { MISSIONS, ROUNDS, MAX_QUESTION } = await import('../shared/missions.js');
const { buildSystemPrompt } = await import('./prompt.js');
const { shapeTurn, shapeReport } = await import('./shape.js');
const { aiConfigured, askModel } = await import('./ai.js');
const { demoTurn } = await import('./demo.js');

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const MAX_REPLY = 700;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

// حدّ بسيط للطلبات لكل عنوان حتى لا يُستنزف المفتاح.
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  if (hits.size > 5000) hits.clear();
  const entry = hits.get(req.ip);
  if (!entry || now > entry.reset) {
    hits.set(req.ip, { count: 1, reset: now + 60_000 });
    return next();
  }
  if (++entry.count > 30) {
    return res.status(429).json({ error: 'شوي شوي يا صاحبي! أبو الجود بدّه يشرب فنجان قهوة. جرّب بعد دقيقة.' });
  }
  next();
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// تاريخ المهمة القادم من المتصفح: فضائي، أردني، فضائي… وينتهي دائماً برسالة الفضائي.
function parseTurn(body) {
  const mission = MISSIONS.find((m) => m.id === body?.missionId);
  const history = body?.history;
  if (!mission || !Array.isArray(history)) return null;
  if (history.length < 1 || history.length > ROUNDS * 2 - 1 || history.length % 2 === 0) return null;

  const alienTexts = [];
  const jordanianTexts = [];
  for (let i = 0; i < history.length; i++) {
    const isAlien = i % 2 === 0;
    if (history[i]?.role !== (isAlien ? 'alien' : 'jordanian')) return null;
    const text = clean(history[i].text, isAlien ? MAX_QUESTION : MAX_REPLY);
    if (!text) return null;
    (isAlien ? alienTexts : jordanianTexts).push(text);
  }
  return { mission, alienTexts, jordanianTexts, round: alienTexts.length };
}

const wrapAlien = (text) => `<alien_message>${text.replace(/<\/?\s*alien_message\s*>/gi, '')}</alien_message>`;

function buildMessages({ mission, alienTexts, jordanianTexts, round }) {
  const messages = [{ role: 'system', content: buildSystemPrompt(mission, round) }];
  alienTexts.forEach((text, i) => {
    messages.push({ role: 'user', content: wrapAlien(text) });
    if (jordanianTexts[i]) messages.push({ role: 'assistant', content: JSON.stringify({ reply: jordanianTexts[i] }) });
  });
  return messages;
}

app.get('/api/config', (_req, res) => {
  res.json({ mode: aiConfigured ? 'live' : 'demo' });
});

app.post('/api/turn', rateLimit, async (req, res) => {
  const turn = parseTurn(req.body);
  if (!turn) return res.status(400).json({ error: 'طلب غير صالح.' });

  if (!aiConfigured) {
    return res.json({ mode: 'demo', ...demoTurn(turn.mission, turn.round, turn.alienTexts, turn.jordanianTexts) });
  }

  const isFinal = turn.round >= ROUNDS;
  try {
    const out = await askModel(buildMessages(turn), isFinal ? 1400 : 500, (raw) => {
      const shaped = shapeTurn(raw);
      if (isFinal) {
        shaped.report = shapeReport(raw.report, {
          jordanianTexts: [...turn.jordanianTexts, shaped.reply],
          alienTexts: turn.alienTexts,
        });
      }
      return shaped;
    });
    res.json({ mode: 'live', canned: false, ...out });
  } catch (err) {
    console.error('[turn failed]', err?.message || err);
    res.status(502).json({ error: 'انقطع الإرسال بين الأرض والمركبة. جرّب كمان مرة.' });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'مش موجود.' }));

if (isProd) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { maxAge: '1h', index: false }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed' || err?.type === 'entity.too.large') {
    return res.status(400).json({ error: 'طلب غير صالح.' });
  }
  console.error(err);
  res.status(500).json({ error: 'صار خلل بالخادم.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`«فهّمني يا أرضي!» شغّال على http://localhost:${PORT}`);
  console.log(aiConfigured ? 'الوضع: ذكاء اصطناعي حي.' : 'الوضع: عرض تجريبي (AI_API_KEY أو AI_MODEL غير معرّف).');
});

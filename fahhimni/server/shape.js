import { EXPRESSIONS, ALIEN_MOODS, PERSUASIONS } from './prompt.js';

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const oneOf = (v, list, fallback) => (list.includes(v) ? v : fallback);
const norm = (s) => s.replace(/[«»"'“”‘’]/g, '').replace(/\s+/g, ' ').trim();
const stripQuotes = (s) => s.replace(/^[«"“'\s]+|[»"”'\s]+$/g, '');

// يقصّ الرد الطويل عند آخر نهاية جملة حتى لا تنقطع الفكرة بالنص.
function clampReply(text, max = 560) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('!'), cut.lastIndexOf('؟'), cut.lastIndexOf('…'));
  return end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

function sentences(text) {
  return text
    .split(/(?<=[.!؟?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

const isVerbatim = (quote, sources) => quote.length > 3 && sources.some((s) => norm(s).includes(norm(quote)));

function longest(list, max = 180) {
  const pick = list.reduce((a, b) => (b.length > a.length ? b : a), '');
  return pick.length > max ? pick.slice(0, max).replace(/\s+\S*$/, '') + '…' : pick;
}

export function shapeTurn(raw) {
  const reply = clampReply(str(raw?.reply, 2000));
  if (!reply) throw new Error('empty reply');
  return {
    reply,
    expression: oneOf(raw.expression, EXPRESSIONS, 'explaining'),
    alienMood: oneOf(raw.alienMood, ALIEN_MOODS, 'curious'),
    guide: str(raw.guide, 140),
  };
}

// التقرير لازم يقتبس من كلام حقيقي: إذا اخترع النموذج اقتباساً نستبدله بجملة فعلية من الحوار.
export function shapeReport(raw, { jordanianTexts, alienTexts }) {
  if (!raw || typeof raw !== 'object') throw new Error('missing report');
  const title = str(raw.title, 60);
  if (!title) throw new Error('incomplete report');

  let bestExplanation = stripQuotes(str(raw.bestExplanation, 400));
  if (!isVerbatim(bestExplanation, jordanianTexts)) {
    bestExplanation = longest(jordanianTexts.flatMap(sentences));
  }

  let funniestReaction = stripQuotes(str(raw.funniestReaction, 400));
  if (!isVerbatim(funniestReaction, alienTexts)) {
    funniestReaction = longest(alienTexts);
  }

  const score = Math.round(Number(raw.score));
  const learned = Array.isArray(raw.learned)
    ? raw.learned.map((x) => str(x, 160)).filter(Boolean).slice(0, 3)
    : [];

  return {
    score: Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 60,
    scoreLabel: str(raw.scoreLabel, 60) || 'شرح على الأصول',
    scoreReason: str(raw.scoreReason, 240),
    persuasion: oneOf(raw.persuasion, PERSUASIONS, 'not_convinced'),
    persuasionReason: str(raw.persuasionReason, 240),
    bestExplanation,
    funniestReaction,
    title,
    learned,
    unexplained: str(raw.unexplained, 240),
  };
}

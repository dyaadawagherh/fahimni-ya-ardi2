import { useEffect, useMemo, useState } from 'react';
import { animate, motion } from 'framer-motion';
import type { Mission } from '../../shared/missions.js';
import { JORDANIAN_NAME, PERSUASION } from '../data';
import type { Mode, Report as ReportData } from '../types';
import Character from './Character';
import { CopyIcon, RestartIcon, ShareIcon, StarIcon } from './icons';

interface Props {
  mission: Mission;
  report: ReportData;
  mode: Mode;
  onRestart: () => void;
  onPickAnother: () => void;
}

const REPORT_TITLE = 'تقرير المهمة: هل فهم الفضائي أهل الأردن؟';
const NOTHING_LEFT = 'ولا إشي! الفضائي طلع فاهم كل شي.';

function toText(mission: Mission, report: ReportData) {
  return [
    REPORT_TITLE,
    `المهمة: ${mission.title}`,
    `اللقب: ${report.title}`,
    `درجة الفهم: ${report.score} من 100 — ${report.scoreLabel}`,
    `مستوى الاقتناع: ${PERSUASION[report.persuasion].text}`,
    `أحسن شرح أردني: "${report.bestExplanation}"`,
    `أطرف ردّة فعل من الفضائي: "${report.funniestReaction}"`,
    'شو تعلّم الفضائي:',
    ...report.learned.map((item, i) => `${i + 1}. ${item}`),
    `اللي ضل بدون تفسير: ${report.unexplained || NOTHING_LEFT}`,
    '— فهّمني يا أرضي!',
  ].join('\n');
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // متصفحات قديمة أو صفحة بدون صلاحية الحافظة
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

// نجوم الاحتفال: اتجاهات ثابتة حول اللقب
const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const distance = 90 + (i % 3) * 38;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, color: ['#FFD166', '#48D6CB', '#A78BFA', '#C92838'][i % 4], size: 12 + (i % 3) * 5 };
});

export default function Report({ mission, report, mode, onRestart, onPickAnother }: Props) {
  const [notice, setNotice] = useState('');
  const verdict = PERSUASION[report.persuasion];
  const text = useMemo(() => toText(mission, report), [mission, report]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(id);
  }, [notice]);

  async function copy() {
    setNotice((await copyText(text)) ? 'انتسخ التقرير' : 'ما قدرنا ننسخ. انسخه يدوياً.');
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: REPORT_TITLE, text });
      } catch (err) {
        // المستخدم سكّر نافذة المشاركة: مش خطأ
        if ((err as DOMException)?.name !== 'AbortError') await copy();
      }
      return;
    }
    setNotice((await copyText(text)) ? 'انتسخ التقرير — الصقه وين ما بدك تشاركه' : 'المشاركة مش مدعومة على هالمتصفح.');
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <header className="text-center">
        <span className="chip border border-white/15 bg-white/10 text-white/80">
          المهمة {mission.number}: {mission.title}
        </span>
        <h1 className="mt-3 text-balance text-2xl font-black leading-[1.4] sm:text-4xl sm:leading-[1.35]">{REPORT_TITLE}</h1>
      </header>

      <div className="mx-auto mt-2 grid max-w-md grid-cols-2 items-end">
        <Character who="jordanian" state="proud" className="mx-auto w-[82%]" />
        <Character who="alien" state={verdict.mood} className="mx-auto w-[66%]" />
      </div>

      <motion.article
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative -mt-3 overflow-hidden rounded-3xl bg-cream text-ink shadow-card"
      >
        <div className="shemagh h-3" aria-hidden />

        {/* اللقب */}
        <section className="relative px-5 pb-5 pt-6 text-center">
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden>
            {BURST.map((star, i) => (
              <motion.span
                key={i}
                className="absolute"
                style={{ color: star.color }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: star.x, y: star.y, scale: [0, 1.2, 0.6], opacity: [1, 1, 0], rotate: 160 }}
                transition={{ duration: 1.3, delay: 0.45 + (i % 4) * 0.05, ease: 'easeOut' }}
              >
                <StarIcon width={star.size} height={star.size} />
              </motion.span>
            ))}
          </div>
          <p className="text-xs font-extrabold text-ink/60">لقبك الفضائي الجديد</p>
          <motion.h2
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.4 }}
            className="mt-1 text-balance text-2xl font-black leading-[1.5] text-jred sm:text-3xl"
          >
            {report.title}
          </motion.h2>
        </section>

        <div className="grid gap-3 px-4 sm:grid-cols-2 sm:px-5">
          {/* أ: درجة الفهم */}
          <section className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <ScoreRing score={report.score} />
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-ink/60">درجة فهم الفضائي</h3>
              <p className="text-base font-black leading-7">{report.scoreLabel}</p>
              <p className="text-[13px] leading-6 text-ink/75">{report.scoreReason}</p>
            </div>
          </section>

          {/* ب: مستوى الاقتناع */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-ink/60">مستوى الاقتناع</h3>
            <motion.p
              initial={{ scale: 1.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.9 }}
              className="mt-2 rounded-xl border-[3px] border-dashed px-3 py-2 text-center text-base font-black leading-7"
              style={{ color: verdict.color, borderColor: verdict.color }}
            >
              {verdict.text}
            </motion.p>
            <p className="mt-2 text-[13px] leading-6 text-ink/75">{report.persuasionReason}</p>
          </section>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          {/* ج: أحسن شرح */}
          <section className="flex overflow-hidden rounded-2xl bg-white shadow-sm">
            <span className="shemagh w-2 shrink-0" aria-hidden />
            <div className="p-4">
              <h3 className="text-xs font-extrabold text-jred">أحسن شرح أردني — من حكي {JORDANIAN_NAME}</h3>
              <blockquote className="mt-1 text-[15px] font-bold leading-7">{report.bestExplanation}</blockquote>
            </div>
          </section>

          {/* د: أطرف ردّة فعل */}
          <section className="rounded-2xl bg-[#D9F7F3] p-4">
            <h3 className="text-xs font-extrabold text-[#12776E]">أطرف ردّة فعل منك يا فضائي</h3>
            <blockquote className="mt-1 text-[15px] font-bold leading-7">{report.funniestReaction}</blockquote>
          </section>

          {/* و: ثلاث أشياء تعلّمها */}
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-ink/60">ثلاث أشياء تعلّمها الفضائي</h3>
            <ol className="mt-2 space-y-2">
              {report.learned.map((item, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-7">
                  <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-space text-xs font-black text-white">{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ز: ما بقي بدون تفسير */}
          <section className="rounded-2xl border-2 border-dashed border-ink/25 p-4">
            <h3 className="text-xs font-extrabold text-ink/60">اللي ضل بدون تفسير</h3>
            <p className="mt-1 text-[14px] leading-7">{report.unexplained || NOTHING_LEFT}</p>
          </section>

          {mode === 'demo' && (
            <p className="rounded-xl bg-ink/[0.07] px-3 py-2 text-center text-xs leading-6 text-ink/70">
              وضع العرض التجريبي: الاقتباسان مأخوذان من حوارك فعلاً، أما الدرجة والحكم واللقب فثابتة لهذه المهمة وليست تقييم ذكاء اصطناعي.
            </p>
          )}
        </div>
      </motion.article>

      <div className="mt-6 grid grid-cols-2 gap-3 [&>button]:whitespace-nowrap [&>button]:px-3 [&>button]:text-[15px]">
        <button className="btn-primary" onClick={() => void share()}>
          <ShareIcon />
          مشاركة
        </button>
        <button className="btn-ghost" onClick={() => void copy()}>
          <CopyIcon />
          نسخ التقرير
        </button>
        <button className="btn-ghost" onClick={onRestart}>
          <RestartIcon />
          إعادة المهمة
        </button>
        <button className="btn-turq" onClick={onPickAnother}>
          مهمة ثانية
        </button>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4" role="status" aria-live="polite">
        {notice && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-ink shadow-card"
          >
            {notice}
          </motion.p>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [shown, setShown] = useState(0);
  const radius = 34;
  const length = 2 * Math.PI * radius;

  useEffect(() => {
    const controls = animate(0, score, { duration: 1.2, delay: 0.5, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [score]);

  return (
    <div className="relative h-[84px] w-[84px] shrink-0" role="img" aria-label={`${score} من 100`}>
      <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="#231B4518" strokeWidth="9" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="#7655D9"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - shown / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-2xl font-black">{shown}</span>
    </div>
  );
}

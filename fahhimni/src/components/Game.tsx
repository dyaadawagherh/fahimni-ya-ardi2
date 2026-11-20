import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MAX_QUESTION, ROUND_INFO, ROUNDS, type Mission } from '../../shared/missions.js';
import { ALIEN, JORDANIAN, JORDANIAN_NAME, MISSION_ART } from '../data';
import { ApiError, sendTurn } from '../lib/api';
import { play } from '../lib/sound';
import type { AlienMood, Expression, Message, Mode, Progress, Report } from '../types';
import Character from './Character';
import { GUIDE_TITLE, GuideList } from './Guide';
import { BackIcon, BookIcon, SendIcon, SoundOffIcon, SoundOnIcon, StarIcon } from './icons';

interface Props {
  mission: Mission;
  mode: Mode | null;
  initial: Progress | null;
  soundOn: boolean;
  guideCount: number;
  onToggleSound: () => void;
  onOpenGuide: () => void;
  onProgress: (progress: Progress) => void;
  onFinish: () => void;
  onExit: () => void;
}

type Status = 'idle' | 'loading' | 'error';

const THINKING_MS = 800;
const RESUME_ERROR = 'سؤالك الأخير ما وصل لأبو الجود. ابعثه كمان مرة.';

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return match;
}

export default function Game({ mission, mode: initialMode, initial, soundOn, guideCount, onToggleSound, onOpenGuide, onProgress, onFinish, onExit }: Props) {
  const [messages, setMessages] = useState<Message[]>(
    () => initial?.messages ?? [{ role: 'jordanian', text: mission.intro, expression: 'welcoming' }],
  );
  const [guide, setGuide] = useState<string[]>(() => initial?.guide ?? []);
  const [alienMood, setAlienMood] = useState<AlienMood>(() => initial?.alienMood ?? 'curious');
  const [report, setReport] = useState<Report | null>(() => initial?.report ?? null);
  const [mode, setMode] = useState<Mode | null>(() => initial?.mode ?? initialMode);
  const [status, setStatus] = useState<Status>(() => (initial?.messages[initial.messages.length - 1]?.role === 'alien' ? 'error' : 'idle'));
  const [errorMsg, setErrorMsg] = useState(RESUME_ERROR);
  const [input, setInput] = useState('');

  const isDesktop = useIsDesktop();
  const alive = useRef(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialMode && !mode) setMode(initialMode);
  }, [initialMode, mode]);

  useEffect(() => {
    if (mode) onProgress({ missionId: mission.id, messages, guide, alienMood, report, mode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, guide, alienMood, report, mode]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, status, report]);

  const last = messages[messages.length - 1];
  const asked = messages.filter((m) => m.role === 'alien').length;
  const answered = messages.filter((m) => m.role === 'jordanian').length - 1;
  const round = Math.min(last.role === 'jordanian' ? asked + 1 : asked, ROUNDS);
  const info = ROUND_INFO[round - 1];
  const accent = MISSION_ART[mission.id].accent;

  const lastJordanian = [...messages].reverse().find((m) => m.role === 'jordanian');
  const expression: Expression = status === 'loading' ? 'thinking' : status === 'error' ? 'confused' : (lastJordanian?.expression ?? 'welcoming');
  const mood: AlienMood = status === 'loading' ? 'curious' : status === 'error' ? 'confused' : alienMood;

  async function request(history: Message[]) {
    setStatus('loading');
    try {
      const [res] = await Promise.all([sendTurn(mission.id, history.slice(1)), new Promise((r) => setTimeout(r, THINKING_MS))]);
      if (!alive.current) return;
      setMessages([...history, { role: 'jordanian', text: res.reply, expression: res.expression, canned: res.canned }]);
      setAlienMood(res.alienMood);
      setMode(res.mode);
      if (res.guide) setGuide((g) => [...g, res.guide]);
      if (res.report) setReport(res.report);
      setStatus('idle');
      play(res.report ? 'complete' : 'receive');
    } catch (err) {
      if (!alive.current) return;
      setErrorMsg(err instanceof ApiError ? err.message : 'صار خلل غير متوقع. جرّب كمان مرة.');
      setStatus('error');
    }
  }

  function ask(text: string) {
    const question = text.trim().slice(0, MAX_QUESTION);
    if (!question || status !== 'idle' || report || asked >= ROUNDS) return;
    const next: Message[] = [...messages, { role: 'alien', text: question }];
    setMessages(next);
    setInput('');
    play('send');
    void request(next);
  }

  const canAsk = status === 'idle' && !report;
  const suggestions = canAsk ? (mission.suggestions[round - 1] ?? []) : [];

  const stageJordanian = (size: string) => (
    <div className="flex flex-col items-center">
      <Character who="jordanian" state={expression} className={size} />
      <span className="chip -mt-1 border border-sand/40 bg-night/80 text-sand" aria-live="polite">
        {JORDANIAN_NAME} · {JORDANIAN[expression].label}
      </span>
    </div>
  );
  const stageAlien = (size: string) => (
    <div className="flex flex-col items-center">
      <Character who="alien" state={mood} className={size} />
      <span className="chip -mt-1 border border-turq/40 bg-night/80 text-turq" aria-live="polite">
        إنت · {ALIEN[mood].label}
      </span>
    </div>
  );

  return (
    <div className="mx-auto flex h-[100dvh] max-w-6xl flex-col px-3 pb-3 pt-3 sm:px-5">
      {/* الشريط العلوي */}
      <header className="flex items-center gap-2">
        <button className="icon-btn" onClick={onExit} aria-label="رجوع لقائمة المهمات">
          <BackIcon />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-white/60">المهمة {mission.number}</p>
          <h1 className="truncate text-base font-black leading-6 sm:text-xl">{mission.title}</h1>
        </div>
        <button className="icon-btn relative" onClick={onOpenGuide} aria-label={`${GUIDE_TITLE} (${guideCount})`}>
          <BookIcon />
          {guideCount > 0 && (
            <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-turq px-1 text-[11px] font-black text-night">
              {guideCount}
            </span>
          )}
        </button>
        <button className="icon-btn" onClick={onToggleSound} aria-label={soundOn ? 'اطفي الصوت' : 'شغّل الصوت'} aria-pressed={soundOn}>
          {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
      </header>

      {/* الجولة والتقدّم */}
      <div className="mt-2.5 flex items-center gap-3">
        <p className="shrink-0 text-sm font-extrabold">
          الجولة {round} من {ROUNDS}
          <span className="ms-2 font-bold" style={{ color: accent }}>
            {report ? 'خلصت المهمة' : info.name}
          </span>
        </p>
        <div className="flex flex-1 gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={ROUNDS} aria-valuenow={answered} aria-label="تقدّم المهمة">
          {Array.from({ length: ROUNDS }, (_, i) => (
            <div key={i} className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ background: accent }}
                initial={false}
                animate={{ width: i < answered ? '100%' : i === answered && !report ? '35%' : '0%', opacity: i < answered ? 1 : 0.55 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          ))}
        </div>
      </div>

      {mode === 'demo' && (
        <p className="mt-2 rounded-xl border border-sand/30 bg-sand/10 px-3 py-1.5 text-center text-[11px] font-bold leading-5 text-sand sm:text-xs">
          وضع العرض التجريبي: الردود مكتوبة مسبقاً وليست ذكاءً اصطناعياً. اختار من الأسئلة المقترحة لتحصل على رد مطابق.
        </p>
      )}

      <div className="mt-2 flex min-h-0 flex-1 gap-4">
        {/* سطح المكتب: أبو الجود */}
        {isDesktop && <aside className="flex w-64 shrink-0 flex-col items-center justify-center xl:w-72">{stageJordanian('w-64 xl:w-72')}</aside>}

        <main className="panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* الجوال: الشخصيتان فوق المحادثة */}
          {!isDesktop && (
            <div className="flex shrink-0 items-end justify-between border-b border-white/10 px-3 pb-2 pt-1">
              {stageJordanian('w-[104px] sm:w-32')}
              <span className="pb-6 text-xs font-bold text-white/40">يشرح لـ</span>
              {stageAlien('w-[88px] sm:w-28')}
            </div>
          )}

          {/* المحادثة */}
          <div className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <Bubble key={i} message={m} />
            ))}
            {status === 'loading' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-ss-md bg-cream px-4 py-3.5" aria-label="أبو الجود بيفكّر">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="typing-dot h-2 w-2 rounded-full bg-ink/70" style={{ animationDelay: `${d * 0.18}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mx-auto flex max-w-sm flex-col items-center gap-2 rounded-2xl border border-jred/50 bg-jred/15 p-3 text-center"
              >
                <p className="text-sm leading-6">{errorMsg}</p>
                <button className="btn-sand px-4 py-2 text-sm" onClick={() => void request(messages)}>
                  جرّب كمان مرة
                </button>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>

          {/* منطقة الإدخال */}
          <div className="shrink-0 border-t border-white/10 bg-night/50 p-3">
            {report ? (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-2 py-1 text-center">
                <p className="flex items-center gap-1.5 text-sm font-bold text-sand">
                  <StarIcon width={16} height={16} />
                  خلصت الجولات الثلاث. تقريرك جاهز!
                </p>
                <button className="btn-primary w-full max-w-sm" onClick={onFinish}>
                  اعرض تقرير المهمة
                </button>
              </motion.div>
            ) : (
              <>
                <p className="mb-2 text-xs font-bold text-white/65">
                  <span style={{ color: accent }}>{info.name}:</span> {info.hint}
                </p>
                <AnimatePresence mode="popLayout">
                  {suggestions.length > 0 && (
                    <motion.div
                      key={round}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="no-scrollbar -mx-3 mb-2.5 flex gap-2 overflow-x-auto px-3 lg:flex-wrap lg:overflow-visible"
                    >
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => ask(s)}
                          className="max-w-[78%] shrink-0 rounded-2xl border border-turq/40 bg-turq/10 px-3 py-2 text-start text-[13px] font-bold leading-5 text-turq transition-colors hover:bg-turq/20 sm:max-w-xs lg:max-w-none lg:shrink"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <form
                  className="flex items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(input);
                  }}
                >
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          ask(input);
                        }
                      }}
                      rows={input.length > 44 || input.includes('\n') ? 2 : 1}
                      maxLength={MAX_QUESTION}
                      disabled={!canAsk}
                      placeholder={status === 'loading' ? 'أبو الجود بيفكّر…' : 'اكتب سؤالك يا فضائي…'}
                      aria-label="سؤالك لأبو الجود"
                      className="block w-full resize-none rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] leading-6 text-white placeholder:text-white/45 disabled:opacity-50"
                    />
                    {input.length > MAX_QUESTION - 60 && (
                      <span className="absolute bottom-1 end-3 text-[10px] font-bold text-white/50">
                        {input.length} / {MAX_QUESTION}
                      </span>
                    )}
                  </div>
                  <button type="submit" className="btn-turq h-12 w-12 shrink-0 !px-0" disabled={!canAsk || !input.trim()} aria-label="ابعث السؤال">
                    <SendIcon className="-scale-x-100" />
                  </button>
                </form>
              </>
            )}
          </div>
        </main>

        {/* سطح المكتب: الفضائي + دليل هذه المهمة */}
        {isDesktop && (
          <aside className="flex w-64 shrink-0 flex-col items-center gap-4 xl:w-72">
            <div className="flex flex-1 items-center">{stageAlien('w-48 xl:w-56')}</div>
            <section className="panel flex max-h-[42%] w-full flex-col p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-turq">
                <BookIcon width={16} height={16} />
                {GUIDE_TITLE}
              </h2>
              <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
                {guide.length ? (
                  <GuideList items={guide} accent={accent} />
                ) : (
                  <p className="text-xs leading-6 text-white/55">كل شرح من أبو الجود بينكتب هون كملاحظة بدفترك الفضائي.</p>
                )}
              </div>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isAlien = message.role === 'alien';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`flex flex-col ${isAlien ? 'items-end' : 'items-start'}`}
    >
      <span className={`mb-1 px-1 text-[11px] font-extrabold ${isAlien ? 'text-turq' : 'text-sand'}`}>{isAlien ? 'إنت' : JORDANIAN_NAME}</span>
      {isAlien ? (
        <p className="max-w-[86%] whitespace-pre-wrap break-words rounded-2xl rounded-se-md bg-turq px-4 py-2.5 text-[15px] font-bold leading-7 text-night sm:max-w-[75%]">
          {message.text}
        </p>
      ) : (
        <div className="flex max-w-[90%] overflow-hidden rounded-2xl rounded-ss-md bg-cream text-ink shadow-lg sm:max-w-[80%]">
          <span className="shemagh w-2 shrink-0" aria-hidden />
          <div className="px-3.5 py-2.5">
            <p className="whitespace-pre-wrap break-words text-[15px] leading-7">{message.text}</p>
            {message.canned && (
              <span className="mt-1.5 inline-block rounded-md bg-ink/10 px-2 py-0.5 text-[10px] font-bold text-ink/70">
                رد جاهز من وضع العرض — مش جواب على سؤالك بالضبط
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

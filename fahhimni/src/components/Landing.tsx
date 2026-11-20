import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Character from './Character';
import { SoundOffIcon, SoundOnIcon } from './icons';
import type { AlienMood, Expression, Mode } from '../types';

interface Props {
  mode: Mode | null;
  hasProgress: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onStart: () => void;
  onResume: () => void;
}

const STEPS = [
  {
    n: 1,
    title: 'اختار مهمتك',
    text: 'ست عادات أردنية محيّرة: من فنجان القهوة لجروب الجامعة.',
    color: '#48D6CB',
  },
  {
    n: 2,
    title: 'اسأل وتحدّى',
    text: 'ثلاث جولات: اسأل ليش، دوّر على التناقض، واختبره بموقف من خيالك.',
    color: '#A78BFA',
  },
  {
    n: 3,
    title: 'استلم التقرير',
    text: 'هل اقتنعت؟ بتاخذ لقب فضائي، أحسن شرح انحكى، وأطرف ردّة فعل منك.',
    color: '#E8C99B',
  },
];

// الشخصيتان "تتحاوران" على الصفحة الرئيسية بتبديل تعابيرهما.
const DUET: { alien: AlienMood; jo: Expression; alienSays: string; joSays: string }[] = [
  { alien: 'curious', jo: 'welcoming', alienSays: 'ليش القهوة بفنجان صغير؟', joSays: 'يا هلا والله!' },
  { alien: 'confused', jo: 'explaining', alienSays: 'يعني «لا» مش «لا»؟!', joSays: 'هسا خليني أفهمك…' },
  { alien: 'shocked', jo: 'laughing', alienSays: 'بالطريق… وإنت بالبيت؟!', joSays: 'شو مالك مستغرب؟' },
  { alien: 'convinced', jo: 'proud', alienSays: 'سجّلوني مواطن شرفي!', joSays: 'هاي عاداتنا!' },
];

export default function Landing({ mode, hasProgress, soundOn, onToggleSound, onStart, onResume }: Props) {
  const [beat, setBeat] = useState(0);
  const howRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = setInterval(() => setBeat((b) => (b + 1) % DUET.length), 3400);
    return () => clearInterval(id);
  }, []);

  const duet = DUET[beat];

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-5 pb-16 pt-6">
      <header className="flex items-center justify-between gap-3">
        <span className="text-lg font-black tracking-tight sm:text-xl">
          فهّمني <span className="text-turq">يا أرضي!</span>
        </span>
        <div className="flex items-center gap-2">
          {mode === 'demo' && <span className="chip border border-sand/40 bg-sand/15 text-sand">وضع العرض التجريبي</span>}
          <button className="icon-btn" onClick={onToggleSound} aria-label={soundOn ? 'اطفي الصوت' : 'شغّل الصوت'} aria-pressed={soundOn}>
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center pt-8 text-center sm:pt-4">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-balance text-[2.1rem] font-black leading-[1.25] sm:text-6xl sm:leading-[1.2]"
        >
          فضائي وصل الأردن...
          <br />
          <span className="bg-gradient-to-l from-turq via-violet to-sand bg-clip-text text-transparent">وبلّش يسأل!</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-4 max-w-xl text-balance text-base leading-8 text-white/80 sm:text-lg"
        >
          إنت الفضائي، وإحنا الأردنيين. اسأل عن عاداتنا، واستعد لإجابات ما كانت على كوكبك!
        </motion.p>

        {/* الشخصيتان */}
        <div className="relative mt-8 grid w-full max-w-xl grid-cols-2 items-end gap-2 sm:mt-6">
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <SpeechTag key={`jo-${beat}`} tone="jordanian" text={duet.joSays} />
            <Character who="jordanian" state={duet.jo} className="mx-auto w-[92%] max-w-[250px]" />
            <p className="mt-1 text-sm font-bold text-sand">أبو الجود</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="relative">
            <SpeechTag key={`al-${beat}`} tone="alien" text={duet.alienSays} />
            <Character who="alien" state={duet.alien} className="mx-auto w-[78%] max-w-[205px]" />
            <p className="mt-1 text-sm font-bold text-turq">إنت (الفضائي)</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-xl sm:flex-row sm:justify-center"
        >
          <button className="btn-primary flex-1 whitespace-nowrap text-lg sm:flex-[1.5]" onClick={onStart}>
            ابدأ المهمة الفضائية 🚀
          </button>
          <button className="btn-ghost flex-1 whitespace-nowrap" onClick={() => howRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            كيف بنلعب؟
          </button>
        </motion.div>
        {hasProgress && (
          <button className="mt-4 text-sm font-bold text-turq underline decoration-dotted underline-offset-4" onClick={onResume}>
            عندك مهمة ما خلصت — كمّلها
          </button>
        )}
      </section>

      <section ref={howRef} className="scroll-mt-6 pt-16">
        <h2 className="text-center text-2xl font-black sm:text-3xl">كيف بنلعب؟</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="panel relative p-5 pt-8 text-start"
            >
              <span
                className="absolute -top-4 start-5 grid h-10 w-10 place-items-center rounded-2xl text-lg font-black text-night"
                style={{ background: step.color, boxShadow: `0 4px 0 rgba(0,0,0,.25), 0 0 24px ${step.color}66` }}
              >
                {step.n}
              </span>
              <h3 className="text-lg font-extrabold">{step.title}</h3>
              <p className="mt-1 text-sm leading-7 text-white/75">{step.text}</p>
            </motion.div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-7 text-white/60">
          أبو الجود بيشرح من تجربته، ومش كل الأردنيين زي بعض: العادات بتختلف من بيت لبيت، ومن جيل لجيل، ومن منطقة لمنطقة.
        </p>
        {mode === 'demo' && (
          <p className="mx-auto mt-3 max-w-xl rounded-2xl border border-sand/30 bg-sand/10 px-4 py-3 text-center text-sm leading-7 text-sand">
            الخادم شغّال بدون مفتاح ذكاء اصطناعي، فالردود هون مكتوبة مسبقاً لأسئلة مقترحة. لما ينضاف المفتاح، أبو الجود بيرد على أي سؤال بتكتبه.
          </p>
        )}
      </section>
    </div>
  );
}

function SpeechTag({ tone, text }: { tone: 'alien' | 'jordanian'; text: string }) {
  const isAlien = tone === 'alien';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
      className={`relative z-10 mx-auto mb-1 w-fit max-w-[95%] rounded-2xl px-3 py-1.5 text-xs font-extrabold shadow-lg sm:text-sm ${
        isAlien ? 'bg-turq text-night' : 'bg-cream text-ink'
      }`}
    >
      {text}
      <span className={`absolute -bottom-1 start-1/2 h-2.5 w-2.5 rotate-45 ${isAlien ? 'bg-turq' : 'bg-cream'}`} />
    </motion.div>
  );
}

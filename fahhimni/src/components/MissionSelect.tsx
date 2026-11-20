import { motion } from 'framer-motion';
import { MISSIONS } from '../../shared/missions.js';
import { MISSION_ART } from '../data';
import { GUIDE_TITLE } from './Guide';
import { BackIcon, BookIcon, StarIcon } from './icons';

interface Props {
  completed: Record<string, string>;
  guideCount: number;
  onOpenGuide: () => void;
  onPick: (missionId: string) => void;
  onBack: () => void;
}

export default function MissionSelect({ completed, guideCount, onOpenGuide, onPick, onBack }: Props) {
  const done = MISSIONS.filter((m) => completed[m.id]).length;

  return (
    <div className="mx-auto min-h-[100dvh] max-w-5xl px-4 pb-14 pt-5 sm:px-6">
      <header>
        <div className="flex items-center gap-3">
          <button className="icon-btn" onClick={onBack} aria-label="رجوع للصفحة الرئيسية">
            <BackIcon />
          </button>
          <h1 className="min-w-0 flex-1 text-xl font-black sm:text-3xl">اختار مهمتك يا فضائي</h1>
          <span className="chip shrink-0 border border-sand/40 bg-sand/15 text-sand" aria-label={`خلصت ${done} من ${MISSIONS.length} مهمات`}>
            <StarIcon width={14} height={14} />
            {done} / {MISSIONS.length}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-white/70">ست عادات أردنية بدها تفسير. من وين بتبلّش؟</p>
      </header>

      {guideCount > 0 && (
        <button
          onClick={onOpenGuide}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-turq/30 bg-turq/10 px-4 py-3 text-start transition-colors hover:bg-turq/20"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-turq text-night">
            <BookIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-turq">{GUIDE_TITLE}</span>
            <span className="block text-xs text-white/65">جمعت {guideCount} ملاحظات لحد هسا. افتح دفترك.</span>
          </span>
        </button>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {MISSIONS.map((mission, i) => {
          const art = MISSION_ART[mission.id];
          const title = completed[mission.id];
          return (
            <motion.button
              key={mission.id}
              type="button"
              onClick={() => onPick(mission.id)}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ y: -8, rotate: i % 2 ? 0.8 : -0.8 }}
              whileTap={{ scale: 0.97 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1A1C44] text-start shadow-card"
              style={{ boxShadow: `0 18px 40px -18px rgba(5,6,24,.9), inset 0 0 0 1px ${art.accent}22` }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={art.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1A1C44] to-transparent" />
                <span
                  className="absolute start-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-xl text-base font-black text-night sm:h-10 sm:w-10"
                  style={{ background: art.accent, boxShadow: '0 3px 0 rgba(0,0,0,.3)' }}
                >
                  {mission.number}
                </span>
                {title && (
                  <span className="absolute end-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-night/70 text-[#FFD166] backdrop-blur">
                    <StarIcon />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3 pt-1 sm:p-4 sm:pt-1">
                <h2 className="text-[15px] font-extrabold leading-6 sm:text-lg">{mission.title}</h2>
                <p className="text-xs leading-5 text-white/70 sm:text-sm sm:leading-6">{mission.question}</p>
                <span className="mt-auto pt-2 text-xs font-extrabold" style={{ color: art.accent }}>
                  {title ? `لقبك: ${title}` : 'ابدأ المهمة'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

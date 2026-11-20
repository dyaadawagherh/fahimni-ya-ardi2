import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MISSIONS } from '../../shared/missions.js';
import { MISSION_ART } from '../data';
import { BookIcon, CloseIcon } from './icons';

export const GUIDE_TITLE = 'دليل الفضائي لفهم الأردن';

export function GuideList({ items, accent = '#48D6CB' }: { items: string[]; accent?: string }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <motion.li
          key={`${i}-${item}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-2.5 text-sm leading-6 text-white/90"
        >
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[11px] font-black text-night" style={{ background: accent }}>
            {i + 1}
          </span>
          <span>{item}</span>
        </motion.li>
      ))}
    </ol>
  );
}

interface SheetProps {
  /** معرّف المهمة ← الملاحظات التي جمعها الفضائي فيها */
  book: Record<string, string[]>;
  currentId?: string;
  onClose: () => void;
}

/** الدليل كاملاً: كل ما انشرح في هذه الجلسة، مجمّعاً حسب المهمة. */
export function GuideSheet({ book, currentId, onClose }: SheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const chapters = MISSIONS.filter((m) => book[m.id]?.length).sort((a, b) => Number(b.id === currentId) - Number(a.id === currentId));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-deep/75 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={GUIDE_TITLE}
        className="flex max-h-[82dvh] w-full max-w-lg flex-col rounded-t-3xl border border-white/15 bg-[#1A1C44] shadow-card sm:rounded-3xl"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-turq text-night">
            <BookIcon />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black">{GUIDE_TITLE}</h2>
            <p className="text-xs text-white/60">كل اللي انشرحلك لحد هسا</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="سكّر الدليل" autoFocus>
            <CloseIcon />
          </button>
        </div>
        <div className="thin-scrollbar flex-1 space-y-5 overflow-y-auto p-4">
          {chapters.length === 0 && (
            <p className="py-8 text-center text-sm leading-7 text-white/60">
              الدليل لسا فاضي. اسأل أبو الجود أول سؤال، وكل شرح بينكتب هون.
            </p>
          )}
          {chapters.map((mission) => (
            <section key={mission.id}>
              <h3 className="mb-2 text-sm font-extrabold" style={{ color: MISSION_ART[mission.id].accent }}>
                {mission.title}
              </h3>
              <GuideList items={book[mission.id]} accent={MISSION_ART[mission.id].accent} />
            </section>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

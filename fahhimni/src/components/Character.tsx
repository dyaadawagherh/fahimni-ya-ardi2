import { motion, useReducedMotion } from 'framer-motion';
import { ALIEN, JORDANIAN } from '../data';
import type { AlienMood, Expression } from '../types';

type Props =
  | { who: 'jordanian'; state: Expression; className?: string; float?: boolean }
  | { who: 'alien'; state: AlienMood; className?: string; float?: boolean };

/**
 * يرسم الشخصية بتعبيرها الحالي. كل التعابير محمّلة فوق بعضها ونبدّل الشفافية،
 * حتى يكون التغيير فورياً وبدون وميض، مع قفزة صغيرة عند كل تبديل.
 */
export default function Character({ who, state, className = '', float = true }: Props) {
  const reduce = useReducedMotion();
  const set: Record<string, { src: string; label: string }> = who === 'jordanian' ? JORDANIAN : ALIEN;
  const name = who === 'jordanian' ? 'أبو الجود بالثوب والشماغ' : 'الفضائي';

  return (
    <div className={`relative aspect-square ${className}`}>
      <div className="absolute inset-x-[18%] bottom-[1%] h-[6%] rounded-[50%] bg-black/35 blur-md" />
      <div className={`absolute inset-0 ${float ? 'animate-floaty' : ''}`} style={{ animationDelay: who === 'alien' ? '-2.5s' : '0s' }}>
        <motion.div
          key={state}
          className="absolute inset-0"
          initial={reduce ? false : { scale: 0.9, rotate: who === 'alien' ? 5 : -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 13 }}
        >
          {Object.entries(set).map(([key, item]) => (
            <img
              key={key}
              src={item.src}
              alt={key === state ? `${name} — ${item.label}` : ''}
              aria-hidden={key !== state}
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-contain transition-opacity duration-150"
              style={{ opacity: key === state ? 1 : 0 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

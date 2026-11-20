import { memo } from 'react';
import { SparkIcon } from './icons';

// مواقع ثابتة للنجوم حتى لا تتغيّر السماء بين الشاشات.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 37 + 11) % 100;
  const y = (i * 53 + 7) % 100;
  const size = 1 + ((i * 7) % 3);
  const tint = ['#ffffff', '#A78BFA', '#48D6CB', '#E8C99B'][i % 4];
  return { x, y, size, tint, delay: (i % 9) * 0.45 };
});

const SPARKS = [
  { x: 8, y: 16, size: 18, color: '#E8C99B', delay: 0 },
  { x: 90, y: 30, size: 14, color: '#48D6CB', delay: 1.2 },
  { x: 18, y: 72, size: 12, color: '#A78BFA', delay: 2.1 },
  { x: 80, y: 82, size: 16, color: '#F59BB6', delay: 0.6 },
  { x: 52, y: 8, size: 10, color: '#ffffff', delay: 1.7 },
];

function SpaceBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 60% at 80% 0%, rgba(118,85,217,0.55), transparent 70%),' +
            'radial-gradient(70% 50% at 0% 100%, rgba(72,214,203,0.16), transparent 70%),' +
            'radial-gradient(60% 45% at 100% 100%, rgba(201,40,56,0.16), transparent 70%),' +
            'linear-gradient(180deg, #171A3F 0%, #11152F 45%, #0B0E24 100%)',
        }}
      />

      {STARS.map((s, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: s.tint,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {SPARKS.map((s, i) => (
        <SparkIcon
          key={i}
          className="animate-twinkle absolute"
          width={s.size}
          height={s.size}
          style={{ left: `${s.x}%`, top: `${s.y}%`, color: s.color, animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* كوكب بنفسجي بحلقة */}
      <div className="animate-drift absolute -left-20 top-[12%] h-36 w-36 sm:-left-16 sm:h-60 sm:w-60">
        <div
          className="absolute inset-[14%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 32% 28%, #C4B0FF 0%, #7655D9 45%, #3A2A8C 100%)',
            boxShadow: 'inset -14px -18px 30px rgba(11,14,36,0.55), 0 0 60px rgba(118,85,217,0.45)',
          }}
        />
        <div
          className="absolute left-[-8%] top-[42%] h-[18%] w-[116%] rounded-[50%] border-[5px] border-violet/60"
          style={{ transform: 'rotate(-18deg)', clipPath: 'polygon(0 45%, 100% 45%, 100% 100%, 0 100%)' }}
        />
      </div>

      {/* كوكب تركوازي صغير */}
      <div
        className="animate-drift absolute -right-10 bottom-[10%] h-28 w-28 rounded-full sm:h-40 sm:w-40"
        style={{
          animationDelay: '-6s',
          background: 'radial-gradient(circle at 30% 28%, #B8FFF6 0%, #48D6CB 45%, #1B7F86 100%)',
          boxShadow: 'inset -10px -14px 24px rgba(11,14,36,0.5), 0 0 50px rgba(72,214,203,0.35)',
        }}
      />

      {/* قمر رملي صغير */}
      <div
        className="animate-drift absolute -right-3 top-[46%] h-10 w-10 rounded-full sm:right-[6%] sm:top-[14%] sm:h-14 sm:w-14"
        style={{
          animationDelay: '-10s',
          background: 'radial-gradient(circle at 32% 30%, #FFF1D6 0%, #E8C99B 55%, #A9824E 100%)',
          boxShadow: 'inset -5px -6px 10px rgba(11,14,36,0.4)',
        }}
      />
    </div>
  );
}

export default memo(SpaceBackground);

import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

/** سهم "رجوع" في واجهة من اليمين لليسار يشير لليمين */
export const BackIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);
export const SendIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 4L4 11l7 2.500L13.500 20z" />
    <path d="M11 13.500L20 4" />
  </svg>
);
export const SoundOnIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" />
    <path d="M15.500 9a4.500 4.500 0 010 6M18 6.500a8 8 0 010 11" />
  </svg>
);
export const SoundOffIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" />
    <path d="M16 9.500l5 5M21 9.500l-5 5" />
  </svg>
);
export const BookIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 6.500C10 5 7 4.500 4 5v13c3-.500 6 0 8 1.500 2-1.500 5-2 8-1.500V5c-3-.500-6 0-8 1.500z" />
    <path d="M12 6.500V19.500" />
  </svg>
);
export const CopyIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="8.500" y="8.500" width="11" height="11" rx="2.500" />
    <path d="M15.500 8.500V6.500a2 2 0 00-2-2h-7a2 2 0 00-2 2v7a2 2 0 002 2h2" />
  </svg>
);
export const ShareIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.500" />
    <circle cx="17.500" cy="6" r="2.500" />
    <circle cx="17.500" cy="18" r="2.500" />
    <path d="M8.200 10.800l7.100-3.600M8.200 13.200l7.100 3.600" />
  </svg>
);
export const RestartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.500 12a7.500 7.500 0 107.500-7.500c-2.300 0-4.300 1-5.700 2.600" />
    <path d="M5.500 3.500v4h4" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const StarIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 2.500l2.800 6 6.500.800-4.800 4.500 1.300 6.500L12 17l-5.800 3.300 1.300-6.500L2.700 9.300l6.500-.800z" />
  </svg>
);
export const SparkIcon = (p: P) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 1.500l2.200 8.300 8.300 2.200-8.300 2.200L12 22.500l-2.200-8.300L1.500 12l8.300-2.200z" />
  </svg>
);

import type { AlienMood, Expression, Persuasion } from './types';

import joWelcoming from './assets/characters/jo_welcoming.webp';
import joExplaining from './assets/characters/jo_explaining.webp';
import joSurprised from './assets/characters/jo_surprised.webp';
import joLaughing from './assets/characters/jo_laughing.webp';
import joThinking from './assets/characters/jo_thinking.webp';
import joProud from './assets/characters/jo_proud.webp';
import joConfused from './assets/characters/jo_confused.webp';
import alienCurious from './assets/characters/alien_curious.webp';
import alienConfused from './assets/characters/alien_confused.webp';
import alienShocked from './assets/characters/alien_shocked.webp';
import alienAmused from './assets/characters/alien_amused.webp';
import alienConvinced from './assets/characters/alien_convinced.webp';

import hospitality from './assets/missions/hospitality.webp';
import mansaf from './assets/missions/mansaf.webp';
import wedding from './assets/missions/wedding.webp';
import ontheway from './assets/missions/ontheway.webp';
import social from './assets/missions/social.webp';
import university from './assets/missions/university.webp';

export const JORDANIAN_NAME = 'أبو الجود';

export const JORDANIAN: Record<Expression, { src: string; label: string }> = {
  welcoming: { src: joWelcoming, label: 'مرحّب' },
  explaining: { src: joExplaining, label: 'بيشرح بثقة' },
  surprised: { src: joSurprised, label: 'متفاجئ' },
  laughing: { src: joLaughing, label: 'ميّت ضحك' },
  thinking: { src: joThinking, label: 'بيفكّر' },
  proud: { src: joProud, label: 'فخور' },
  confused: { src: joConfused, label: 'محتار' },
};

export const ALIEN: Record<AlienMood, { src: string; label: string }> = {
  curious: { src: alienCurious, label: 'فضولي' },
  confused: { src: alienConfused, label: 'محتار' },
  shocked: { src: alienShocked, label: 'مصدوم' },
  amused: { src: alienAmused, label: 'مبسوط' },
  convinced: { src: alienConvinced, label: 'مقتنع' },
};

export const MISSION_ART: Record<string, { src: string; accent: string }> = {
  hospitality: { src: hospitality, accent: '#E8C99B' },
  mansaf: { src: mansaf, accent: '#F2C94C' },
  wedding: { src: wedding, accent: '#C92838' },
  ontheway: { src: ontheway, accent: '#48D6CB' },
  social: { src: social, accent: '#F59BB6' },
  university: { src: university, accent: '#A78BFA' },
};

export const PERSUASION: Record<Persuasion, { text: string; mood: AlienMood; color: string }> = {
  citizen: { text: 'اقتنعت! سجّلوني مواطن شرفي.', mood: 'convinced', color: '#1F9D8F' },
  not_convinced: { text: 'فهمت... بس لسه مش مقتنع.', mood: 'confused', color: '#7655D9' },
  council: { text: 'أحتاج اجتماعاً طارئاً مع مجلس الكوكب.', mood: 'shocked', color: '#C27A12' },
  review: { text: 'أطالب بمراجعة قوانين كوكب الأرض.', mood: 'shocked', color: '#C92838' },
};

export type Expression = 'welcoming' | 'explaining' | 'surprised' | 'laughing' | 'thinking' | 'proud' | 'confused';
export type AlienMood = 'curious' | 'confused' | 'shocked' | 'amused' | 'convinced';
export type Persuasion = 'citizen' | 'not_convinced' | 'council' | 'review';
export type Mode = 'live' | 'demo';
export type Screen = 'landing' | 'missions' | 'game' | 'report';

export interface Message {
  role: 'alien' | 'jordanian';
  text: string;
  expression?: Expression;
  /** وضع العرض فقط: الرد لم يطابق سؤال اللاعب */
  canned?: boolean;
}

export interface Report {
  score: number;
  scoreLabel: string;
  scoreReason: string;
  persuasion: Persuasion;
  persuasionReason: string;
  bestExplanation: string;
  funniestReaction: string;
  title: string;
  learned: string[];
  unexplained: string;
}

export interface TurnResponse {
  mode: Mode;
  reply: string;
  expression: Expression;
  alienMood: AlienMood;
  guide: string;
  canned: boolean;
  report?: Report;
}

export interface Progress {
  missionId: string;
  messages: Message[];
  guide: string[];
  alienMood: AlienMood;
  report: Report | null;
  mode: Mode;
}

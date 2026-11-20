export interface Mission {
  id: string;
  number: number;
  title: string;
  question: string;
  intro: string;
  suggestions: string[][];
}
export const ROUNDS: number;
export const MAX_QUESTION: number;
export const ROUND_INFO: { name: string; hint: string }[];
export const MISSIONS: Mission[];

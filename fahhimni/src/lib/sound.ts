// مؤثرات صوتية صغيرة تُولَّد بـ WebAudio (بدون ملفات). الصوت مطفأ افتراضياً.

type SoundName = 'tap' | 'send' | 'receive' | 'complete';

const NOTES: Record<SoundName, { freq: number; at: number; dur: number }[]> = {
  tap: [{ freq: 520, at: 0, dur: 0.07 }],
  send: [
    { freq: 440, at: 0, dur: 0.08 },
    { freq: 660, at: 0.07, dur: 0.1 },
  ],
  receive: [
    { freq: 587, at: 0, dur: 0.09 },
    { freq: 494, at: 0.09, dur: 0.12 },
  ],
  complete: [
    { freq: 523, at: 0, dur: 0.12 },
    { freq: 659, at: 0.11, dur: 0.12 },
    { freq: 784, at: 0.22, dur: 0.12 },
    { freq: 1047, at: 0.33, dur: 0.28 },
  ],
};

let ctx: AudioContext | null = null;
let enabled = false;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on && !ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) ctx = new Ctor();
  }
  if (on) void ctx?.resume();
}

export function play(name: SoundName) {
  if (!enabled || !ctx) return;
  const now = ctx.currentTime;
  for (const note of NOTES[name]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = note.freq;
    gain.gain.setValueAtTime(0.0001, now + note.at);
    gain.gain.exponentialRampToValueAtTime(0.12, now + note.at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + note.at);
    osc.stop(now + note.at + note.dur + 0.02);
  }
}

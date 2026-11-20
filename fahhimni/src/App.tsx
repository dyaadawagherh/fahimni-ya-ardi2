import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MISSIONS } from '../shared/missions.js';
import Game from './components/Game';
import { GuideSheet } from './components/Guide';
import Landing from './components/Landing';
import MissionSelect from './components/MissionSelect';
import Report from './components/Report';
import SpaceBackground from './components/SpaceBackground';
import { fetchMode } from './lib/api';
import { play, setSoundEnabled } from './lib/sound';
import { loadSaved, save } from './lib/storage';
import type { Mode, Progress, Screen } from './types';

const saved = loadSaved();

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [mode, setMode] = useState<Mode | null>(null);
  const [progress, setProgress] = useState<Progress | null>(saved.progress);
  const [completed, setCompleted] = useState(saved.completed);
  const [guideBook, setGuideBook] = useState(saved.guideBook);
  const [missionId, setMissionId] = useState(saved.progress?.missionId ?? MISSIONS[0].id);
  // يتغيّر عند كل بداية جديدة حتى تُبنى شاشة اللعب من الصفر
  const [run, setRun] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const mission = MISSIONS.find((m) => m.id === missionId) ?? MISSIONS[0];
  const current = progress?.missionId === mission.id ? progress : null;
  const guideCount = useMemo(() => Object.values(guideBook).reduce((sum, items) => sum + items.length, 0), [guideBook]);

  useEffect(() => {
    void fetchMode().then(setMode);
  }, []);

  useEffect(() => {
    save({ progress, completed, guideBook });
  }, [progress, completed, guideBook]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const handleProgress = useCallback((next: Progress) => {
    setProgress(next);
    if (next.guide.length) setGuideBook((book) => ({ ...book, [next.missionId]: next.guide }));
    if (next.report) setCompleted((done) => ({ ...done, [next.missionId]: next.report!.title }));
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) play('tap');
  }

  function startMission(id: string, fresh: boolean) {
    const resumable = progress?.missionId === id && !progress.report;
    if (fresh || !resumable) {
      setProgress(null);
      setRun((n) => n + 1);
    }
    setMissionId(id);
    setScreen('game');
    play('tap');
  }

  const resumable = Boolean(progress && !progress.report && progress.messages.length > 1);

  return (
    <>
      <SpaceBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {screen === 'landing' && (
            <Landing
              mode={mode}
              hasProgress={resumable}
              soundOn={soundOn}
              onToggleSound={toggleSound}
              onStart={() => setScreen('missions')}
              onResume={() => progress && startMission(progress.missionId, false)}
            />
          )}
          {screen === 'missions' && (
            <MissionSelect
              completed={completed}
              guideCount={guideCount}
              onOpenGuide={() => setGuideOpen(true)}
              onPick={(id) => startMission(id, false)}
              onBack={() => setScreen('landing')}
            />
          )}
          {screen === 'game' && (
            <Game
              key={`${mission.id}-${run}`}
              mission={mission}
              mode={mode}
              initial={current}
              soundOn={soundOn}
              guideCount={guideCount}
              onToggleSound={toggleSound}
              onOpenGuide={() => setGuideOpen(true)}
              onProgress={handleProgress}
              onFinish={() => setScreen('report')}
              onExit={() => setScreen('missions')}
            />
          )}
          {screen === 'report' && current?.report && (
            <Report
              mission={mission}
              report={current.report}
              mode={current.mode}
              onRestart={() => startMission(mission.id, true)}
              onPickAnother={() => setScreen('missions')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {guideOpen && <GuideSheet book={guideBook} currentId={screen === 'game' ? mission.id : undefined} onClose={() => setGuideOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

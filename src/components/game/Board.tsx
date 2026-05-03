"use client";

import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_SIZE } from '@/lib/game-utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Trophy, Skull, Play, X, User, Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HallOfFame } from './HallOfFame';
import { playUIClickSound } from '@/lib/audio-system';
import { ParallaxBackground } from './ParallaxBackground';
import { SettingsDrawer } from './SettingsDrawer';
import { ProfileDashboard } from './ProfileDashboard';

export function Board() {
  const { 
    entities, score, targetScore, timeLeft, level, gameMode, setGameMode,
    isGameOver, isWin, isPaused, setIsPaused, lore, loreLogs, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard, bestScore, showHallOfFame, setShowHallOfFame,
    gameStarted, startGame, resetToMainMenu, isSettingsOpen, setIsSettingsOpen, isInputFrozen,
    soundOn, handleToggleSound, isBatterySaver, toggleBatterySaver, language, cycleLanguage, t, profile, activeExplosions
  } = useGameState();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [flashColor, setFlashColor] = useState<'cyan' | 'gold' | null>(null);
  const [isWarping, setIsWarping] = useState(false);

  useEffect(() => {
    if (lore) {
      if (lore.includes('ANOMALY')) setFlashColor('cyan');
      else if (lore.includes('SUPERNOVA') || lore.includes('Black Hole') || lore.includes('Aligned')) {
        setFlashColor('gold');
        setIsWarping(true);
        setTimeout(() => setIsWarping(false), 500);
      }
      const timer = setTimeout(() => setFlashColor(null), 600);
      return () => clearTimeout(timer);
    }
  }, [lore]);

  const handleSelect = (id: string) => {
    if (isInputFrozen) return;
    if (selectedId === null) {
      setSelectedId(id);
    } else {
      if (selectedId === id) {
        setSelectedId(null);
        return;
      }
      const entity1 = entities.find(e => e.id === selectedId);
      const entity2 = entities.find(e => e.id === id);
      if (entity1 && entity2 && areAdjacent(entity1, entity2)) {
        swapEntities(selectedId, id);
        setSelectedId(null);
      } else {
        setSelectedId(id);
      }
    }
  };

  const handleAbortMission = () => {
    playUIClickSound();
    setIsPaused(true);
    setShowExitConfirm(true);
  };

  const cancelAbort = () => {
    playUIClickSound();
    setShowExitConfirm(false);
    setIsPaused(false);
  };

  const confirmAbort = () => {
    playUIClickSound();
    setShowExitConfirm(false);
    resetToMainMenu();
  };

  const progress = Math.min(100, (score / targetScore) * 100);

  return (
    <div className={cn(
      "fixed inset-0 flex flex-col items-center justify-center p-4 select-none overflow-hidden",
      isBatterySaver && "battery-saver"
    )}>
      <ParallaxBackground isWarping={isWarping} disabled={isBatterySaver} />
      
      {/* Top Left: Score Cluster */}
      <div className="fixed top-safe left-safe p-4 z-[70] pointer-events-none">
        <div className="glass-morphism rounded-2xl p-4 border-primary/20 pointer-events-auto">
          <p className="text-[10px] uppercase tracking-widest text-primary font-black mb-1">{t.score}</p>
          <div className="text-3xl font-headline font-black text-white tabular-nums">
            {score.toLocaleString()}
          </div>
          <div className="mt-2 w-24">
             <Progress value={progress} className="h-1 bg-white/5" />
          </div>
        </div>
      </div>

      {/* Top Right: Personal Best & Profile */}
      <div className="fixed top-safe right-safe p-4 z-[70] flex flex-col items-end gap-3">
        <div className="glass-morphism rounded-2xl p-4 border-secondary/20 flex flex-col items-end">
          <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">{t.best}</p>
          <div className="text-xl font-headline font-black text-white">
            {bestScore.toLocaleString()}
          </div>
        </div>
        <button 
          onClick={() => profile.setShowProfile(true)}
          className="settings-gear-btn group bg-cyan-400/90"
        >
          <User className="w-6 h-6 text-slate-900" />
        </button>
      </div>

      {/* Center Left: Archive Logs */}
      <div className="fixed left-safe top-1/2 -translate-y-1/2 p-4 z-[70] hidden lg:block w-64 pointer-events-none">
        <div className="glass-morphism rounded-2xl p-4 border-primary/20 pointer-events-auto max-h-[400px] overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-3 h-3 text-primary" />
            <h3 className="text-[10px] uppercase font-black tracking-widest text-primary">{t.archive}</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {loreLogs.map((log, i) => (
              <div key={i} className="cli-line text-white/60">
                <span className="text-primary/40 mr-2">[{Math.max(0, timeLeft)}s]</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Left: Abort Mission */}
      <div className="fixed bottom-safe left-safe p-4 z-[70]">
        <button 
          onClick={handleAbortMission}
          className={cn(
            "abort-hex group",
            timeLeft < 15 && gameStarted && "animate-pulse border-destructive"
          )}
        >
          <X className="w-6 h-6 text-destructive-foreground" />
        </button>
      </div>

      {/* Bottom Right: Settings */}
      <div className="fixed bottom-safe right-safe p-4 z-[70]">
        <SettingsDrawer 
          isOpen={isSettingsOpen} 
          onToggle={setIsSettingsOpen} 
          disabled={isProcessing}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          isBatterySaver={isBatterySaver}
          onToggleBattery={toggleBatterySaver}
          language={language}
          onCycleLanguage={cycleLanguage}
          gameMode={gameMode}
          onSetGameMode={setGameMode}
          onShowFame={() => setShowHallOfFame(!showHallOfFame)}
          labels={t}
          anchor="bottom"
        />
      </div>

      {/* Center: Main Game Frame */}
      <div className={cn(
        "relative flex flex-col w-full max-w-[600px] aspect-square stellar-frame breathing-glow z-10",
        flashColor === 'cyan' && "match-flash-cyan",
        flashColor === 'gold' && "match-flash-gold"
      )}>
        <div className="nebula-scroll" />
        
        {!gameStarted ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-black/80 backdrop-blur-xl animate-in fade-in">
             <div className="mb-12">
                <h1 className="text-5xl font-headline font-black italic text-white tracking-tighter uppercase">STELLAR SHIFT</h1>
                <p className="text-[10px] tracking-[0.5em] text-primary font-bold uppercase mt-2">{t.protocol}</p>
             </div>
             <button onClick={startGame} className="btn-cosmic-start group animate-pulse">
               <span className="flex items-center gap-3">
                 <Play className="w-6 h-6 fill-white" /> {t.start}
               </span>
             </button>
          </div>
        ) : showHallOfFame ? (
          <HallOfFame title={t.hallOfFame} subtitle={t.highest} />
        ) : (
          <div className="relative z-10 flex flex-col h-full">
            {(isGameOver || isWin) && (
              <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
                {isGameOver ? (
                  <>
                    <Skull className="w-16 h-16 text-destructive mb-6" />
                    <h2 className="text-4xl font-headline font-black text-white mb-6 uppercase italic">{t.missionTerminated}</h2>
                  </>
                ) : (
                  <>
                    <Trophy className="w-16 h-16 text-primary mb-6" />
                    <h2 className="text-4xl font-headline font-black text-white mb-6 uppercase italic">{t.victory}</h2>
                  </>
                )}
                <Button onClick={initBoard} size="lg" className="bg-primary hover:bg-primary/80 font-black uppercase tracking-widest">{t.reboot}</Button>
              </div>
            )}
            
            <div className="flex-1 relative p-8 overflow-hidden flex items-center justify-center">
              <div 
                className={cn("relative transition-all duration-300", isInputFrozen && !isGameOver && !isWin && "opacity-40 grayscale")} 
                style={{ width: `${GRID_SIZE * HEX_WIDTH}px`, height: `${GRID_SIZE * HEX_WIDTH}px`, transform: `scale(${Math.min(1, 400 / (GRID_SIZE * HEX_WIDTH))})` }}
              >
                {activeExplosions.map((exp) => (
                  <div key={exp.id} className="animate-cosmic-shockwave" style={{ left: exp.q * HEX_WIDTH, top: exp.r * HEX_WIDTH, width: HEX_WIDTH, height: HEX_WIDTH }} />
                ))}
                {entities.map((entity) => (
                  <Entity key={entity.id} entity={entity} isSelected={selectedId === entity.id} onSelect={handleSelect} disabled={isInputFrozen} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <ProfileDashboard 
        isOpen={profile.showProfile}
        onClose={() => profile.setShowProfile(false)}
        profile={profile.profile}
        onUpdateAvatar={profile.setAvatar}
        onUpdateName={profile.setName}
        getRankLabel={profile.getRank}
        labels={t}
      />

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="glass-morphism rounded-3xl border-destructive/20 max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-center uppercase tracking-widest">{t.abandonMission}</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">{t.abandonDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction onClick={confirmAbort} className="w-full bg-destructive text-white uppercase font-black">{t.yes}</AlertDialogAction>
            <AlertDialogCancel onClick={cancelAbort} className="w-full bg-white/5 text-white uppercase font-black">{t.no}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
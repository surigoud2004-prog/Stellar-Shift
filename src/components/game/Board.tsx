"use client";

import { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { Entity } from './Entity';
import { areAdjacent, HEX_WIDTH, GRID_SIZE } from '@/lib/game-utils';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Orbit, Shield, Trophy, 
  Skull, Lock, Pause, Play, Timer, Cpu, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HallOfFame } from './HallOfFame';
import { playUIClickSound } from '@/lib/audio-system';
import { ParallaxBackground } from './ParallaxBackground';
import { SettingsDrawer } from './SettingsDrawer';

export function Board() {
  const { 
    entities, score, targetScore, timeLeft, level, gameMode, setGameMode,
    isGameOver, isWin, isPaused, setIsPaused, lore, selectedId, setSelectedId, 
    swapEntities, isProcessing, initBoard, bestScore, showHallOfFame, setShowHallOfFame,
    gameStarted, startGame, resetToMainMenu, isSettingsOpen, setIsSettingsOpen, isInputFrozen,
    soundOn, handleToggleSound, language, cycleLanguage, t
  } = useGameState();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [flashColor, setFlashColor] = useState<'cyan' | 'gold' | null>(null);
  const [isWarping, setIsWarping] = useState(false);

  useEffect(() => {
    if (lore) {
      if (lore.includes('ANOMALY')) setFlashColor('cyan');
      else if (lore.includes('Supernova') || lore.includes('Black Hole') || lore.includes('Aligned')) {
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
    OnAbortGame();
  };

  const OnAbortGame = async () => {
    setIsFading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    resetToMainMenu();
    setIsFading(false);
  };

  const handleReboot = () => {
    playUIClickSound();
    initBoard();
  };

  const toggleHallOfFame = () => {
    setShowHallOfFame(!showHallOfFame);
  };

  const progress = Math.min(100, (score / targetScore) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto p-4 lg:p-8 min-h-[90vh] relative">
      <ParallaxBackground isWarping={isWarping} />
      
      {/* Top Right command console cluster */}
      <div className="fixed top-8 right-8 z-[70] flex flex-col items-end gap-4 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <SettingsDrawer 
            isOpen={isSettingsOpen} 
            onToggle={setIsSettingsOpen} 
            disabled={isProcessing}
            soundOn={soundOn}
            onToggleSound={handleToggleSound}
            language={language}
            onCycleLanguage={cycleLanguage}
            gameMode={gameMode}
            onSetGameMode={setGameMode}
            onShowFame={toggleHallOfFame}
            labels={t}
          />
          <button 
            onClick={handleAbortMission}
            className={cn(
              "abort-hex group",
              timeLeft < 15 && gameStarted && "animate-abort-pulse"
            )}
            title={t.abortMission}
          >
            <X className="w-6 h-6 text-destructive-foreground group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {isFading && (
        <div className="fixed inset-0 bg-black z-[100] animate-in fade-in duration-500" />
      )}

      {/* Left Panel */}
      <div className="lg:w-1/4 space-y-6 z-10">
        <Card className="glass-morphism p-6 border-primary/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <Orbit className="w-6 h-6 animate-spin-slow" /> {t.sector} {level}
            </h2>
            <Badge variant="outline" className="border-primary uppercase text-[10px] animate-pulse">
              {gameMode}
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <Timer className={cn("w-5 h-5", timeLeft < 15 && gameStarted && "text-destructive animate-pulse")} />
              <span className="text-3xl font-mono font-bold tracking-tighter">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              {isPaused && (
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 uppercase text-[8px]">
                  {t.paused}
                </Badge>
              )}
            </div>
            <div className="relative pt-2">
              <div className="flex justify-between text-[10px] mb-1.5 text-muted-foreground uppercase tracking-widest font-bold">
                <span>{t.alignment}</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-muted/30" />
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">{t.output}</p>
              <div className="text-5xl font-headline font-black text-white tabular-nums">
                {score.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-morphism p-6 border-secondary/20 hidden md:block">
           <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4 font-bold flex items-center gap-2">
             <Shield className="w-3 h-3 text-primary" /> Sector Status
           </p>
           <div className="space-y-2">
             <div className="flex justify-between text-[9px] uppercase tracking-widest">
                <span className="text-muted-foreground">Encryption</span>
                <span className="text-primary font-bold">Stable</span>
             </div>
             <div className="flex justify-between text-[9px] uppercase tracking-widest">
                <span className="text-muted-foreground">Neural Link</span>
                <span className="text-secondary font-bold">Active</span>
             </div>
             <div className="flex justify-between text-[9px] uppercase tracking-widest">
                <span className="text-muted-foreground">AI Core</span>
                <span className="text-amber-400 font-bold">Online</span>
             </div>
           </div>
        </Card>
      </div>

      {/* Center - Hex Grid or Hall of Fame with STELLAR FRAME */}
      <div className={cn(
        "lg:w-3/4 flex flex-col relative stellar-frame breathing-glow min-h-[650px] z-10",
        flashColor === 'cyan' && "match-flash-cyan",
        flashColor === 'gold' && "match-flash-gold"
      )}>
        <div className="nebula-scroll" />
        
        <div className="floating-shard top-10 left-10" style={{ animationDelay: '0s' }} />
        <div className="floating-shard bottom-20 right-10" style={{ animationDelay: '2s' }} />
        <div className="floating-shard top-40 right-20" style={{ animationDelay: '5s' }} />
        
        <div className="corner-accent top-0 left-0 border-t-amber-400 border-l-amber-400 rounded-tl-3xl" />
        <div className="corner-accent top-0 right-0 border-t-amber-400 border-r-amber-400 rounded-tr-3xl" />
        <div className="corner-accent bottom-0 left-0 border-b-amber-400 border-l-amber-400 rounded-bl-3xl" />
        <div className="corner-accent bottom-0 right-0 border-b-amber-400 border-r-amber-400 rounded-br-3xl" />

        {!gameStarted ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-700">
             <div className="mb-12 relative">
                <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse" />
                <h1 className="text-6xl font-headline font-black italic text-white tracking-tighter uppercase mb-2">STELLAR SHIFT</h1>
                <p className="text-[10px] tracking-[0.6em] text-primary font-bold uppercase">{t.protocol}</p>
             </div>
             
             <button 
              onClick={startGame}
              className="btn-cosmic-start group animate-pulse-slow"
             >
               <span className="relative z-10 flex items-center gap-3">
                 <Play className="w-8 h-8 fill-white" />
                 {t.start}
               </span>
             </button>

             <div className="mt-12 grid grid-cols-2 gap-8 max-w-sm">
                <div className="text-center">
                  <div className="text-primary text-xl font-bold font-headline">{bestScore.toLocaleString()}</div>
                  <div className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">{t.best}</div>
                </div>
                <div className="text-center">
                  <div className="text-secondary text-xl font-bold font-headline">{level}</div>
                  <div className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">{t.highest}</div>
                </div>
             </div>
          </div>
        ) : showHallOfFame ? (
          <HallOfFame title={t.hallOfFame} subtitle={t.highest} />
        ) : (
          <div className="relative z-10 flex flex-col h-full">
            {isGameOver && (
              <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <Skull className="w-20 h-20 text-destructive mb-6 animate-bounce" />
                <h2 className="text-5xl font-headline font-black text-white mb-2 tracking-tighter">{t.missionTerminated}</h2>
                <Button onClick={handleReboot} size="lg" className="bg-destructive hover:bg-destructive/80 px-12 h-14 font-black uppercase tracking-[0.2em]">{t.reboot}</Button>
              </div>
            )}
            {isWin && (
              <div className="absolute inset-0 z-50 bg-primary/30 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
                <Trophy className="w-20 h-20 text-white mb-6 animate-pulse" />
                <h2 className="text-5xl font-headline font-black text-white mb-2 tracking-tighter">{t.victory}</h2>
              </div>
            )}
            {(isInputFrozen && !isProcessing) && (
              <div className="absolute inset-4 z-40 bg-black/40 backdrop-blur-[2px] border-2 border-primary/20 rounded-2xl flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
                {isPaused || isSettingsOpen ? (
                  <Pause className="w-12 h-12 text-primary animate-pulse mb-2" />
                ) : (
                  <Lock className="w-12 h-12 text-destructive animate-pulse mb-2" />
                )}
                <span className="text-primary font-black text-xs uppercase tracking-[0.5em]">
                  {isPaused || isSettingsOpen ? t.paused : t.missionTerminated}
                </span>
              </div>
            )}

            <div className="flex-1 relative p-12 overflow-hidden flex items-center justify-center">
              <div 
                className={cn("relative transition-all duration-700", isInputFrozen && "opacity-50 grayscale contrast-125")} 
                style={{ width: `${GRID_SIZE * HEX_WIDTH}px`, height: `${(GRID_SIZE - 1) * HEX_WIDTH}px`, marginLeft: `-${HEX_WIDTH/2}px` }}
              >
                {entities.map((entity) => (
                  <Entity 
                    key={entity.id} 
                    entity={entity} 
                    isSelected={selectedId === entity.id}
                    onSelect={handleSelect}
                    disabled={isInputFrozen}
                  />
                ))}
              </div>
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-32 bg-cyan-400 blur-[2px] opacity-40 animate-pulse" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-32 bg-violet-400 blur-[2px] opacity-40 animate-pulse" />

            <div className="w-full h-24 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent border-t border-primary/20 flex items-center justify-center gap-12 px-12 z-40 mt-auto backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-primary font-headline text-[10px] uppercase tracking-[0.5em] font-black">
                  <Shield className="w-4 h-4 animate-pulse" /> Vanguard Wall
                </div>
                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-sm bg-primary/40 border border-primary/20" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-secondary font-headline text-[10px] uppercase tracking-[0.5em] font-black opacity-60">
                <Cpu className="w-4 h-4 animate-spin-slow" /> Core Stable
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="bg-[#1a0b2e]/80 backdrop-blur-2xl border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)] rounded-3xl p-10 max-w-sm">
          <AlertDialogHeader className="text-center space-y-6">
            <AlertDialogTitle className="text-white font-headline text-3xl font-light tracking-[0.15em] uppercase text-center">
              {t.abandonMission}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cyan-200/60 uppercase text-[9px] tracking-[0.3em] font-medium leading-relaxed">
              {t.abandonDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-col gap-4 mt-10">
            <AlertDialogAction 
              onClick={confirmAbort}
              className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50 uppercase text-[10px] font-black tracking-[0.3em] h-14 rounded-full transition-all duration-300 shadow-lg"
            >
              {t.yes}
            </AlertDialogAction>
            <AlertDialogCancel 
              onClick={cancelAbort}
              className="w-full bg-amber-400 text-black hover:bg-amber-300 border-none shadow-[0_0_20px_rgba(251,191,36,0.4)] uppercase text-[10px] font-black tracking-[0.3em] h-14 rounded-full transition-all duration-300"
            >
              {t.no}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

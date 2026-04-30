import { Board } from '@/components/game/Board';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0512]">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="starfield starfield-parallax" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/20 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <header className="w-full max-w-7xl mx-auto p-8 flex justify-between items-center z-10">
        <div className="group cursor-default">
          <h1 className="font-headline text-5xl font-black tracking-tighter text-white uppercase italic transition-all group-hover:tracking-normal group-hover:text-primary">
            Stellar <span className="text-primary group-hover:text-white transition-colors">Shift</span>
          </h1>
          <p className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground font-bold mt-1">
            <span className="text-primary animate-pulse">●</span> Celestial Alignment Protocol
          </p>
        </div>
        <div className="hidden md:flex gap-4">
           <div className="px-6 py-2 glass-morphism rounded-full text-xs font-bold uppercase tracking-widest text-white border-white/10 hover:border-primary/50 transition-colors">
             Sector 7G-Alpha
           </div>
        </div>
      </header>

      <Board />

      <footer className="w-full p-8 text-center text-[10px] text-muted-foreground/40 z-10 uppercase tracking-[0.4em]">
        &copy; 2024 STELLAR SHIFT | NEURAL LINK ESTABLISHED | V0.8.4
      </footer>
    </main>
  );
}

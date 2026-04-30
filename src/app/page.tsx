
import { Board } from '@/components/game/Board';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <header className="w-full max-w-7xl mx-auto p-8 flex justify-between items-center z-10">
        <div>
          <h1 className="font-headline text-4xl font-black tracking-tighter text-white uppercase italic">
            Stellar <span className="text-primary">Shift</span>
          </h1>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">Celestial Alignment Protocol</p>
        </div>
        <div className="hidden md:flex gap-4">
           <div className="px-4 py-2 glass-morphism rounded-full text-xs font-bold uppercase tracking-wider text-white border-white/20">
             Sector 7G-Alpha
           </div>
        </div>
      </header>

      <Board />

      <footer className="w-full p-8 text-center text-xs text-muted-foreground/50 z-10">
        &copy; 2024 STELLAR SHIFT | CELESTIAL ALIGNMENT ENGINE ACTIVE
      </footer>
    </main>
  );
}

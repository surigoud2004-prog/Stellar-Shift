
"use client";

import Link from 'next/link';
import { ParallaxBackground } from '@/components/game/ParallaxBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center relative bg-black overflow-hidden p-6">
      <ParallaxBackground />
      
      <div className="z-10 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-primary hover:bg-white/5 gap-2 uppercase font-black tracking-widest text-xs">
              <ArrowLeft className="w-4 h-4" />
              Return to Sector
            </Button>
          </Link>
        </div>

        <Card className="glass-morphism p-10 border-primary/20 bg-black/80 shadow-[0_0_100px_rgba(168,85,247,0.2)]">
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-headline font-black text-white uppercase italic tracking-tighter">Privacy Protocol</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-black">Neural Link Security Clearance</p>
            </div>
          </div>

          <div className="space-y-8 text-white/80 font-medium leading-relaxed">
            <section>
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-5 h-5 text-secondary" />
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Data Oversight</h2>
              </div>
              <p className="text-sm">
                Stellar Shift utilizes <strong>Firebase Analytics</strong> to monitor mission performance and sector stability. This telemetry helps us optimize the neural link and identify potential cosmic anomalies in the game loop.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Monetization Signals</h2>
              </div>
              <p className="text-sm">
                We integrate <strong>Google AdMob</strong> to facilitate tactical resource procurement. These advertisements support the ongoing maintenance of the Stellar Shift network. Your interaction with these signals is governed by Google's global privacy standards.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Pilot Protection</h2>
              </div>
              <p className="text-sm">
                Your identity and telemetry are sacred. <strong>No personal data is sold to third-party entities.</strong> All archival data is encrypted and used strictly for internal mission enhancement and global leaderboard rankings.
              </p>
            </section>

            <section className="pt-6 border-t border-white/10">
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-[0.3em] font-bold">
                Last Synchronized: February 2025 • Command Authorization Confirmed
              </p>
            </section>
          </div>
        </Card>
      </div>
    </main>
  );
}

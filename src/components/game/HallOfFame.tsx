
"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Trophy, User, Calendar, Star, Share2, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { playUIClickSound } from '@/lib/audio-system';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  score: number;
  level: number;
  timestamp: number;
}

interface HallOfFameProps {
  title: string;
  subtitle: string;
  onAwardShare: () => void;
}

export function HallOfFame({ title, subtitle, onAwardShare }: HallOfFameProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    // Ensure pilot is authenticated before attempting to query the global archive
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth);
        } catch (authError) {
          console.warn("Auth initialization failed", authError);
          setLoading(false);
          return;
        }
      } else {
        fetchLeaderboard();
      }
    });

    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
        setEntries(results);
      } catch (e: any) {
        // Construct contextual error for better debugging loops
        const permissionError = new FirestorePermissionError({
          path: 'leaderboard',
          operation: 'list',
        } satisfies SecurityRuleContext);
        
        errorEmitter.emit('permission-error', permissionError);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribeAuth();
  }, [db, auth]);

  const handleShare = () => {
    playUIClickSound();
    onAwardShare();
  };

  return (
    <Card className="glass-morphism p-10 h-full flex flex-col border-primary/40 bg-black/80 overflow-hidden shadow-[0_0_150px_rgba(168,85,247,0.3)]">
      <div className="flex items-center gap-6 mb-10 border-b border-white/10 pb-8">
        <div className="p-4 rounded-[2rem] bg-primary/20 border border-primary/40">
           <Trophy className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter">{title}</h2>
          <p className="text-[12px] uppercase tracking-[0.4em] text-muted-foreground font-black">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar mb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 gap-4">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
            <p className="text-[10px] text-primary uppercase font-black tracking-widest animate-pulse">Syncing Archive...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-muted-foreground italic text-lg">Archive currently empty. Secure a sector to establish rank.</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all group">
              <div className="flex items-center gap-6">
                <span className="font-headline text-3xl font-black text-primary/60 w-12 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  #{i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-3 font-black text-2xl text-white uppercase tracking-tighter italic group-hover:text-primary transition-colors">
                    <User className="w-5 h-5 text-secondary" />
                    {entry.displayName || 'Unknown Pilot'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                    <Calendar className="w-4 h-4" />
                    {entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] tracking-tighter">
                  {entry.score.toLocaleString()}
                </div>
                <div className="flex items-center justify-end gap-2 text-[10px] text-secondary font-black uppercase tracking-widest mt-1">
                  <Star className="w-3 h-3 fill-secondary" />
                  Sector {entry.level || 1} Reached
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-8 border-t border-white/10 flex flex-col items-center gap-4">
        <Button 
          onClick={handleShare}
          className="w-full h-16 bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Share2 className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
          Transmit Rank
          <span className="ml-4 px-3 py-1 bg-black/40 rounded-lg text-[10px] flex items-center gap-2">
            <Coins className="w-3 h-3 text-yellow-400" /> +50
          </span>
        </Button>
        <p className="text-[9px] text-muted-foreground uppercase tracking-[0.5em] font-bold">
          Neural link broadcast authorized by Sector Command
        </p>
      </div>
    </Card>
  );
}

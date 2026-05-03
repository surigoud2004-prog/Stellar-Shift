"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { Card } from '@/components/ui/card';
import { Trophy, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
}

export function HallOfFame({ title, subtitle }: HallOfFameProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { db, auth } = initializeFirebase();
        if (!auth.currentUser) await signInAnonymously(auth);
        
        const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(100));
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
        setEntries(results);
      } catch (e) {
        const permissionError = new FirestorePermissionError({
          path: 'leaderboard',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <Card className="glass-morphism p-6 h-full flex flex-col border-primary/20 bg-black/60 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-primary animate-pulse" />
        <div>
          <h2 className="text-2xl font-headline font-bold text-white">{title}</h2>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl font-bold text-primary/60 w-8">{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <User className="w-3 h-3 text-secondary" />
                    {entry.displayName || 'Unknown Pilot'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                    <Calendar className="w-3 h-3" />
                    {entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{entry.score.toLocaleString()}</div>
                <div className="text-[10px] text-secondary font-bold">LVL {entry.level || 1}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
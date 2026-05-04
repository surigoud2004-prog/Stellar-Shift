"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore, useMemoFirebase } from '@/firebase';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Calendar, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface LoreLog {
  id: string;
  event: string;
  snippet: string;
  timestamp: number;
}

interface MissionLogsProps {
  isOpen: boolean;
  onClose: () => void;
  labels: any;
}

export function MissionLogs({ isOpen, onClose, labels }: MissionLogsProps) {
  const firestore = useFirestore();
  const auth = useAuth();
  const [logs, setLogs] = useState<LoreLog[]>([]);
  const [loading, setLoading] = useState(true);

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || !auth?.currentUser) return null;
    return query(
      collection(firestore, 'users', auth.currentUser.uid, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
  }, [firestore, auth?.currentUser?.uid]);

  useEffect(() => {
    if (!logsQuery) {
      if (!auth?.currentUser) setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LoreLog[];
      setLogs(results);
      setLoading(false);
    }, async (error) => {
      const permissionError = new FirestorePermissionError({
        path: `users/${auth.currentUser?.uid}/logs`,
        operation: 'list',
      } satisfies SecurityRuleContext);
      
      errorEmitter.emit('permission-error', permissionError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [logsQuery, auth?.currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl h-[80vh] glass-morphism border-primary/20 bg-black/60 overflow-hidden flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary animate-pulse" />
            <div>
              <h2 className="text-2xl font-headline font-black text-white uppercase italic tracking-tighter">
                {labels.archive || 'Sector Intel'}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Neural Link Memory Retrieval • Sector 7G
              </p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Syncing Archive...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center p-12">
                <p className="text-muted-foreground italic text-sm">No data recorded. Complete missions to generate sector intel.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-black text-secondary uppercase tracking-widest">
                        {log.event}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                      <Calendar className="w-3 h-3" />
                      {log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm') : 'N/A'}
                    </div>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">
                    {log.snippet}
                  </p>
                  <div className="mt-2 h-0.5 w-0 group-hover:w-full bg-primary/30 transition-all duration-500" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-[8px] text-muted-foreground uppercase tracking-[0.4em]">
            Encrypted Telemetry Log • End of Transmission
          </p>
        </div>
      </Card>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      console.error('Firebase Permission Error:', error);
      toast({
        variant: 'destructive',
        title: 'Security Protocol Violation',
        description: 'Sector data access denied. Please re-authenticate.',
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return <>{children}</>;
}

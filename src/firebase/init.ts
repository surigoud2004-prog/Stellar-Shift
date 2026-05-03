
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';
import { useRef } from 'react';

/**
 * Idempotently initializes Firebase services.
 */
export function initializeFirebase() {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth, db: firestore };
}

/**
 * Stabilizes Firebase Query or DocumentReference objects to prevent infinite loops in hooks.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const ref = useRef<T>(null);
  const depsRef = useRef<any[]>(null);

  if (depsRef.current === null || !depsRef.current.every((d, i) => d === deps[i])) {
    ref.current = factory();
    depsRef.current = deps;
  }

  return ref.current!;
}

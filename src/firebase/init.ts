'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { firebaseConfig } from './config';
import { useRef } from 'react';

let firebaseApp: FirebaseApp;
let firestore: Firestore;
let auth: Auth;
let analyticsInstance: Analytics | undefined;

/**
 * Idempotently initializes Firebase services for production use.
 */
export function initializeFirebase() {
  if (!firebaseApp) {
    // Ensure we have at least an API Key before initializing
    if (!firebaseConfig.apiKey) {
      console.warn('Firebase API Key missing. Check your environment variables.');
    }
    
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);

    // Initialize Analytics only in the browser
    if (typeof window !== 'undefined' && firebaseConfig.appId) {
      isSupported().then(yes => {
        if (yes) {
          try {
            analyticsInstance = getAnalytics(firebaseApp);
          } catch (e) {
            console.warn('Firebase Analytics failed to initialize:', e);
          }
        }
      }).catch(err => {
        console.warn('Firebase Analytics isSupported check failed:', err);
      });
    }
  }

  return { firebaseApp, firestore, auth, analytics: analyticsInstance, db: firestore };
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

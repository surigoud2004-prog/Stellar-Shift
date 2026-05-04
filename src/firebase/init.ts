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
 * Idempotently initializes Firebase services.
 */
export function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firestore = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);

    // Helper to detect if a value is a placeholder from the generator or studio
    const isPlaceholder = (val?: string) => 
      !val || 
      val.includes('fake-key') || 
      val.includes('abcdef123456') || 
      val.includes('123456789') ||
      val === 'YOUR_API_KEY';

    // Initialize Analytics only in the browser and if the config looks valid/non-placeholder
    if (
      typeof window !== 'undefined' && 
      !isPlaceholder(firebaseConfig.apiKey) && 
      !isPlaceholder(firebaseConfig.appId)
    ) {
      isSupported().then(yes => {
        if (yes) {
          try {
            // Analytics initialization can still fail if the Installations API is disabled 
            // or if the config is partially correct but mismatched.
            analyticsInstance = getAnalytics(firebaseApp);
          } catch (e) {
            console.warn('Firebase Analytics failed to initialize (check if Google Analytics is enabled in Firebase Console):', e);
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


'use client';

export * from './init';
export * from './provider';
export * from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { initializeFirebase } from './init';

export function logAnalyticsEvent(eventName: string, params?: Record<string, any>) {
  const { analytics } = initializeFirebase();
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  }
}

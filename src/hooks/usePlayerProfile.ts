
"use client";

import { useState, useEffect, useCallback } from 'react';
import { playLevelUpSound, playUIClickSound } from '@/lib/audio-system';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

export interface PlayerProfile {
  uid?: string;
  name: string;
  avatarId: string;
  xp: number;
  totalMatches: number;
  gamesWon: number;
  starsCollected: number;
  allTimeHigh: number;
  coins: number;
  currentLevel: number;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'STEL-PILOT',
  avatarId: 'avatar-1',
  xp: 0,
  totalMatches: 0,
  gamesWon: 0,
  starsCollected: 0,
  allTimeHigh: 0,
  coins: 0,
  currentLevel: 1,
};

export function usePlayerProfile() {
  const auth = useAuth();
  const db = useFirestore();
  
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('stellar_player_profile');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });
  
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!auth.currentUser || !db) return;

    const userRef = doc(db, 'users', auth.currentUser.uid);
    
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const cloudData = snap.data() as PlayerProfile;
        setProfile(cloudData);
        localStorage.setItem('stellar_player_profile', JSON.stringify(cloudData));
      } else {
        const initialProfile = { ...DEFAULT_PROFILE, uid: auth.currentUser!.uid };
        setDoc(userRef, initialProfile);
        setProfile(initialProfile);
        localStorage.setItem('stellar_player_profile', JSON.stringify(initialProfile));
      }
    });

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const updated = snap.data() as PlayerProfile;
        setProfile(updated);
        localStorage.setItem('stellar_player_profile', JSON.stringify(updated));
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser, db]);

  const saveProfile = useCallback((newProfile: PlayerProfile) => {
    setProfile(newProfile);
    if (auth.currentUser && db) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, newProfile, { merge: true });
    }
    try {
      localStorage.setItem('stellar_player_profile', JSON.stringify(newProfile));
    } catch (e) {}
  }, [auth.currentUser, db]);

  const updateStats = useCallback((score: number, matches: number, isWin: boolean = false, coinsWon: number = 0, newLevel?: number) => {
    setProfile(prev => {
      const newXP = (prev.xp || 0) + Math.floor(score / 10);
      const oldRank = Math.floor((prev.xp || 0) / 1000);
      const newRank = Math.floor(newXP / 1000);

      if (newRank > oldRank) {
        try { playLevelUpSound(); } catch (e) {}
      }

      const next: PlayerProfile = {
        ...prev,
        xp: newXP,
        totalMatches: (prev.totalMatches || 0) + matches,
        gamesWon: isWin ? (prev.gamesWon || 0) + 1 : (prev.gamesWon || 0),
        starsCollected: (prev.starsCollected || 0) + Math.floor(score / 50),
        allTimeHigh: Math.max(prev.allTimeHigh || 0, score),
        coins: (prev.coins || 0) + coinsWon,
        currentLevel: newLevel !== undefined ? newLevel : (prev.currentLevel || 1),
      };
      
      if (auth.currentUser && db) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, next, { merge: true });
      }
      try {
        localStorage.setItem('stellar_player_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, [auth.currentUser, db]);

  const spendCoins = useCallback((amount: number): boolean => {
    if ((profile.coins || 0) < amount) return false;
    const next = { ...profile, coins: profile.coins - amount };
    saveProfile(next);
    return true;
  }, [profile, saveProfile]);

  const setAvatar = (id: string) => {
    try { playUIClickSound(); } catch (e) {}
    saveProfile({ ...profile, avatarId: id });
  };

  const setName = (name: string) => {
    saveProfile({ ...profile, name });
  };

  const getRank = (xp: number) => {
    const level = Math.floor((xp || 0) / 1000);
    if (level < 1) return 'cadet';
    if (level < 3) return 'pilot';
    if (level < 10) return 'commander';
    if (level < 25) return 'admiral';
    return 'legend';
  };

  const resetProfile = () => {
    localStorage.removeItem('stellar_player_profile');
    if (auth.currentUser && db) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      setDoc(userRef, { ...DEFAULT_PROFILE, uid: auth.currentUser.uid });
    }
    window.location.reload();
  };

  return {
    profile,
    showProfile,
    setShowProfile,
    updateStats,
    spendCoins,
    setAvatar,
    setName,
    getRank,
    resetProfile
  };
}

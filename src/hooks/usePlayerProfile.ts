
"use client";

import { useState, useEffect, useCallback } from 'react';
import { playLevelUpSound, playUIClickSound } from '@/lib/audio-system';

export interface PlayerProfile {
  name: string;
  avatarId: string;
  xp: number;
  totalMatches: number;
  gamesWon: number;
  starsCollected: number;
  allTimeHigh: number;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'STEL-PILOT',
  avatarId: 'avatar-1',
  xp: 0,
  totalMatches: 0,
  gamesWon: 0,
  starsCollected: 0,
  allTimeHigh: 0,
};

export function usePlayerProfile() {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stellar_player_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load profile", e);
    }
  }, []);

  const saveProfile = useCallback((newProfile: PlayerProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('stellar_player_profile', JSON.stringify(newProfile));
    } catch (e) {}
  }, []);

  const updateStats = useCallback((score: number, matches: number, isWin: boolean = false) => {
    setProfile(prev => {
      const newXP = prev.xp + Math.floor(score / 10);
      const oldRank = Math.floor(prev.xp / 1000);
      const newRank = Math.floor(newXP / 1000);

      if (newRank > oldRank) {
        try { playLevelUpSound(); } catch (e) {}
      }

      const next: PlayerProfile = {
        ...prev,
        xp: newXP,
        totalMatches: prev.totalMatches + matches,
        gamesWon: isWin ? prev.gamesWon + 1 : prev.gamesWon,
        starsCollected: prev.starsCollected + Math.floor(score / 50),
        allTimeHigh: Math.max(prev.allTimeHigh, score),
      };
      
      try {
        localStorage.setItem('stellar_player_profile', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const setAvatar = (id: string) => {
    try { playUIClickSound(); } catch (e) {}
    saveProfile({ ...profile, avatarId: id });
  };

  const setName = (name: string) => {
    saveProfile({ ...profile, name });
  };

  const getRank = (xp: number) => {
    const level = Math.floor(xp / 1000);
    if (level < 1) return 'cadet';
    if (level < 3) return 'pilot';
    if (level < 10) return 'commander';
    if (level < 25) return 'admiral';
    return 'legend';
  };

  return {
    profile,
    showProfile,
    setShowProfile,
    updateStats,
    setAvatar,
    setName,
    getRank
  };
}

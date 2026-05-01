
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  X, User, Trophy, Star, Target, Zap, 
  ChevronLeft, ChevronRight, Edit3, Check, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlayerProfile } from '@/hooks/usePlayerProfile';

interface ProfileDashboardProps {
  profile: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateAvatar: (id: string) => void;
  getRankLabel: (xp: number) => string;
  labels: any;
}

export function ProfileDashboard({ 
  profile, 
  isOpen, 
  onClose, 
  onUpdateName, 
  onUpdateAvatar, 
  getRankLabel,
  labels
}: ProfileDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  
  const avatars = PlaceHolderImages.filter(img => img.id.startsWith('avatar-'));
  const currentAvatar = avatars.find(a => a.id === profile.avatarId) || avatars[0];
  
  const rankLevel = Math.floor(profile.xp / 1000) + 1;
  const xpInLevel = profile.xp % 1000;
  const xpPercent = (xpInLevel / 1000) * 100;

  const handleSaveName = () => {
    onUpdateName(tempName);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <Card className="w-full max-w-2xl glass-morphism border-cyan-500/30 overflow-hidden relative shadow-[0_0_100px_rgba(6,182,212,0.2)]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side: Avatar & Identity */}
          <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-cyan-400/20 blur-[40px] rounded-full animate-pulse" />
              <div className="relative w-32 h-32 rounded-full border-4 border-cyan-400 overflow-hidden">
                <Image 
                  src={currentAvatar.imageUrl} 
                  alt={currentAvatar.description} 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>

            <div className="w-full space-y-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button size="icon" onClick={handleSaveName} className="bg-cyan-500 hover:bg-cyan-400">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-3xl font-headline font-black text-white tracking-tighter uppercase italic">
                    {profile.name}
                  </h2>
                  <button onClick={() => setIsEditing(true)} className="text-white/40 hover:text-cyan-400">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-full px-6 py-1 inline-block">
                <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-cyan-400">
                  {labels[getRankLabel(profile.xp)]} • LVL {rankLevel}
                </span>
              </div>
              
              <div className="w-full space-y-2 mt-4">
                <div className="flex justify-between text-[8px] uppercase tracking-widest text-cyan-200/60 font-black">
                  <span>{labels.xp}</span>
                  <span>{xpInLevel} / 1000</span>
                </div>
                <Progress value={xpPercent} className="h-1 bg-white/5" />
              </div>
            </div>

            <div className="mt-8 w-full">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-black">{labels.changeAvatar}</p>
              <div className="grid grid-cols-3 gap-3">
                {avatars.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => onUpdateAvatar(av.id)}
                    className={cn(
                      "relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
                      profile.avatarId === av.id ? "border-cyan-400 scale-105" : "border-white/5 opacity-50 hover:opacity-100"
                    )}
                  >
                    <Image src={av.imageUrl} alt={av.description} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Stats Grid */}
          <div className="w-full md:w-1/2 p-8 bg-black/20 flex flex-col justify-between">
             <div className="space-y-6">
               <h3 className="text-[10px] uppercase tracking-[0.5em] text-cyan-400/60 font-black flex items-center gap-2">
                 <Target className="w-3 h-3" /> {labels.stats}
               </h3>

               <div className="grid grid-cols-1 gap-4">
                  <StatBox 
                    icon={Zap} 
                    label={labels.matches} 
                    value={profile.totalMatches.toLocaleString()} 
                    color="text-primary" 
                  />
                  <StatBox 
                    icon={Trophy} 
                    label={labels.wins} 
                    value={profile.gamesWon.toLocaleString()} 
                    color="text-amber-400" 
                  />
                  <StatBox 
                    icon={Star} 
                    label={labels.stars} 
                    value={profile.starsCollected.toLocaleString()} 
                    color="text-secondary" 
                  />
                  <StatBox 
                    icon={Zap} 
                    label={labels.allTimeHigh} 
                    value={profile.allTimeHigh.toLocaleString()} 
                    color="text-white" 
                  />
               </div>
             </div>

             <div className="pt-8 border-t border-white/10 space-y-6">
                <p className="text-[9px] text-muted-foreground/40 leading-relaxed italic text-center uppercase tracking-widest">
                  Neural link sync established. Telemetry verified by Sector command.
                </p>
                <Button 
                  onClick={onClose}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-[0.2em] h-14 rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] group"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  {labels.exit}
                </Button>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-white/5", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-black">{label}</span>
      </div>
      <span className="text-xl font-headline font-bold text-white">{value}</span>
    </div>
  );
}

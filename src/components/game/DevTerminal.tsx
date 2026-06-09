
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, X, Copy, Check, Github, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playUIClickSound } from '@/lib/audio-system';

interface DevTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string;
}

export function DevTerminal({ isOpen, onClose, repoUrl }: DevTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "Initializing Git handshake... Remote origin detected: " + repoUrl;

  useEffect(() => {
    if (isOpen) {
      let i = 0;
      setTypedText("");
      const interval = setInterval(() => {
        setTypedText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isOpen, repoUrl]);

  const commands = [
    "git init",
    "git add .",
    'git commit -m "Mission update"',
    `git remote add origin ${repoUrl}`,
    "git branch -M main",
    "git push -u origin main"
  ].join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(commands);
    setCopied(true);
    playUIClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl bg-[#0a0a0c] border-primary/40 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(168,85,247,0.3)]">
        {/* Terminal Header */}
        <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-2 text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Mission Control Terminal
            </span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm space-y-4 h-[400px] overflow-y-auto custom-scrollbar bg-black/40">
          <div className="text-primary flex items-start gap-2">
            <span className="opacity-50">$</span>
            <span>{typedText}<span className="animate-pulse">_</span></span>
          </div>

          <div className="space-y-2 mt-6">
            <div className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-2 border-b border-white/5 pb-1">
              Deployment Sequence
            </div>
            <div className="bg-black/60 p-4 rounded-xl border border-white/5 relative group">
              <pre className="text-green-400/90 whitespace-pre-wrap leading-relaxed text-xs">
                {commands}
              </pre>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="absolute top-2 right-2 text-white/20 hover:text-primary hover:bg-white/5 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-white/5">
            <a 
              href={repoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] text-zinc-400 hover:text-white uppercase font-black transition-colors"
            >
              <Github className="w-4 h-4" /> View on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-zinc-900/50 px-6 py-4 flex items-center justify-between">
          <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em]">
            Status: Ready for broadcast
          </div>
          <Button 
            onClick={handleCopy}
            className="bg-primary hover:bg-primary/80 text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-lg"
          >
            {copied ? "Copied to Buffer" : "Copy Command Block"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

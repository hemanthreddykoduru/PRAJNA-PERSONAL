import React, { useEffect, useState } from 'react';
import { Trophy, Star, Sparkles } from 'lucide-react';

export function CelebrationEffect({ isVisible, onComplete }: { isVisible: boolean; onComplete: () => void }) {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center pointer-events-none">
      {/* Background Dim */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-500" />
      
      {/* Particles (CSS Animated) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-secondary w-2 h-2 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Center Card */}
      <div className="relative bg-white rounded-[40px] p-10 shadow-2xl border-4 border-secondary/30 flex flex-col items-center animate-in zoom-in slide-in-from-bottom-12 duration-700">
        <div className="w-24 h-24 bg-secondary/20 rounded-[32px] flex items-center justify-center mb-6 relative">
          <Trophy size={48} className="text-secondary animate-bounce" />
          <div className="absolute inset-0 animate-spin-slow">
            <Sparkles size={24} className="absolute top-0 right-0 text-amber-400" />
            <Star size={20} className="absolute bottom-0 left-0 text-amber-300" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-gray-900 text-center leading-tight">
          Excellence Recognized!
        </h2>
        <p className="text-gray-500 font-medium mt-2 text-center max-w-[280px]">
          Your research paper has been approved and added to the <span className="text-primary font-bold">GITAM Impact Ledger</span>.
        </p>

        <div className="mt-8 flex gap-2">
          <div className="px-4 py-2 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
            +50 PRAJNA Points
          </div>
          <div className="px-4 py-2 bg-emerald-100 rounded-full text-[10px] font-black text-emerald-700 uppercase tracking-widest">
            Level Up!
          </div>
        </div>
      </div>
    </div>
  );
}

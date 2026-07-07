import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Sunrise, AlertCircle, Zap, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import pragatiAvatar from '../assets/pragati-avatar.png';
import { SlotCounter } from './SlotCounter';

// ─── Typewriter hook ─────────────────────────────────────────────
function useTypewriter(text: string, speed = 22, active = true) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}


// ─── Time greeting ───────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Good morning', Icon: Sunrise, color: '#F59E0B' };
  if (h >= 12 && h < 17) return { text: 'Good afternoon', Icon: Sun, color: '#FBBF24' };
  return { text: 'Good evening', Icon: Moon, color: '#818CF8' };
}

export function MorningBriefBanner() {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [activated, setActivated] = useState(true);
  const [launching, setLaunching] = useState(false);
  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] || 'Professor';

  const aiMessage = `${greeting.text}, Professor ${firstName}! Your workspace is ready. You're currently ranked #4 in the department. Let's clear those 2 urgent tasks and make it a highly productive day!`;

  const typewriterText = useTypewriter(aiMessage, 20, activated);

  const handleAvatarClick = () => {
    if (scanning || activated) return;
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setActivated(true);
    }, 1600);
  };

  const handleLetsDoIt = () => {
    if (launching) return;
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      const target = document.getElementById('todays-priorities');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('prajna-highlight');
        setTimeout(() => target.classList.remove('prajna-highlight'), 2000);
      }
    }, 600);
  };

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes prajna-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes prajna-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes prajna-ring {
          0% { transform: scale(0.85); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes prajna-ring2 {
          0% { transform: scale(0.85); opacity: 0.4; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes prajna-scan {
          0% { top: 0%; opacity: 1; }
          100% { top: 100%; opacity: 0.3; }
        }
        @keyframes prajna-burst {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes prajna-holo {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        @keyframes prajna-warp {
          0% { letter-spacing: normal; opacity: 1; }
          60% { letter-spacing: 0.4em; opacity: 0; }
          100% { letter-spacing: normal; opacity: 1; }
        }
        @keyframes prajna-orbit {
          from { transform: rotate(0deg) translateX(58px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(58px) rotate(-360deg); }
        }
        @keyframes prajna-orbit2 {
          from { transform: rotate(120deg) translateX(72px) rotate(-120deg); }
          to   { transform: rotate(480deg) translateX(72px) rotate(-480deg); }
        }
        @keyframes prajna-orbit3 {
          from { transform: rotate(240deg) translateX(64px) rotate(-240deg); }
          to   { transform: rotate(600deg) translateX(64px) rotate(-600deg); }
        }
        @keyframes prajna-stat-pop {
          0% { transform: scale(0.7) translateY(12px); opacity: 0; }
          70% { transform: scale(1.06) translateY(-2px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes prajna-highlight {
          0%   { box-shadow: 0 0 0 0px rgba(135,206,235,0.6); }
          40%  { box-shadow: 0 0 0 8px rgba(135,206,235,0.3); }
          100% { box-shadow: 0 0 0 16px rgba(135,206,235,0); }
        }
        .prajna-float { animation: prajna-float 4s ease-in-out infinite; }
        .prajna-breathe { animation: prajna-breathe 3.5s ease-in-out infinite; }
        .prajna-burst { animation: prajna-burst 0.5s ease-out; }
        .prajna-stat-pop { animation: prajna-stat-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
        .prajna-highlight { animation: prajna-highlight 2s ease-out forwards; }
      `}</style>

      <div className="relative w-full rounded-[2rem] border border-border overflow-hidden mb-6 bg-surface">

        {/* Gradient tint — light: soft blue-to-white, dark: dark slate */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[10%] w-72 h-72 rounded-full blur-[100px] bg-primary/10" />
          <div className="absolute bottom-[-20%] right-[5%] w-64 h-64 rounded-full blur-[80px] bg-accent/8" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 p-7 lg:p-10">

          {/* ── Top row: Welcome text + time ── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-textMuted mb-1">Welcome back</p>
              <h1 className="text-3xl lg:text-4xl font-black text-text leading-none">
                {firstName}
                <span className="ml-3 inline-block w-2 h-2 rounded-full bg-emerald-400 align-middle animate-pulse" />
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl border border-border/40 bg-white/5">
              <greeting.Icon size={16} style={{ color: greeting.color }} />
              <span className="text-xs font-semibold text-textMuted">{greeting.text}</span>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">

            {/* ── Avatar column ── */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="relative w-36 h-36 cursor-pointer select-none"
                onClick={handleAvatarClick}
                title={activated ? 'PRAJNA AI is active' : 'Click to activate PRAJNA AI'}>


                {/* Holographic rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-36 h-36 rounded-full border border-primary/30"
                    style={{ animation: 'prajna-ring 2.5s ease-out infinite' }} />
                  <div className="absolute w-36 h-36 rounded-full border border-primary/20"
                    style={{ animation: 'prajna-ring2 2.5s ease-out infinite 0.8s' }} />
                </div>

                {/* Holographic overlay */}
                <div className="absolute inset-2 rounded-full pointer-events-none overflow-hidden z-20">
                  <div className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(135,206,235,0.15) 0%, transparent 50%, rgba(135,206,235,0.08) 100%)',
                      animation: 'prajna-holo 3s ease-in-out infinite',
                    }} />
                </div>

                {/* Avatar image */}
                <div className={`relative w-full h-full rounded-full overflow-hidden border-2 z-10
                  ${activated ? 'border-primary/60 shadow-[0_0_30px_8px_rgba(135,206,235,0.25)]' : 'border-border/40'}
                  ${scanning ? 'prajna-burst' : ''}
                  ${!scanning && !activated ? 'prajna-float' : ''}
                  transition-all duration-500`}
                >
                  <img src={pragatiAvatar} alt="PRAJNA AI" className="w-full h-full object-cover" />

                  {/* Laser scan overlay */}
                  {scanning && (
                    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-full">
                      <div className="absolute left-0 right-0 h-[3px] z-40"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #E33A0C, #87CEEB, #E33A0C, transparent)',
                          boxShadow: '0 0 12px 4px rgba(135,206,235,0.8)',
                          animation: 'prajna-scan 1.4s cubic-bezier(0.4,0,0.6,1) forwards',
                        }} />
                      <div className="absolute inset-0 rounded-full"
                        style={{ background: 'rgba(135,206,235,0.08)', animation: 'prajna-holo 0.4s ease-in-out infinite' }} />
                    </div>
                  )}

                  {/* Scan complete flash */}
                  {activated && (
                    <div className="absolute inset-0 rounded-full bg-primary/10 z-20 pointer-events-none" />
                  )}
                </div>

                {/* Status badge */}
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-30 whitespace-nowrap border transition-all duration-500 ${
                  scanning ? 'bg-accent/20 border-accent/40 text-accent' :
                  activated ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                  'bg-primary/10 border-primary/20 text-primary'
                }`}>
                  {scanning ? '⟳ Scanning...' : '✦ Active'}
                </div>
              </div>

              <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-1">PRAJNA AI Companion</p>
            </div>

            {/* ── Right column ── */}
            <div className="flex-1 flex flex-col gap-6 w-full">

              {/* AI greeting bubble */}
              <div className={`relative rounded-2xl border p-5 transition-all duration-700 ${
                activated
                  ? 'border-primary/30 bg-primary/5 opacity-100 translate-y-0'
                  : 'border-border/30 bg-white/3 opacity-40 translate-y-2'
              }`}>
                {/* Bubble tail */}
                <div className="hidden lg:block absolute top-6 -left-3 w-0 h-0"
                  style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `12px solid ${activated ? 'rgba(135,206,235,0.15)' : 'rgba(255,255,255,0.03)'}` }} />

                <div className="flex items-start gap-2 mb-2">
                  <Sparkles size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">PRAJNA AI</span>
                </div>
                <p className="text-sm text-text leading-relaxed font-medium min-h-[3.5rem]">
                  {typewriterText}
                  {activated && typewriterText.length < aiMessage.length && (
                    <span className="inline-block w-0.5 h-4 bg-primary align-middle ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {/* PRAJNA Score */}
                <div className="prajna-stat-pop rounded-2xl border border-primary/30 bg-primary/8 p-4 text-center" style={{ animationDelay: '100ms' }}>
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-2 border border-primary/20">
                    <Zap size={14} className="text-primary" />
                  </div>
                  <div className="flex items-end justify-center gap-0.5 leading-none">
                    <SlotCounter value={840} globalDelay={100} />
                    <span className="text-sm text-textMuted font-bold mb-0.5">/1k</span>
                  </div>
                  <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wider mt-1">PRAJNA Score</p>
                </div>

                {/* Dept Rank */}
                <div className="prajna-stat-pop rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-4 text-center" style={{ animationDelay: '250ms' }}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                    <Trophy size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex items-end justify-center gap-0.5 leading-none">
                    <span className="font-black text-3xl text-text">#</span>
                    <SlotCounter value={4} globalDelay={300} />
                  </div>
                  <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wider mt-1">Dept. Rank</p>
                </div>

                {/* Urgent Tasks */}
                <div className="prajna-stat-pop rounded-2xl border border-accent/30 bg-accent/8 p-4 text-center" style={{ animationDelay: '400ms' }}>
                  <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-2 border border-accent/20">
                    <AlertCircle size={14} className="text-accent" />
                  </div>
                  <div className="flex items-end justify-center leading-none">
                    <SlotCounter value={2} globalDelay={500} />
                  </div>
                  <p className="text-[10px] text-textMuted font-semibold uppercase tracking-wider mt-1">Today's Tasks</p>
                  <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Urgent</span>
                </div>
              </div>

              {/* Let's do it button */}
              <div className="flex justify-end">
                <button
                  onClick={handleLetsDoIt}
                  disabled={!activated}
                  className={`relative flex items-center gap-3 px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-[0.12em] overflow-hidden transition-all duration-500 group
                    ${activated
                      ? 'bg-gradient-to-r from-primary via-sky-400 to-emerald-400 text-slate-900 shadow-[0_8px_32px_rgba(135,206,235,0.35)] hover:shadow-[0_12px_48px_rgba(135,206,235,0.55)] hover:scale-[1.04] active:scale-[0.97]'
                      : 'bg-white/5 text-textMuted border border-border/30 cursor-not-allowed'
                    } ${launching ? 'scale-[0.97]' : ''}`}
                >
                  {/* Warp shimmer */}
                  {activated && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  )}
                  {/* Warp lines on click */}
                  {launching && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute h-px bg-white/60 rounded-full"
                          style={{
                            width: `${30 + i * 15}%`,
                            top: `${20 + i * 12}%`,
                            animation: `prajna-warp 0.6s ease-out ${i * 40}ms both`,
                          }} />
                      ))}
                    </div>
                  )}
                  <span className="relative z-10">Let's do it</span>
                  <ChevronRight size={18} className={`relative z-10 transition-transform duration-300 ${activated ? 'group-hover:translate-x-1' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

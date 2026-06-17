import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, Sparkles, Zap, Target, Mic, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAuthSession } from 'aws-amplify/auth';
import pragatiAvatar from '../assets/pragati-avatar.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Analyze Score', icon: <Zap size={11} /> },
  { label: 'Draft Report', icon: <Target size={11} /> },
  { label: 'Research Ideas', icon: <Sparkles size={11} /> },
];

async function postMessage(apiBase: string, payload: object): Promise<{ content: string; timestamp: number } | null> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  const res = await fetch(`${apiBase}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || data.content;
  const timestamp = data.timestamp || Date.now();
  return content ? { content, timestamp } : null;
}

export function AICompanionChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((msg: Message) => {
    window.speechSynthesis.cancel();
    if (speakingId === msg.id) {
      setSpeakingId(null);
      return;
    }
    const utter = new SpeechSynthesisUtterance(msg.content);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    // Pick a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /female|zira|samantha|karen|moira|fiona|victoria/i.test(v.name))
      ?? voices.find(v => v.lang.startsWith('en'));
    if (preferred) utter.voice = preferred;
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);
    utteranceRef.current = utter;
    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utter);
  }, [speakingId]);

  // Stop speech when chat closes
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
  }, [isOpen]);

  const rawApiBase = import.meta.env.VITE_CHAT_API_URL || import.meta.env.VITE_API_URL || 'https://wh0rh0v5y9.execute-api.us-east-1.amazonaws.com/prod';
  const API_BASE = rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

  useEffect(() => {
    if (!isOpen || !user?.sub) return;
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const res = await fetch(`${API_BASE}/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data.map((m: any) => ({ ...m, id: m.timestamp.toString(), timestamp: new Date(m.timestamp) })));
            return;
          }
        }
      } catch (e) {
        console.error('Cloud sync fetch failed', e);
      } finally {
        setIsHistoryLoading(false);
      }
      setMessages([{
        id: 'initial_welcome',
        role: 'assistant',
        content: `Namaste, ${user.name || 'Faculty'}! I'm Pragati, your AI career companion. How can I help you today?`,
        timestamp: new Date(),
      }]);
    };
    fetchHistory();
  }, [isOpen, user?.sub]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const appendUserAndSend = async (text: string) => {
    if (!text.trim() || isSending) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);
    try {
      const result = await postMessage(API_BASE, {
        userId: user!.sub,
        role: 'user',
        content: text,
        timestamp: userMsg.timestamp.getTime(),
      });
      if (result) {
        setMessages(prev => [...prev, {
          id: result.timestamp.toString(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(result.timestamp),
        }]);
      }
    } catch (e) {
      console.error('AI chat failed', e);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = () => {
    appendUserAndSend(input);
    setInput('');
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'reset-' + Date.now(),
      role: 'assistant',
      content: `Chat cleared. What can I help you with, ${user?.name?.split(' ')[0] || 'Doctor'}?`,
      timestamp: new Date(),
    }]);
  };

  if (!isOpen) return null;

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'DR';

  return (
    <div className="fixed bottom-24 right-6 w-[400px] h-[640px] flex flex-col z-[10001] animate-in slide-in-from-bottom-6 fade-in duration-300 rounded-3xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)] border border-border/60">

      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-2xl" />

      {/* Ambient orbs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={pragatiAvatar} alt="Pragati" className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/30" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface" />
          </div>
          <div>
            <p className="text-sm font-bold text-text leading-none">Pragati AI</p>
            <p className="text-[10px] text-textMuted mt-0.5 font-medium">Powered by Amazon Nova</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            title="Clear chat"
            className="p-2 rounded-xl text-textMuted hover:text-text hover:bg-white/10 transition-all"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-textMuted hover:text-text hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="relative z-10 flex gap-2 px-4 py-3 border-b border-border/40 flex-shrink-0 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            onClick={() => appendUserAndSend(`Can you help me ${action.label.toLowerCase()}?`)}
            disabled={isSending || isHistoryLoading}
            className="flex-shrink-0 flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {isHistoryLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-textMuted">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-semibold uppercase tracking-widest">Syncing history...</p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden ring-1 ring-border/60">
                  {msg.role === 'assistant' ? (
                    <img src={pragatiAvatar} alt="Pragati" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-[9px] font-black text-primary-foreground">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm shadow-lg shadow-primary/20'
                    : 'bg-white/10 text-text border border-border/40 rounded-bl-sm backdrop-blur-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className={`flex items-center mt-1.5 gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-between'}`}>
                    <p className={`text-[9px] font-medium ${msg.role === 'user' ? 'text-primary-foreground/50' : 'text-textMuted'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speak(msg)}
                        title={speakingId === msg.id ? 'Stop speaking' : 'Read aloud'}
                        className={`p-0.5 rounded-md transition-all ${
                          speakingId === msg.id
                            ? 'text-primary animate-pulse'
                            : 'text-textMuted/50 hover:text-textMuted'
                        }`}
                      >
                        {speakingId === msg.id ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden ring-1 ring-border/60">
                  <img src={pragatiAvatar} alt="Pragati" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white/10 dark:bg-white/5 border border-border/40 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="relative z-10 px-4 py-4 border-t border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-border/60 rounded-2xl px-4 py-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <input
            type="text"
            placeholder={isHistoryLoading ? 'Syncing...' : 'Ask Pragati anything...'}
            disabled={isHistoryLoading || isSending}
            className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-textMuted disabled:opacity-50"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <button
            className="text-textMuted hover:text-text transition-colors p-1"
            title="Voice input (coming soon)"
          >
            <Mic size={16} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || isHistoryLoading}
            className="w-8 h-8 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl flex items-center justify-center transition-all shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-center text-[9px] text-textMuted/60 mt-2 font-medium tracking-widest uppercase">
          Prajna Intelligence · Amazon Nova
        </p>
      </div>
    </div>
  );
}

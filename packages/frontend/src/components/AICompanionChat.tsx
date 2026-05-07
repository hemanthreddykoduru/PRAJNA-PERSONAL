import { useState, useEffect, useRef } from 'react';
import { Send, X, Sparkles, Brain, Zap, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AICompanionChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'https://wh0rh0v5y9.execute-api.us-east-1.amazonaws.com/prod';

  // 1. Fetch History from AWS (REAL)
  useEffect(() => {
    const fetchAWSChatHistory = async () => {
      if (!user?.sub) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/history/${user.sub}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data.map((m: any) => ({ 
              ...m, 
              id: m.timestamp.toString(),
              timestamp: new Date(m.timestamp) 
            })));
          } else {
            setMessages([{
              id: '1',
              role: 'assistant',
              content: `Namaste Dr. ${user.name || 'Faculty'}! I'm your cloud-synced PRAJNA companion. Your history is now securely stored in AWS.`,
              timestamp: new Date()
            }]);
          }
        }
      } catch (e) {
        console.error("Cloud sync fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAWSChatHistory();
  }, [user?.sub, user?.name]);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. Sync message to AWS (REAL)
  const syncMessageToAWS = async (msg: Message) => {
    if (!user?.sub) return;
    try {
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.sub,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.getTime()
        })
      });
    } catch (e) {
      console.error("Cloud message sync failed", e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    try {
      const response = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.sub,
          role: userMsg.role,
          content: userMsg.content,
          timestamp: userMsg.timestamp.getTime()
        })
      });

      if (response.ok) {
        const aiData = await response.json();
        if (aiData.role === 'assistant') {
          const aiMsg: Message = {
            id: aiData.timestamp.toString(),
            role: 'assistant',
            content: aiData.content,
            timestamp: new Date(aiData.timestamp)
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    } catch (e) {
      console.error("AI chat failed", e);
    }
  };

  const handleAction = async (label: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: `Can you help me ${label.toLowerCase()}?`, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const response = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.sub,
          role: userMsg.role,
          content: userMsg.content,
          timestamp: userMsg.timestamp.getTime()
        })
      });

      if (response.ok) {
        const aiData = await response.json();
        if (aiData.role === 'assistant') {
          const aiMsg: Message = {
            id: aiData.timestamp.toString(),
            role: 'assistant',
            content: aiData.content,
            timestamp: new Date(aiData.timestamp)
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    } catch (e) {
      console.error("AI action failed", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col z-[10001] animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-6 text-white relative overflow-hidden">
        <Sparkles className="absolute top-[-10px] right-[-10px] opacity-20 rotate-12" size={80} />
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Brain size={24} className="text-secondary" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight leading-none">PRAJNA AI</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Your Career Companion</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="p-4 bg-secondary/30 flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-100">
        {[
          { label: 'Analyze Score', icon: <Zap size={12} /> },
          { label: 'Draft Report', icon: <Target size={12} /> },
          { label: 'Research Ideas', icon: <Sparkles size={12} /> },
        ].map(action => (
          <button 
            key={action.label} 
            onClick={() => handleAction(action.label)}
            className="flex-shrink-0 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-primary border border-primary/10 hover:border-primary transition-all shadow-sm"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Syncing with AWS Cloud...</p>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10' 
                    : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.content}
                  <p className={`text-[9px] mt-2 font-bold ${msg.role === 'user' ? 'text-white/50' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={isLoading ? "Syncing..." : "Ask me anything..."}
            disabled={isLoading}
            className="w-full bg-white border border-gray-100 pl-4 pr-12 py-3 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
          AI-Powered by Amazon Nova · Prajna Intelligence v2
        </div>
      </div>
    </div>
  );
}

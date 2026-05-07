import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  TrendingUp,
  History,
  Loader2
} from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';

interface AttendanceSession {
  date: string;
  subject: string;
  room: string;
  duration: number;
  loggedAt: string;
}

const Attendance: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    subject: '',
    room: '',
    duration: '60',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

      const response = await fetch(`${baseUrl}/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

      const payload = {
        ...form,
        date: `${form.date}#${Date.now()}`
      };

      await fetch(`${baseUrl}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setForm({ ...form, subject: '', room: '' });
      fetchSessions();
    } catch (error) {
      console.error("Failed to log attendance:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHours = sessions.reduce((acc, s) => acc + (s.duration / 60), 0);
  const weeklyTarget = 18;
  const progress = Math.min((totalHours / weeklyTarget) * 100, 100);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Attendance</h1>
          <p className="text-gray-500 text-lg">Log your teaching sessions and track academic load</p>
        </div>
        <div className="bg-[#007366]/5 px-6 py-3 rounded-2xl border border-[#007366]/10 flex items-center gap-3">
          <Calendar className="text-[#007366]" size={20} />
          <span className="font-bold text-[#007366]">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Log Form */}
        <div className="lg:col-span-1 space-y-8">
          {/* Progress Card */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-gray-400 uppercase tracking-widest text-xs">Weekly Teaching Load</h2>
              <TrendingUp className="text-[#007366]" size={20} />
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">{totalHours.toFixed(1)} <span className="text-lg text-gray-400 font-bold">/ {weeklyTarget}h</span></div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-[#007366] h-full transition-all duration-1000 ease-out shadow-lg shadow-[#007366]/20"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 font-medium">You have completed <span className="text-[#007366] font-black">{progress.toFixed(0)}%</span> of your weekly target.</p>
          </div>

          {/* Log Form */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus className="text-[#007366]" size={24} />
              Log Session
            </h2>
            <form onSubmit={handleLogAttendance} className="space-y-4">
              <div className="relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007366] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Subject / Course Code"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-bold"
                  value={form.subject}
                  onChange={(e) => setForm({...form, subject: e.target.value})}
                />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007366] transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Room Number (e.g. B-402)"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-bold"
                  value={form.room}
                  onChange={(e) => setForm({...form, room: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1 group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007366] transition-colors" size={20} />
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-bold appearance-none cursor-pointer"
                    value={form.duration}
                    onChange={(e) => setForm({...form, duration: e.target.value})}
                  >
                    <option value="60">1 Hour</option>
                    <option value="90">1.5 Hours</option>
                    <option value="120">2 Hours</option>
                    <option value="180">3 Hours</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-[#007366] text-white font-black rounded-2xl hover:bg-[#00594C] transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#007366]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                {isSubmitting ? 'LOGGING...' : 'LOG SESSION'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden h-full">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="text-[#007366]" size={24} />
                Recent Sessions
              </h2>
            </div>
            
            <div className="p-0">
              {isLoading ? (
                <div className="p-20 text-center">
                  <Loader2 className="w-10 h-10 text-[#007366] animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Fetching logs...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-20 text-center">
                  <BookOpen className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">No sessions logged yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sessions.map((session, i) => (
                    <div key={i} className="p-6 hover:bg-[#F0E0C1]/10 transition-colors flex justify-between items-center group">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#007366]/10 flex items-center justify-center text-[#007366] font-black group-hover:scale-110 transition-transform">
                          {session.subject[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{session.subject}</div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {session.room}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {session.date.split('#')[0]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-2 rounded-xl font-black text-[#007366] text-sm">
                        {session.duration}m
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

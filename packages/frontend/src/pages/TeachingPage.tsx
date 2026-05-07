import React, { useState } from 'react';
import { Clock, MapPin, Users, CheckCircle, ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIMETABLE = [
  { id: 1, code: 'CSE-301', name: 'Database Management Systems', time: '09:00 AM - 10:30 AM', room: 'L-204', students: 42, day: 'Monday' },
  { id: 2, code: 'AI-204', name: 'Neural Networks', time: '11:00 AM - 12:30 PM', room: 'Lab 4', students: 38, day: 'Monday' },
  { id: 3, code: 'DS-101', name: 'Data Structures', time: '02:00 PM - 03:30 PM', room: 'L-101', students: 55, day: 'Monday' },
];

export default function TeachingPage() {
  const navigate = useNavigate();
  const [isMarkingAttendance, setIsMarkingAttendance] = useState<number | null>(null);

  if (isMarkingAttendance) {
    const session = TIMETABLE.find(s => s.id === isMarkingAttendance);
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setIsMarkingAttendance(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Schedule
        </button>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{session?.name}</h2>
              <p className="text-gray-500 mt-1 font-medium">{session?.code} · Section A</p>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <Users size={18} />
              {session?.students} Students
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <Clock />, label: 'Time Remaining', val: '45 mins' },
              { icon: <MapPin />, label: 'Location', val: session?.room },
              { icon: <CheckCircle />, label: 'Present', val: '38/42' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-primary mb-2 opacity-70">{stat.icon}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">{stat.label}</div>
                <div className="text-lg font-bold text-gray-800">{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Student List Mock */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 mb-4">Student List</h3>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                    S{i}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">Student Name {i}</p>
                    <p className="text-xs text-gray-400">Roll No: 202400{i}</p>
                  </div>
                </div>
                <button className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                  <CheckCircle size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>

          <button className="w-full mt-12 bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
            Submit Attendance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Teaching Delivery</h1>
          <p className="text-gray-500 mt-1">Manage your classes and mark student attendance.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <Calendar className="text-primary" size={20} />
          <span className="font-bold text-gray-800">Monday, May 6</span>
        </div>
      </div>

      {/* Active Class Hero */}
      <div className="bg-white rounded-3xl p-8 border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
            Ongoing Now
          </div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Active Session</h2>
          <h3 className="text-3xl font-black text-gray-900 mb-6">{TIMETABLE[0].name}</h3>
          
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Clock size={18} className="text-primary" />
              {TIMETABLE[0].time}
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <MapPin size={18} className="text-primary" />
              {TIMETABLE[0].room}
            </div>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Users size={18} className="text-primary" />
              {TIMETABLE[0].students} Students
            </div>
          </div>

          <button 
            onClick={() => setIsMarkingAttendance(TIMETABLE[0].id)}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 ml-1">Today's Schedule</h3>
        <div className="grid grid-cols-1 gap-4">
          {TIMETABLE.map(session => (
            <div key={session.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-primary group-hover:bg-primary/5 transition-colors">
                  <span className="text-[10px] font-black uppercase">{session.code.split('-')[0]}</span>
                  <span className="text-lg font-black leading-none">{session.code.split('-')[1]}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{session.name}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Clock size={12} /> {session.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {session.room}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMarkingAttendance(session.id)}
                className="bg-gray-100 text-gray-500 px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all"
              >
                Mark
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

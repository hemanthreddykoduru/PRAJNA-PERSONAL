import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Award, CheckSquare, MessageSquare, LogOut,
  Users, BarChart3, Shield, Settings, ClipboardList,
  TrendingUp, Building2, GraduationCap, Bell, FileText
} from 'lucide-react';
import { AICompanionChat } from '../components/AICompanionChat';
import { useAuth, ROLE_HOME } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';

const ROLE_LABELS: Record<UserRole, string> = {
  Faculty: 'Faculty',
  HoD: 'Head of Department',
  Director: 'Director',
  ProVC: 'Pro Vice-Chancellor',
  IQAC: 'IQAC Officer',
  Admin: 'System Admin',
};

const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  Faculty: 'bg-emerald-100 text-emerald-700',
  HoD: 'bg-blue-100 text-blue-700',
  Director: 'bg-violet-100 text-violet-700',
  ProVC: 'bg-amber-100 text-amber-700',
  IQAC: 'bg-rose-100 text-rose-700',
  Admin: 'bg-gray-100 text-gray-700',
};

interface NavItem {
  to: string;
  icon: any; // Changed from ReactNode to any to store Component reference
  label: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  // Faculty
  { to: '/dashboard/faculty', icon: Home, label: 'My Dashboard', roles: ['Faculty'] },
  { to: '/dashboard/faculty/teaching', icon: BookOpen, label: 'Teaching', roles: ['Faculty'] },
  { to: '/dashboard/faculty/research', icon: Award, label: 'Research', roles: ['Faculty'] },
  { to: '/dashboard/faculty/achievements', icon: TrendingUp, label: 'Achievements', roles: ['Faculty'] },
  { to: '/dashboard/faculty/development', icon: GraduationCap, label: 'Development', roles: ['Faculty'] },
  { to: '/dashboard/attendance', icon: ClipboardList, label: 'Attendance', roles: ['Faculty', 'HoD', 'Director', 'Admin'] },

  // HoD
  { to: '/dashboard/hod', icon: Home, label: 'Department Home', roles: ['HoD'] },
  { to: '/dashboard/hod/approvals', icon: CheckSquare, label: 'Approval Queue', roles: ['HoD'] },
  { to: '/dashboard/hod/faculty', icon: Users, label: 'Faculty Overview', roles: ['HoD'] },
  { to: '/dashboard/hod/reports', icon: FileText, label: 'Reports', roles: ['HoD'] },

  // Director
  { to: '/dashboard/director', icon: Home, label: 'School Command', roles: ['Director'] },
  { to: '/dashboard/director/departments', icon: Building2, label: 'Departments', roles: ['Director'] },
  { to: '/dashboard/director/approvals', icon: CheckSquare, label: 'Escalated Approvals', roles: ['Director'] },
  { to: '/dashboard/director/reports', icon: FileText, label: 'NAAC / NIRF', roles: ['Director'] },

  // ProVC
  { to: '/dashboard/provc', icon: Home, label: 'Campus Command', roles: ['ProVC'] },
  { to: '/dashboard/provc/schools', icon: Building2, label: 'All Schools', roles: ['ProVC'] },
  { to: '/dashboard/provc/analytics', icon: BarChart3, label: 'Analytics', roles: ['ProVC'] },
  { to: '/dashboard/provc/reports', icon: FileText, label: 'Executive Reports', roles: ['ProVC'] },

  // IQAC
  { to: '/dashboard/iqac', icon: Home, label: 'Inspection HQ', roles: ['IQAC'] },
  { to: '/dashboard/iqac/readiness', icon: ClipboardList, label: 'Readiness Score', roles: ['IQAC'] },
  { to: '/dashboard/iqac/criteria', icon: Shield, label: 'NAAC Criteria', roles: ['IQAC'] },
  { to: '/dashboard/iqac/reports', icon: FileText, label: 'Compliance Reports', roles: ['IQAC'] },

  // Admin
  { to: '/dashboard/admin', icon: Home, label: 'System Overview', roles: ['Admin'] },
  { to: '/dashboard/admin/users', icon: Users, label: 'User Management', roles: ['Admin'] },
  { to: '/dashboard/admin/campuses', icon: Building2, label: 'All Campuses', roles: ['Admin'] },
  { to: '/dashboard/admin/settings', icon: Settings, label: 'Settings', roles: ['Admin'] },
];

export function DashboardLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOutUser } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  const visibleNav = NAV_ITEMS.filter(item =>
    user ? item.roles.includes(user.role) : false
  );

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DR';

  const Sidebar = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-xl shadow-black/20">
             <img src="/assets/gitam-logo.png" alt="GITAM" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-white leading-none">PRAJNA</h1>
            <p className="text-white/50 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">GITAM University</p>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-6 py-6 border-b border-white/10 bg-black/10 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-bold text-sm border border-white/20 shadow-lg text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate leading-none mb-1.5">{user?.name || user?.email}</p>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${ROLE_BADGE_COLORS[user?.role || 'Faculty']}`}>
              {ROLE_LABELS[user?.role || 'Faculty']}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation (Scrollable) */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {visibleNav.map((item) => {
          const isActive = location.pathname === item.to ||
            (location.pathname.startsWith(item.to) && item.to !== ROLE_HOME[user?.role || 'Faculty']);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-white text-primary shadow-lg shadow-black/10 font-bold translate-x-1'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-sm tracking-wide">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Section (ALWAYS AT BOTTOM) */}
      <div className="mt-auto p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col flex-shrink-0 h-full border-r border-black/10 shadow-2xl">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 bg-primary text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-gray-600 hover:text-primary transition-all p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <img src="/assets/toggler.svg" alt="Menu" className="w-7 h-7" />
            </button>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span className="font-bold text-gray-800">{ROLE_LABELS[user?.role || 'Faculty']}</span>
              <span>·</span>
              <span className="capitalize">{user?.campus} Campus</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-auto pr-4 border-r border-gray-200 hidden sm:block">
              <img src="/assets/gitam-logo-green.png" alt="GITAM" className="h-full object-contain" />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {(user?.role === 'Faculty' || user?.role === 'Admin') && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-accent text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 flex items-center space-x-2"
              >
                <MessageSquare size={14} />
                <span>AI Companion</span>
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>

      {/* AI Chat Overlay */}
      <AICompanionChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

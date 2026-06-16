import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Award, CheckSquare, MessageSquare, LogOut,
  Users, BarChart3, Shield, Settings, ClipboardList,
  TrendingUp, Building2, GraduationCap, Bell, FileText,
  LayoutDashboard, Target, Trophy, LineChart, Crosshair, Calendar, Bot, HelpCircle
} from 'lucide-react';
import { AICompanionChat } from '../components/AICompanionChat';
import { useAuth, ROLE_HOME } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

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

  // Faculty
  { to: '/dashboard/faculty', icon: LayoutDashboard, label: 'Dashboard', roles: ['Faculty'] },
  { to: '/dashboard/faculty/kpi', icon: Target, label: 'My KPI', roles: ['Faculty'] },
  { to: '/dashboard/faculty/leaderboard', icon: Trophy, label: 'Leaderboard', roles: ['Faculty'] },
  { to: '/dashboard/faculty/analytics', icon: LineChart, label: 'Analytics', roles: ['Faculty'] },
  { to: '/dashboard/faculty/goals', icon: Crosshair, label: 'Goals & Plans', roles: ['Faculty'] },
  { to: '/dashboard/faculty/activities', icon: Calendar, label: 'Activities', roles: ['Faculty'] },
  { to: '/dashboard/faculty/reports', icon: FileText, label: 'Reports', roles: ['Faculty'] },
  { to: '/dashboard/faculty/notifications', icon: Bell, label: 'Notifications', roles: ['Faculty'] },
  { to: '/dashboard/faculty/resources', icon: BookOpen, label: 'Resources', roles: ['Faculty'] },
  { to: '/dashboard/faculty/ai-assistant', icon: Bot, label: 'AI Assistant', roles: ['Faculty'] },

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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
             <GraduationCap className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-text leading-none">PRAJNA</h1>
            <p className="text-textMuted text-xs font-medium mt-1">Academic Excellence</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 border-b border-border bg-surface flex-shrink-0 hidden">
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
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white font-medium shadow-md shadow-primary/20'
                  : 'text-textMuted hover:bg-black/5 hover:text-text'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-sm tracking-wide">{item.label}</span>
              {/* {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />} */}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Section */}
      <div className="mt-auto p-4 space-y-2">
        <button
          className="w-full flex items-center space-x-3 px-4 py-3 text-textMuted hover:text-text hover:bg-black/5 rounded-lg transition-all duration-200 group"
        >
          <Settings size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Settings</span>
        </button>

        <button
          className="w-full flex items-center space-x-3 px-4 py-3 text-textMuted hover:text-text hover:bg-black/5 rounded-lg transition-all duration-200 group"
        >
          <HelpCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Help Desk</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Logout</span>
        </button>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );

  return (
    <div className="h-screen bg-background text-text flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-surface hidden md:flex flex-col flex-shrink-0 h-full border-r border-border">
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
        <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden text-textMuted hover:text-primary transition-all p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <img src="/assets/toggler.svg" alt="Menu" className="w-7 h-7" />
            </button>
            <div className="hidden md:flex items-center bg-surface border border-border rounded-lg px-3 py-1.5 w-80">
              <span className="text-textMuted mr-2">🔍</span>
              <input 
                type="text" 
                placeholder="Search PRAJNA..." 
                className="bg-transparent border-none outline-none text-sm text-text w-full placeholder:text-textMuted"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative text-textMuted hover:text-text transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="flex items-center space-x-3 border-l border-border pl-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                {initials}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-text leading-tight">{user?.name || user?.email}</p>
                <p className="text-xs text-textMuted">EECE Department</p>
              </div>
            </div>
          </div>
        </header>

      {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <Outlet />

          {/* AI Assistant Floating Action Button */}
          {(user?.role === 'Faculty' || user?.role === 'Admin') && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-surface border-2 border-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-40 group"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-background">
                {/* Fallback avatar if pragati image not available */}
                <span className="text-xl">👩‍💼</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-surface rounded-full"></span>
              
              {/* Tooltip */}
              <span className="absolute right-full mr-4 bg-surface text-text text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                Ask Pragati ✨
              </span>
            </button>
          )}
        </div>
      </main>

      {/* AI Chat Overlay */}
      <AICompanionChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

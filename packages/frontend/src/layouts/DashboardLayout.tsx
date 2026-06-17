import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { getUrl } from 'aws-amplify/storage';
import {
  Home, BookOpen, Award, CheckSquare, MessageSquare, LogOut,
  Users, BarChart3, Shield, Settings, ClipboardList,
  TrendingUp, Building2, GraduationCap, Bell, FileText,
  LayoutDashboard, Target, Trophy, LineChart, Crosshair, Calendar, Bot, HelpCircle, Sun, Moon, Sparkles, MessageSquarePlus
} from 'lucide-react';
import { AICompanionChat } from '../components/AICompanionChat';
import { useAuth, ROLE_HOME } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import gitamLogo from '../assets/gitam-Logo-new.png';

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
  { to: '/dashboard/faculty', icon: LayoutDashboard, label: 'Dashboard', roles: ['Faculty'] },

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

  const [headerAvatar, setHeaderAvatar] = useState<string | null>(null);
  
  // Theme Toggle State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = (e: React.MouseEvent) => {
    const isDark = !isDarkMode;

    // Fallback for browsers that don't support View Transitions API
    if (!document.startViewTransition) {
      setIsDarkMode(isDark);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setIsDarkMode(isDark);
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];
      
      // Always expand the new view over the old view
      document.documentElement.animate(
        { clipPath },
        {
          duration: 700,
          easing: 'cubic-bezier(0.64, 0, 0.05, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user?.picture) {
        try {
          const res = await getUrl({ path: user.picture });
          setHeaderAvatar(res.url.toString());
        } catch (err) {
          console.error('Failed to load avatar:', err);
        }
      }
    };
    fetchAvatar();
    
    window.addEventListener('avatarUpdated', fetchAvatar);
    return () => window.removeEventListener('avatarUpdated', fetchAvatar);
  }, [user]);

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
      <div className="px-6 py-8 border-b border-border/50 flex-shrink-0 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-white/20 p-1">
             <img src={gitamLogo} alt="GITAM" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-text leading-none">PRAJNA</h1>
            <p className="text-textMuted text-xs font-medium mt-1">Academic Excellence</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 border-b border-border bg-surface flex-shrink-0 hidden">
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center font-bold text-sm border border-white/20 shadow-lg text-white overflow-hidden">
            {headerAvatar ? (
              <img src={headerAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
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
        <Link
          to="/dashboard/settings"
          onClick={() => setIsMobileMenuOpen(false)}
          className="w-full flex items-center space-x-3 px-4 py-3 text-textMuted hover:text-text hover:bg-black/5 rounded-lg transition-all duration-200 group"
        >
          <Settings size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-wide">Settings</span>
        </Link>

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
    <div className="h-screen bg-background text-text flex overflow-hidden relative selection:bg-primary/30">
      {/* Background Ambient Orbs for Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_8s_ease-in-out_infinite] opacity-50 dark:opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse] opacity-50 dark:opacity-30 pointer-events-none" />
      
      {/* Desktop Sidebar (Glass) */}
      <aside className="w-64 bg-surface/40 backdrop-blur-2xl hidden md:flex flex-col flex-shrink-0 h-full border-r border-border/50 relative z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
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
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header (Glass) */}
        <header className="bg-background/40 backdrop-blur-2xl border-b border-border/50 h-16 flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
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
            <button 
              onClick={toggleTheme}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors group"
              title="Toggle Theme"
            >
              <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
                <Sun size={20} className="text-amber-500 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>
              <div className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${!isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}>
                <Moon size={20} className="text-indigo-500 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              </div>
            </button>
            <button className="relative text-textMuted hover:text-text transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <div className="flex items-center space-x-3 border-l border-border pl-6">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                {headerAvatar ? (
                  <img src={headerAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
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
        </div>
      </main>

      {/* Floating AI Companion Shortcut */}
      <div className="fixed bottom-8 right-8 z-40 group">
        <button
          onClick={() => setIsChatOpen(true)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-primary to-emerald-500 shadow-2xl flex items-center justify-center hover:scale-[1.15] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:shadow-[0_10px_40px_rgba(2,132,199,0.5)] overflow-hidden"
        >
          {/* Animated Glow Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10 flex items-center justify-center text-white">
            <Bot size={28} className="group-hover:rotate-12 transition-transform duration-500" />
            <Sparkles size={14} className="absolute -top-1 -right-1 text-amber-300 animate-pulse drop-shadow-md" />
          </div>
        </button>

        {/* Hover Tooltip/Label */}
        <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 pointer-events-none opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="bg-surface border border-border shadow-xl px-4 py-2 rounded-2xl whitespace-nowrap flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Ask Pragati AI
            </span>
          </div>
        </div>
      </div>

      {/* AI Chat Overlay */}
      <AICompanionChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

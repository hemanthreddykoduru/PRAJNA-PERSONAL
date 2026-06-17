import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Target, Trophy, CalendarCheck } from 'lucide-react';
import { signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import type { UserRole } from '../contexts/AuthContext';
import { ROLE_HOME, useAuth } from '../contexts/AuthContext';
import gitamLogo from '../assets/gitam-Logo-new.png';
import prajnaLogo from '../assets/PRAJNA-LOGO-CROP.jpeg';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isWelcoming, setIsWelcoming] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [welcomeName, setWelcomeName] = useState('Faculty');
  const [dashboardPath, setDashboardPath] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

  useEffect(() => {
    if (isWelcoming && progress < 100) {
      const interval = setInterval(() => {
        setProgress(p => {
          const next = p + (Math.random() * 15 + 5);
          return next >= 100 ? 100 : next;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isWelcoming, progress]);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const emergencyCleanup = () => {
    // Force wipe all Amplify/Cognito keys from local storage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('CognitoIdentityServiceProvider') || key.includes('amplify')) {
        localStorage.removeItem(key);
      }
    });
  };

  const checkExistingSession = async () => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.idToken) {
        const groups: string[] = (session.tokens.idToken.payload as any)?.['cognito:groups'] || [];
        navigate(getRoleHome(groups), { replace: true });
        return;
      }
    } catch (e) {
      // No valid session, stay on login
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const getRoleHome = (groups: string[]): string => {
    if (groups.includes('Admin')) return ROLE_HOME['Admin'];
    if (groups.includes('ProVC')) return ROLE_HOME['ProVC'];
    if (groups.includes('Director')) return ROLE_HOME['Director'];
    if (groups.includes('IQAC')) return ROLE_HOME['IQAC'];
    if (groups.includes('HoD')) return ROLE_HOME['HoD'];
    return ROLE_HOME['Faculty'];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: userId, password });
      
      console.log("Sign-in next step:", nextStep);

      if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Redirect to a dedicated page or show a state to set the new password
        navigate('/complete-new-password', { 
          state: { 
            userId,
            tempPassword: password 
          } 
        });
        return;
      }

      if (isSignedIn) {
        const session = await fetchAuthSession();
        const groups: string[] = (session.tokens?.idToken?.payload as any)?.['cognito:groups'] || [];
        const destination = getRoleHome(groups);
        const name = (session.tokens?.idToken?.payload as any)?.['name'] || 'Hemanth';
        
        // CRITICAL: Force AuthContext to reload user data BEFORE navigating
        await reloadUser();
        
        // Trigger the Welcome Screen
        setWelcomeName(name.split(' ')[0]); // Use first name
        setDashboardPath(destination);
        setIsWelcoming(true);
      }
    } catch (err: any) {
      console.error("Login attempt error:", err);
      setIsLoading(false); // Immediate unlock of UI
      if (err.name === 'UserAlreadyAuthenticatedException' || err.message?.includes('already a signed in user')) {
        checkExistingSession();
      } else {
        setError(err.message || 'Invalid username or password.');
      }
    } finally {
      // We don't set loading false here if redirecting to prevent flickering
    }
  };

  const continueToDashboard = () => {
    setIsLeaving(true);
    
    // Wait for the exit animation to finish before navigating
    setTimeout(() => {
      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          flushSync(() => {
            navigate(dashboardPath, { replace: true });
          });
        });
        
        transition.ready.then(() => {
          document.documentElement.animate(
            [
              { opacity: 0, filter: 'blur(10px)' },
              { opacity: 1, filter: 'blur(0px)' }
            ],
            {
              duration: 800,
              easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );
        });
      } else {
        navigate(dashboardPath, { replace: true });
      }
    }, 400); // 400ms matches the exit transition duration
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  if (isWelcoming) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary/30">
        {/* Ambient Glassmorphism Orbs - Stronger for better mesh gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[10%] w-[50rem] h-[50rem] bg-primary/30 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
           <div className="absolute bottom-[-10%] right-[10%] w-[50rem] h-[50rem] bg-emerald-400/30 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite_reverse]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-white/40 dark:bg-black/40 rounded-full blur-[150px]" />
        </div>
        
        <div className={`z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10 w-full px-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isLeaving ? 'opacity-0 scale-110 -translate-y-16 blur-xl pointer-events-none' : 'opacity-100 scale-100 translate-y-0 blur-0'}`}>
           <div className="w-28 h-28 bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] mb-10 p-3">
             <img src={gitamLogo} alt="GITAM" className="w-full h-full object-contain" />
           </div>
           
           <h1 className="text-5xl md:text-6xl font-bold text-text mb-6 tracking-tight">
             Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-400">{welcomeName}</span>
           </h1>
           
           {progress < 100 ? (
             <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
               <p className="text-xl md:text-2xl text-textMuted mb-12 font-medium">Preparing your intelligent workspace...</p>
               
               {/* Beautiful progress bar */}
               <div className="w-72 h-1.5 bg-surface/80 backdrop-blur-md rounded-full overflow-hidden relative shadow-inner">
                 <div 
                   className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                   style={{ width: `${progress}%` }} 
                 />
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center w-full max-w-3xl mt-4">
               
               {/* Interactive AI Warm Welcome Bubble */}
               <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-3xl p-6 mb-10 w-full max-w-2xl flex items-start sm:items-center gap-5 text-left shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationFillMode: 'both' }}>
                 <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                   <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150" alt="Pragati AI" className="w-13 h-13 rounded-full object-cover border-2 border-white/20 p-0.5" />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Pragati AI Companion</h3>
                   <p className="text-lg text-text font-medium leading-relaxed">
                     "Good {getGreeting()}, Professor {welcomeName}! Your workspace is ready. You're currently ranked <strong className="text-emerald-500">#4</strong> in the department. Let's clear those 2 urgent tasks and make it a highly productive day!"
                   </p>
                 </div>
               </div>

               {/* Daily Summary Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
                 <div className="bg-white/70 dark:bg-surface/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                     <Target size={24} />
                   </div>
                   <div className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">PRAJNA Score</div>
                   <div className="text-3xl font-black text-text">0<span className="text-lg text-textMuted font-medium">/1k</span></div>
                 </div>
                 
                 <div className="bg-white/70 dark:bg-surface/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                     <Trophy size={24} />
                   </div>
                   <div className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">Dept. Rank</div>
                   <div className="text-3xl font-black text-emerald-500">#4</div>
                 </div>
                 
                 <div className="bg-white/70 dark:bg-surface/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-300 flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
                   <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                     <CalendarCheck size={24} />
                   </div>
                   <div className="text-textMuted text-[10px] font-bold uppercase tracking-widest mb-1">Today's Tasks</div>
                   <div className="text-3xl font-black text-text">2 <span className="text-lg text-textMuted font-medium">Urgent</span></div>
                 </div>
               </div>

               {/* Let's Do It Button */}
               <button 
                 onClick={continueToDashboard}
                 className="group relative px-12 py-5 bg-gradient-to-r from-primary to-emerald-500 rounded-full font-bold text-white text-xl shadow-[0_10px_40px_-10px_rgba(2,132,199,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(2,132,199,1)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center gap-3 animate-in fade-in zoom-in duration-700"
                 style={{ animationDelay: '600ms', animationFillMode: 'both' }}
               >
                 <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full skew-x-12 transition-transform duration-700 ease-in-out" />
                 <span>Let's do it</span>
                 <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
               </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold tracking-widest uppercase text-xs opacity-70">Securing PRAJNA Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side: Branded Identity */}
      <div className="hidden lg:flex w-7/12 bg-surface flex-col justify-between p-12 relative overflow-hidden border-r border-border">
        {/* Abstract AI Orbs (Decorative) */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-12 transition-transform hover:scale-105 duration-300">
            <img src={prajnaLogo} alt="PRAJNA - GITAM University" className="w-72 md:w-80 h-auto object-contain bg-background rounded-[2rem] shadow-2xl p-4 border border-border" />
          </div>
          
          <h1 className="text-6xl font-bold text-text leading-tight mb-6">
            Deep Intelligence <br /> 
            <span className="text-primary italic">for GITAM Faculty.</span>
          </h1>
          <p className="text-textMuted text-xl max-w-lg leading-relaxed">
            Your AI-powered professional companion for career growth, 
            research innovation, and academic excellence.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-primary font-bold text-3xl mb-1">30+</div>
            <div className="text-textMuted text-sm font-medium">Core Modules</div>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-primary font-bold text-3xl mb-1">AI-Ready</div>
            <div className="text-textMuted text-sm font-medium">Assistant Built-in</div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
             <img src={gitamLogo} alt="GITAM" className="h-16 object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-text mb-2">Welcome Back</h2>
          <p className="text-textMuted">Please enter your credentials to access your dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-textMuted uppercase tracking-wider">User ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
              <input
                type="text"
                placeholder="Enter your ID"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-surface focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-text placeholder:text-textMuted/50"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-textMuted uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" size="sm" className="text-primary text-sm font-bold hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-surface focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-text placeholder:text-textMuted/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-surface" />
            <label htmlFor="remember" className="text-sm text-textMuted font-medium">Stay logged in for 30 days</label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-textMuted text-sm">
            Need help? Contact <a href="#" className="text-primary font-bold hover:underline">CATS Service Desk</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Target, Trophy, CalendarCheck } from 'lucide-react';
import { signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import type { UserRole } from '../contexts/AuthContext';
import { ROLE_HOME, useAuth } from '../contexts/AuthContext';
import gitamLogo from '../assets/gitam-Logo-new.png';
import prajnaLogo from '../assets/PRAJNA-LOGO-CROP.jpeg';
import pragatiAvatar from '../assets/pragati-avatar.png';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const { reloadUser } = useAuth();

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
        
        // Navigate directly to the dashboard, bypassing the welcome screen
        navigate(destination, { replace: true });
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
      <div className="hidden lg:flex w-7/12 bg-secondary flex-col justify-between p-12 relative overflow-hidden border-r border-border">
        {/* Abstract AI Orbs (Decorative) */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-6">
             {/* Using standard logo instead of illegal custom lockup */}
             <img src={gitamLogo} alt="GITAM University" className="h-16 object-contain" />
             <div className="h-12 w-px bg-primary/20"></div>
             <div>
               <div className="text-2xl font-bold tracking-widest text-primary">PRAJNA AI</div>
               <div className="text-xs font-bold tracking-widest text-primary/70 uppercase">Your Career Companion</div>
             </div>
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
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-primary/10 shadow-sm">
            <div className="text-primary font-bold text-4xl mb-1">30+</div>
            <div className="text-textMuted text-sm font-bold uppercase tracking-wider">Core Modules</div>
          </div>
          <div className="bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-primary/10 shadow-sm">
            <div className="text-primary font-bold text-4xl mb-1">AI-Ready</div>
            <div className="text-textMuted text-sm font-bold uppercase tracking-wider">Assistant Built-in</div>
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

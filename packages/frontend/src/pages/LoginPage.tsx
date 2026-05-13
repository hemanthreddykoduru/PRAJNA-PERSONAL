import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { signIn, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import type { UserRole } from '../contexts/AuthContext';
import { ROLE_HOME } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

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
        window.location.href = getRoleHome(groups);
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
        window.location.href = getRoleHome(groups);
      }
    } catch (err: any) {
      console.error("Login attempt error:", err);
      if (err.name === 'UserAlreadyAuthenticatedException' || err.message?.includes('already a signed in user')) {
        checkExistingSession();
      } else {
        setError(err.message || 'Invalid username or password.');
      }
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen flex bg-[#FFFFFF]">
      {/* Left Side: Branded Identity */}
      <div className="hidden lg:flex w-7/12 bg-[#007366] flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract AI Orbs (Decorative) */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-40 h-auto bg-white rounded-[2rem] flex items-center justify-center shadow-2xl p-6 transition-transform hover:scale-105 duration-300">
              <img src="/assets/gitam-Logo-new.png" alt="GITAM" className="w-full h-auto object-contain" />
            </div>
            <div>
              <span className="text-white text-4xl font-black tracking-tight uppercase italic block leading-none">PRAJNA</span>
              <span className="text-white/60 text-[12px] font-bold uppercase tracking-[0.2em] mt-1">GITAM University</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            Deep Intelligence <br /> 
            <span className="text-secondary italic">for GITAM Faculty.</span>
          </h1>
          <p className="text-white/80 text-xl max-w-lg leading-relaxed">
            Your AI-powered professional companion for career growth, 
            research innovation, and academic excellence.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-secondary font-bold text-3xl mb-1">30+</div>
            <div className="text-white/60 text-sm font-medium">Core Modules</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-secondary font-bold text-3xl mb-1">AI-Ready</div>
            <div className="text-white/60 text-sm font-medium">Assistant Built-in</div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
             <img src="/assets/gitam-Logo-new.png" alt="GITAM" className="h-16 object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-text mb-2">Welcome Back</h2>
          <p className="text-gray-500">Please enter your credentials to access your dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">User ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter your ID"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" size="sm" className="text-primary text-sm font-bold hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            <label htmlFor="remember" className="text-sm text-gray-600 font-medium">Stay logged in for 30 days</label>
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
          <p className="text-gray-500 text-sm">
            Need help? Contact <a href="#" className="text-primary font-bold hover:underline">CATS Service Desk</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

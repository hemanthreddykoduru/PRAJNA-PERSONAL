import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmSignIn, fetchAuthSession } from 'aws-amplify/auth';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ROLE_HOME } from '../contexts/AuthContext';

const CompleteNewPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const handleCompletePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: newPassword
      });

      if (isSignedIn) {
        const session = await fetchAuthSession();
        const groups: string[] = (session.tokens?.idToken?.payload as any)?.['cognito:groups'] || [];
        const homePath = getRoleHome(groups);
        window.location.href = homePath;
      }
    } catch (err: any) {
      console.error("Password completion error:", err);
      setError(err.message || 'Failed to set new password.');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen flex bg-white">
      {/* Brand Side */}
      <div className="hidden lg:flex w-5/12 bg-[#007366] flex-col justify-center p-16 text-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <ShieldCheck className="w-16 h-16 text-[#F0E0C1] mb-8" />
          <h1 className="text-5xl font-black mb-6 leading-tight">Secure Your <br />PRAJNA Account.</h1>
          <p className="text-xl text-white/70 leading-relaxed mb-8">
            Welcome to the faculty portal. For your protection, please set a permanent, high-strength password to complete your activation.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5">
              <div className="w-2 h-2 bg-[#F0E0C1] rounded-full" />
              <span className="text-sm font-medium">Minimum 8 characters</span>
            </div>
            <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/5">
              <div className="w-2 h-2 bg-[#F0E0C1] rounded-full" />
              <span className="text-sm font-medium">Must include numbers & symbols</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-8 sm:px-20 lg:px-32">
        <div className="max-w-md w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Setup</h2>
            <p className="text-gray-500 font-medium italic">Establishing permanent credentials for <span className="text-[#007366] font-bold">{userId}</span></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleCompletePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-[#F0E0C1] outline-none transition-all font-bold"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-[#F0E0C1] outline-none transition-all font-bold"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#007366] hover:bg-[#00594C] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[#007366]/20 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {isLoading ? 'Finalizing Setup...' : 'Activate My Account'}
              {!isLoading && <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encrypted GITAM Asset</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteNewPasswordPage;

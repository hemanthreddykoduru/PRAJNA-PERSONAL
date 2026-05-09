import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'CONFIRM' | 'SUCCESS'>('REQUEST');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await resetPassword({ username: email });
      setStep('CONFIRM');
    } catch (err: any) {
      setError(err.message || 'Error requesting password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword
      });
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Error confirming password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFFFFF]">
      {/* Left Side: Branded Identity */}
      <div className="hidden lg:flex w-7/12 bg-[#007366] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
              <img src="/assets/gitam-logo.png" alt="GITAM" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <span className="text-white text-3xl font-black tracking-tight uppercase italic block leading-none">PRAJNA</span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">GITAM University</span>
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-white leading-tight mb-6">
            Account <br /> 
            <span className="text-secondary italic">Recovery.</span>
          </h1>
          <p className="text-white/80 text-xl max-w-lg leading-relaxed">
            Securely reset your password and regain access to your faculty intelligence dashboard.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 items-center text-white/50 text-sm font-medium">
          <ShieldCheck className="w-5 h-5 text-secondary" />
          <span>Multi-Factor Authentication & Advanced Encryption Active</span>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="mb-12">
          <Link to="/login" className="flex items-center gap-2 text-primary font-bold hover:underline mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
          
          {step === 'REQUEST' && (
            <>
              <h2 className="text-4xl font-bold text-text mb-2">Reset Password</h2>
              <p className="text-gray-500">Enter your faculty email to receive a reset code.</p>
            </>
          )}
          {step === 'CONFIRM' && (
            <>
              <h2 className="text-4xl font-bold text-text mb-2">Check Your Email</h2>
              <p className="text-gray-500">Enter the verification code sent to {email}.</p>
            </>
          )}
          {step === 'SUCCESS' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-4xl font-bold text-text mb-2">Password Reset!</h2>
              <p className="text-gray-500">Your account is now secure. You can log in with your new password.</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 'REQUEST' && (
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Faculty Email / User ID</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="name@gitam.edu"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? 'Processing...' : 'Send Reset Code'}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        )}

        {step === 'CONFIRM' && (
          <form onSubmit={handleConfirmReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium tracking-widest text-center text-xl"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? 'Updating...' : 'Reset Password'}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        )}

        {step === 'SUCCESS' && (
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
          >
            Login Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

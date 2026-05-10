import React, { useState, useEffect } from 'react';
import { ShieldAlert, Send, Key, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onDeleted: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, userId, userEmail, onDeleted }) => {
  const [step, setStep] = useState<'REQUEST' | 'CONFIRM'>('REQUEST');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('REQUEST');
      setOtp('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleRequestOTP = async () => {
    setIsLoading(true);
    setError('');
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = import.meta.env.VITE_API_URL || 'https://3y70s1dk83.execute-api.us-east-1.amazonaws.com/prod';

      await fetch(`${baseUrl}/admin?action=request-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      setStep('CONFIRM');
    } catch (err: any) {
      setError('Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = import.meta.env.VITE_API_URL || 'https://3y70s1dk83.execute-api.us-east-1.amazonaws.com/prod';

      const response = await fetch(`${baseUrl}/admin?action=confirm-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, otp })
      });

      if (!response.ok) throw new Error('Invalid verification code.');

      setSuccess(true);
      setTimeout(() => {
        onDeleted();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-red-900/20 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-red-600 p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Secure Deactivation</h2>
          <p className="text-red-100 text-sm mt-1 uppercase font-bold tracking-widest">Administrator Verification Required</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="py-8 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Account Removed</h3>
              <p className="text-gray-500 mt-2">The user directory has been synchronized.</p>
            </div>
          ) : step === 'REQUEST' ? (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-red-700 text-sm font-medium leading-relaxed">
                  You are about to permanently remove <span className="font-bold underline">{userEmail}</span> from the GITAM directory. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Sending...' : (
                  <>
                    <Send size={18} />
                    Send Verification Code
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all text-center"
              >
                Cancel
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmDelete} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Enter 6-Digit Admin OTP</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-red-200 focus:bg-white rounded-2xl outline-none transition-all font-black text-xl tracking-[0.5em] text-center text-red-600"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold text-center mt-2">CODE SENT TO YOUR REGISTERED ADMIN EMAIL</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-70"
                >
                  {isLoading ? 'Verifying...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

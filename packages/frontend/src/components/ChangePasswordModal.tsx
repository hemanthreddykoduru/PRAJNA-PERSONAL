import React, { useState } from 'react';
import { ShieldCheck, Key, Eye, EyeOff, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { updatePassword } from 'aws-amplify/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await updatePassword({
        oldPassword,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#007366]/20 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-[#F0E0C1] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[#007366] p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-secondary" />
          </div>
          <h2 className="text-2xl font-bold">Security Settings</h2>
          <p className="text-white/60 text-sm mt-1 uppercase font-bold tracking-widest">Update Your Identity Password</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="py-8 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Password Updated!</h3>
              <p className="text-gray-500 mt-2">Your security settings have been synchronized.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-700"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Secure Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-700"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                  <input
                    type={showPasswords ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium text-gray-700"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-2 text-[10px] font-black text-[#007366] uppercase tracking-widest hover:opacity-70 transition-all ml-1"
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
              </button>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-[#007366] text-white font-bold rounded-2xl hover:bg-[#00594C] transition-all shadow-lg shadow-[#007366]/20 disabled:opacity-70"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

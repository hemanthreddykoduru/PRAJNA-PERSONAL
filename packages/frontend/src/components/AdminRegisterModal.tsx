import React, { useState } from 'react';
import { UserPlus, Loader2, X, CheckCircle2 } from 'lucide-react';
import { fetchAuthSession } from 'aws-amplify/auth';

interface AdminRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminRegisterModal: React.FC<AdminRegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    department: 'CSE', 
    role: 'Faculty', 
    campus: 'Bengaluru' 
  });

  const [retryCount, setRetryCount] = useState(0);

  const handleAddUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      const baseUrl = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

      const response = await fetch(`${baseUrl}/admin?action=create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      const result = await response.json();
      
      // Handle AWS Sync Latency (409 Conflict)
      if (response.status === 409 && retryCount < 1) {
        setRetryCount(1);
        setError("Optimizing Directory... One moment.");
        setTimeout(() => {
          handleAddUser();
        }, 5000);
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register user');
      }

      setSuccess(true);
      setRetryCount(0);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setNewUser({ name: '', email: '', department: 'CSE', role: 'Faculty', campus: 'Bengaluru' });
      }, 2500);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
            <UserPlus size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Register New Faculty</h2>
          <p className="text-[#F0E0C1] text-sm mt-1 uppercase font-bold tracking-widest">Institutional Directory Entry</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {success ? (
            <div className="py-8 text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Registration Successful</h3>
              <p className="text-gray-500 mt-2">Activation email sent to {newUser.email}</p>
            </div>
          ) : (
            <form onSubmit={handleAddUser} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@gitam.edu"
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Campus</label>
                  <select 
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-black text-xs"
                    value={newUser.campus}
                    onChange={(e) => setNewUser({...newUser, campus: e.target.value})}
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                  <select 
                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-black text-xs"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="Faculty">Faculty</option>
                    <option value="HoD">HoD</option>
                    <option value="Director">Director</option>
                    <option value="ProVC">ProVC</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#007366] text-white font-black rounded-2xl hover:bg-[#00594C] transition-all shadow-lg shadow-[#007366]/20 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

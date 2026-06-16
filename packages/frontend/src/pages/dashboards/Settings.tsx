import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Monitor, Mail, Key, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChangePasswordModal } from '../../components/ChangePasswordModal';

export function Settings() {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DR';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-text">Account Settings</h1>
        <p className="text-textMuted mt-1">Manage your profile, preferences, and security</p>
      </div>

      {/* Profile Section */}
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6">
          <User className="text-primary" size={20} />
          Profile Information
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/20">
              {initials}
            </div>
            <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
              Change Avatar
            </button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''} 
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none text-text"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email || ''} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-textMuted outline-none cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Department</label>
                <select 
                  defaultValue="EECE" 
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none text-text appearance-none"
                >
                  <option value="EECE">Electrical, Electronics and Communication Engineering (EECE)</option>
                  <option value="CSE">Computer Science and Engineering (CSE)</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="BIOTECH">Biotechnology</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Role</label>
                <input 
                  type="text" 
                  defaultValue={user?.role || 'Faculty'} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-textMuted outline-none cursor-not-allowed"
                />
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 min-w-[140px] justify-center"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : showSuccess ? (
                  <>
                    <Check size={18} />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Section */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6">
            <Shield className="text-primary" size={20} />
            Security & Authentication
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text text-sm">Password</h3>
                <p className="text-textMuted text-xs mt-0.5">Change your account password</p>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-text border border-border hover:bg-black/5 px-4 py-2 rounded-lg transition-colors"
              >
                <Key size={16} />
                Update
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text text-sm">Two-Factor Authentication</h3>
                <p className="text-textMuted text-xs mt-0.5">Add an extra layer of security</p>
              </div>
              <button className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6">
            <Bell className="text-primary" size={20} />
            Notification Preferences
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-text text-sm">Email Digest</h3>
                  <p className="text-textMuted text-xs mt-0.5">Weekly performance summary</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Monitor size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-text text-sm">System Alerts</h3>
                  <p className="text-textMuted text-xs mt-0.5">Important announcements & updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
}

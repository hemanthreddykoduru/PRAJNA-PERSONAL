import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, Shield, Moon, Monitor, Mail, Key, Check, Camera } from 'lucide-react';
import { updateUserAttributes } from 'aws-amplify/auth';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { useAuth } from '../../contexts/AuthContext';

export function Settings() {
  const { user, reloadUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || 'EECE');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department);
      if (user.picture) {
        getUrl({ path: user.picture })
          .then((res) => setAvatarPreview(res.url.toString()))
          .catch((err) => console.error('Failed to load avatar:', err));
      }
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user?.sub) {
      try {
        setError('');
        // Show instant preview while uploading
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        const extension = file.name.split('.').pop();
        const path = `public/avatars/${user.sub}.${extension}`;
        
        await uploadData({
          path,
          data: file,
          options: { contentType: file.type }
        }).result;

        await updateUserAttributes({
          userAttributes: { picture: path }
        });

        await reloadUser();
        window.dispatchEvent(new Event('avatarUpdated'));
      } catch (err: any) {
        console.error('Upload failed:', err);
        setError('Failed to upload profile picture to secure vault.');
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateUserAttributes({
        userAttributes: {
          name: name,
          'custom:department': department
        }
      });
      await reloadUser();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
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
        <h1 className="text-2xl font-bold text-text">Profile Settings</h1>
        <p className="text-textMuted mt-1">Manage your academic profile and personal information</p>
      </div>

      {/* Profile Section */}
      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6">
          <User className="text-primary" size={20} />
          Profile Information
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/20 overflow-hidden border-4 border-background transition-transform group-hover:scale-105">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Change Avatar
            </button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none text-text"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-textMuted outline-none cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-textMuted uppercase tracking-wider">Department</label>
                <select 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
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
    </div>
  );
}

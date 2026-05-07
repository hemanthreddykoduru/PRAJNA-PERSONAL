import React from 'react';
import { Save, Shield, Mail, Globe, Bell, Database } from 'lucide-react';

export function SystemSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure global application behavior and security policies.</p>
      </div>

      <div className="space-y-4">
        {/* Authentication Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Authentication & Access</h3>
              <p className="text-xs text-gray-500">Configure how users access the platform.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-800">Force SSO Login</p>
                <p className="text-xs text-gray-500">Only allow GITAM Microsoft 365 credentials.</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-800">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Show maintenance page to all non-admin users.</p>
              </div>
              <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
              <Database size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">AI Intelligence Center</h3>
              <p className="text-xs text-gray-500">Manage Amazon Bedrock & Claude 3 parameters.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Model</label>
              <select className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-primary/20 transition-all">
                <option>Anthropic Claude 3 Sonnet</option>
                <option>Anthropic Claude 3 Opus</option>
                <option>Meta Llama 3 (70B)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temperature</label>
              <input type="range" className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-[10px] font-bold text-gray-400">
                <span>Predictable</span>
                <span>Creative</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
          Discard Changes
        </button>
        <button className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
          <Save size={18} />
          Save Settings
        </button>
      </div>
    </div>
  );
}

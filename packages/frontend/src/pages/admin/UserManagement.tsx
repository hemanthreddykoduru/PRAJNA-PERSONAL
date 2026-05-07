import React, { useState } from 'react';
import { Search, Filter, UserPlus, MoreVertical, Shield, Mail, MapPin } from 'lucide-react';

const USERS = [
  { id: 1, name: 'Dr. Ramesh Iyer', email: 'ramesh.iyer@gitam.edu', role: 'HoD', campus: 'Bengaluru', status: 'Active' },
  { id: 2, name: 'Dr. Priya Sharma', email: 'priya.sharma@gitam.edu', role: 'Faculty', campus: 'Vizag', status: 'Active' },
  { id: 3, name: 'Prof. Ankit Verma', email: 'ankit.verma@gitam.edu', role: 'Faculty', campus: 'Hyderabad', status: 'Pending' },
  { id: 4, name: 'Dr. Sneha Reddy', email: 'sneha.reddy@gitam.edu', role: 'Director', campus: 'Bengaluru', status: 'Active' },
];

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage 1,451 registered faculty and staff members.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, email or employee ID..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Campus</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {USERS.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xs">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                    <Shield size={10} />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    {user.campus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    user.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

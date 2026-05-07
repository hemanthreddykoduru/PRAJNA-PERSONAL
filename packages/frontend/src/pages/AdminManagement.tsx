import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { 
  Users, 
  UserPlus, 
  FileUp, 
  Search, 
  Filter,
  Shield,
  MoreVertical,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface FacultyMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  campus: string;
  status: 'active' | 'pending' | 'inactive';
}

const AdminManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      // Cognito Authorizer usually expects the IdToken
      const token = session.tokens?.idToken?.toString();
      
      const baseUrl = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

      const response = await fetch(`${baseUrl}/admin?action=list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log("FETCHED USERS DATA:", data);
      
      if (Array.isArray(data)) {
        const mappedFaculty = data.map((u: any) => ({
          id: u.Username,
          name: u.Attributes?.find((a: any) => a.Name === 'name')?.Value || u.Username,
          email: u.Attributes?.find((a: any) => a.Name === 'email')?.Value || '',
          role: u.Attributes?.find((a: any) => a.Name === 'custom:role')?.Value || 'Faculty',
          department: u.Attributes?.find((a: any) => a.Name === 'custom:department')?.Value || 'CSE',
          campus: u.Attributes?.find((a: any) => a.Name === 'custom:campus')?.Value || 'Bengaluru',
          status: (u.Enabled ? 'active' : 'inactive') as 'active' | 'pending' | 'inactive'
        }));
        setFaculty(mappedFaculty);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Fallback for safety
      setFaculty([]);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = 'name,email,department,campus,role\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prajna_faculty_import_template.csv';
    a.click();
  };

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    // Simulate real file processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setImportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsImporting(false);
          // Add dummy imported user
          setFaculty(prev => [
            ...prev,
            { id: Date.now().toString(), name: 'New Imported Faculty', email: 'imported@gitam.edu', role: 'Faculty', department: 'Unknown', campus: 'Bengaluru', status: 'pending' }
          ]);
        }, 500);
      }
    }, 200);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', department: 'CSE', role: 'Faculty', campus: 'Bengaluru' });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const baseUrl = import.meta.env.VITE_API_URL || 'https://cov49w67hk.execute-api.us-east-1.amazonaws.com/prod';

      await fetch(`${baseUrl}/admin?action=create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      setShowAddModal(false);
      setNewUser({ name: '', email: '', department: 'CSE', role: 'Faculty', campus: 'Bengaluru' });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const headers = 'id,name,email,department,campus,role,status\n';
    const dataRows = faculty.map(m => 
      `${m.id},${m.name},${m.email},${m.department},${m.campus},${m.role},${m.status}`
    ).join('\n');
    
    const blob = new Blob([headers + dataRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prajna_faculty_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#007366]/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-[#F0E0C1] w-[500px] transform animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Faculty</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  >
                    <option>CSE</option>
                    <option>ECE</option>
                    <option>EEE</option>
                    <option>Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Role</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option>Faculty</option>
                    <option>HoD</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[#007366] text-white font-bold rounded-2xl hover:bg-[#00594C] transition-all shadow-lg shadow-[#007366]/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleBulkImport}
        className="hidden" 
        accept=".csv"
      />

      {/* Processing Modal Overlay */}
      {isImporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#007366]/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-[#F0E0C1] w-[450px] text-center transform animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#F0E0C1]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileUp size={40} className="text-[#007366] animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Importing Faculty Data</h2>
            <p className="text-gray-500 mb-8 font-medium">Validating records and syncing with Cognito...</p>
            
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-[#007366] h-full transition-all duration-300 ease-out shadow-lg shadow-[#007366]/20"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <div className="text-sm font-black text-[#007366] uppercase tracking-widest">{importProgress}% Complete</div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-500 text-lg">Centralized Command for GITAM University Faculty & Administration</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#F0E0C1]/30 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <Download size={20} />
            Template
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-6 py-3 bg-[#F0E0C1]/30 border-2 border-[#F0E0C1] text-[#007366] font-bold rounded-2xl hover:bg-[#F0E0C1]/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <FileUp size={20} className="text-[#007366]" />
            {isImporting ? 'Processing...' : 'Bulk Import'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#007366] text-white font-bold rounded-2xl hover:bg-[#00594C] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#007366]/20"
          >
            <UserPlus size={20} />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Users', value: isLoading ? '...' : faculty.length.toLocaleString(), icon: Users, color: 'text-[#007366]', bg: 'bg-[#007366]/5' },
          { label: 'Active Now', value: isLoading ? '...' : faculty.filter(f => f.status === 'active').length.toLocaleString(), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-[#F0E0C1]/40' },
          { label: 'Pending Invitations', value: isLoading ? '...' : faculty.filter(f => f.status === 'pending').length.toLocaleString(), icon: AlertCircle, color: 'text-[#E33A0C]', bg: 'bg-[#E33A0C]/5' },
          { label: 'System Admins', value: isLoading ? '...' : faculty.filter(f => f.role === 'Admin').length.toLocaleString(), icon: Shield, color: 'text-[#007366]', bg: 'bg-[#F0E0C1]/40' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#007366] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search faculty by name, email or dept..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-[#F0E0C1] focus:bg-white rounded-2xl outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 font-bold hover:bg-[#F0E0C1]/30 hover:text-[#007366] rounded-xl transition-all">
              <Filter size={18} />
              Filter
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 font-bold hover:bg-[#F0E0C1]/30 hover:text-[#007366] rounded-xl transition-all"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Faculty Member</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-[#007366] animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">Synchronizing with GITAM Directory...</p>
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold">No faculty records found.</p>
                  </td>
                </tr>
              ) : faculty.map((member) => (
                <tr key={member.id} className="hover:bg-[#F0E0C1]/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#007366]/10 flex items-center justify-center text-[#007366] font-black text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">{member.department}</span>
                      <span className="text-xs text-gray-400 uppercase tracking-tighter">{member.campus} Campus</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-transparent font-bold text-[#007366] focus:outline-none cursor-pointer"
                      value={member.role}
                      onChange={(e) => {
                        const newFaculty = [...faculty];
                        const idx = newFaculty.findIndex(f => f.id === member.id);
                        newFaculty[idx].role = e.target.value;
                        setFaculty(newFaculty);
                      }}
                    >
                      <option>Faculty</option>
                      <option>HoD</option>
                      <option>Director</option>
                      <option>ProVC</option>
                      <option>Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      member.status === 'active' ? 'bg-[#007366]/10 text-[#007366]' : 
                      member.status === 'pending' ? 'bg-[#F0E0C1] text-[#735D00]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#007366] hover:bg-[#F0E0C1]/30 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Shield size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <AlertCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900 font-bold">1-10</span> of <span className="text-gray-900 font-bold">1,451</span> results
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, '...', 145].map((p, i) => (
              <button 
                key={i} 
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  p === 1 ? 'bg-[#007366] text-white shadow-lg shadow-[#007366]/20' : 'text-gray-500 hover:bg-white border border-transparent hover:border-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLE_HOME } from './contexts/AuthContext';
import type { UserRole } from './contexts/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPassword';
import CompleteNewPasswordPage from './pages/CompleteNewPassword';

// Dashboards
import { FacultyDashboard } from './pages/dashboards/FacultyDashboard';
import { HoDDashboard } from './pages/dashboards/HoDDashboard';
import { DirectorDashboard } from './pages/dashboards/DirectorDashboard';
import { ProVCDashboard } from './pages/dashboards/ProVCDashboard';
import { IQACDashboard } from './pages/dashboards/IQACDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

// Module pages
import ResearchPage from './pages/ResearchPage';
import ApprovalsPage from './pages/ApprovalsPage';
import TeachingPage from './pages/TeachingPage';
import PeerLeaderboard from './pages/PeerLeaderboard';
import { DocumentVault } from './pages/DocumentVault';
import { CriteriaDetail } from './pages/CriteriaDetail';
import AdminManagement from './pages/AdminManagement';
import Attendance from './pages/Attendance';
import { SystemSettings } from './pages/admin/SystemSettings';
import { DataMigration } from './pages/admin/DataMigration';
import { AuditLogs } from './pages/admin/AuditLogs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/complete-new-password" element={<CompleteNewPasswordPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/faculty" replace />} />

            {/* Faculty routes */}
            <Route path="faculty" element={
              <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            <Route path="faculty/research" element={
              <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                <ResearchPage />
              </ProtectedRoute>
            } />
            <Route path="faculty/achievements" element={
              <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                <PeerLeaderboard />
              </ProtectedRoute>
            } />
            <Route path="faculty/teaching" element={
              <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                <TeachingPage />
              </ProtectedRoute>
            } />
            <Route path="faculty/development" element={
              <ProtectedRoute allowedRoles={['Faculty', 'Admin']}>
                <DocumentVault />
              </ProtectedRoute>
            } />

            {/* HoD routes */}
            <Route path="hod" element={
              <ProtectedRoute allowedRoles={['HoD', 'Admin']}>
                <HoDDashboard />
              </ProtectedRoute>
            } />
            <Route path="hod/approvals" element={
              <ProtectedRoute allowedRoles={['HoD', 'Admin']}>
                <ApprovalsPage />
              </ProtectedRoute>
            } />
            <Route path="hod/faculty" element={
              <ProtectedRoute allowedRoles={['HoD', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">Faculty List — Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="hod/reports" element={
              <ProtectedRoute allowedRoles={['HoD', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">Department Reports — Coming Soon</div>
              </ProtectedRoute>
            } />

            {/* Director routes */}
            <Route path="director" element={
              <ProtectedRoute allowedRoles={['Director', 'Admin']}>
                <DirectorDashboard />
              </ProtectedRoute>
            } />
            <Route path="director/departments" element={
              <ProtectedRoute allowedRoles={['Director', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">All Departments — Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="director/approvals" element={
              <ProtectedRoute allowedRoles={['Director', 'Admin']}>
                <ApprovalsPage />
              </ProtectedRoute>
            } />
            <Route path="director/reports" element={
              <ProtectedRoute allowedRoles={['Director', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">NAAC / NIRF Reports — Coming Soon</div>
              </ProtectedRoute>
            } />

            {/* ProVC routes */}
            <Route path="provc" element={
              <ProtectedRoute allowedRoles={['ProVC', 'Admin']}>
                <ProVCDashboard />
              </ProtectedRoute>
            } />
            <Route path="provc/schools" element={
              <ProtectedRoute allowedRoles={['ProVC', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">All Schools — Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="provc/analytics" element={
              <ProtectedRoute allowedRoles={['ProVC', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">Analytics — Coming Soon</div>
              </ProtectedRoute>
            } />

            {/* IQAC routes */}
            <Route path="iqac" element={
              <ProtectedRoute allowedRoles={['IQAC', 'Admin']}>
                <IQACDashboard />
              </ProtectedRoute>
            } />
            <Route path="iqac/readiness" element={
              <ProtectedRoute allowedRoles={['IQAC', 'Admin']}>
                <div className="text-gray-500 p-8 text-center">Readiness Detail — Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="iqac/criteria/:id" element={
              <ProtectedRoute allowedRoles={['IQAC', 'Admin']}>
                <CriteriaDetail />
              </ProtectedRoute>
            } />

            <Route path="attendance" element={
              <ProtectedRoute allowedRoles={['Faculty', 'HoD', 'Director', 'Admin']}>
                <Attendance />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminManagement />
              </ProtectedRoute>
            } />
            <Route path="admin/settings" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="admin/migration" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DataMigration />
              </ProtectedRoute>
            } />
            <Route path="admin/audit" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } />
          </Route>

          {/* Legacy redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

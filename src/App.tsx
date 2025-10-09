import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard, { AppLayout } from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import FeeManagement from './components/FeeManagement';
import AttendanceManagement from './components/AttendanceManagement';
import ResultsManagement from './components/ResultsManagement';
import SessionManagement from './components/SessionManagement';
import UserManagement from './components/UserManagement';
import ClassManagement from './components/ClassManagement';
import SubjectManagement from './components/SubjectManagement';
import TeacherManagement from './components/TeacherManagement';
import AssignmentManagement from './components/AssignmentManagement';
import EventManagement from './components/EventManagement';
import ReportsAnalytics from './components/ReportsAnalytics';
import Settings from './components/Settings';
import IDCardGeneration from './components/IDCardGeneration';
import PromotionModule from './components/PromotionModule';
import FirebaseInitializer from './components/FirebaseInitializer';
import ProtectedRoute from './components/ProtectedRoute';



function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<FirebaseInitializer />} />
            
            {/* Protected Routes with AppLayout */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'secretary', 'proprietor', 'parent', 'student']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'secretary']}>
                <AppLayout>
                  <StudentManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            

            
            <Route path="/fees" element={
              <ProtectedRoute allowedRoles={['admin', 'secretary']}>
                <AppLayout>
                  <FeeManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            
                      <Route path="/sessions" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppLayout>
                <SessionManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <UserManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/classes" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppLayout>
                <ClassManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/subjects" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppLayout>
                <SubjectManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/teachers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <TeacherManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <AppLayout>
                <AssignmentManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppLayout>
                <EventManagement />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/id-cards" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppLayout>
                <IDCardGeneration />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/promotion" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary']}>
              <AppLayout>
                <PromotionModule />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/firebase-setup" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <FirebaseInitializer />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['admin', 'secretary', 'teacher']}>
              <AppLayout>
                <ReportsAnalytics />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />
            
            <Route path="/attendance" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <AppLayout>
                  <AttendanceManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/results" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <AppLayout>
                  <ResultsManagement />
                </AppLayout>
              </ProtectedRoute>
            } />
            

            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 
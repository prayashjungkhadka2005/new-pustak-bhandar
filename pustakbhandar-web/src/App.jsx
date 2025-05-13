import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PermissionRoute from './components/PermissionRoute';
import { Permissions } from './constants/permissions';
import Unauthorized from './pages/Unauthorized';
import { Toaster } from 'react-hot-toast';

// Import your pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '1rem',
              borderRadius: '8px',
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              padding: '16px',
              maxWidth: '400px',
            },
            success: {
              iconTheme: {
                primary: '#2563eb',
                secondary: '#fff',
              },
              style: {
                border: '1px solid #2563eb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
              style: {
                border: '1px solid #ef4444',
              },
            },
          }}
          containerStyle={{
            top: 24,
            right: 24,
          }}
          limit={1}
        />
        <Routes>
          {/* Root route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PermissionRoute permission={Permissions.MANAGE_USERS}>
                <AdminDashboard />
              </PermissionRoute>
            }
          />

          {/* Protected Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <PermissionRoute permission={Permissions.VIEW_ORDERS}>
                <StaffDashboard />
              </PermissionRoute>
            }
          />

          {/* Add more protected routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
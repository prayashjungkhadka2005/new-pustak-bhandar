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
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import StaffLayout from './pages/staff/StaffLayout';
import OrdersPage from './pages/staff/OrdersPage';
import AddBook from './pages/admin/AddBook';
import DiscountPage from './pages/admin/DiscountPage';
import AnnouncementPage from './pages/admin/AnnouncementPage';
import OrderPage from './pages/admin/OrderPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import MemberLayout from './pages/member/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberOrdersPage from './pages/member/OrdersPage';
import CartPage from './pages/member/CartPage';
import WishlistPage from './pages/member/WishlistPage';
import ProfilePage from './pages/member/ProfilePage';
import ReviewsPage from './pages/member/ReviewsPage';

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
            path="/admin"
            element={
              <PermissionRoute permission={Permissions.MANAGE_USERS}>
                <AdminLayout />
              </PermissionRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="books/add" element={<AddBook />} />
            <Route path="discounts" element={<DiscountPage />} />
            <Route path="announcements" element={<AnnouncementPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="users" element={<UserManagementPage />} />
            {/* Add more admin routes here */}
          </Route>

          {/* Protected Staff Routes */}
          <Route
            path="/staff"
            element={
              <PermissionRoute permission={Permissions.VIEW_ORDERS}>
                <StaffLayout />
              </PermissionRoute>
            }
          >
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<div>Users Page (Coming Soon)</div>} />
            <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
            <Route path="notifications" element={<div>Notifications Page (Coming Soon)</div>} />
          </Route>

          {/* Protected Member Routes (nested) */}
          <Route
            path="/member"
            element={
              <PermissionRoute permission={Permissions.VIEW_SELF_DASHBOARD}>
                <MemberLayout />
              </PermissionRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<MemberOrdersPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            {/* Add more member routes here */}
          </Route>

          {/* Add more protected routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
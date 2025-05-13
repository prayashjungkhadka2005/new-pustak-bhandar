import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PermissionRoute = ({ permission, children }) => {
  const { user, hasPermission, loading } = useAuth();

  // Wait for auth state to load before making a decision
  if (loading) return null; // Or a <Loader /> component

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required permission and is an admin
  if (!hasPermission(permission) || !user?.roles?.includes('Admin')) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PermissionRoute; 
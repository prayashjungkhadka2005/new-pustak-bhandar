import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const PermissionRoute = ({ permission, children }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PermissionRoute; 
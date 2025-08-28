import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { Spinner } from '../ui/spinner';

export const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole = null,
  fallback = null,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    hasAllPermissions, 
    hasRole, 
    loading: permissionsLoading 
  } = usePermissions();
  const location = useLocation();

  // Mostrar spinner mientras se cargan los datos
  if (authLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Si se requieren permisos específicos, verificar
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Si pasa todas las validaciones, mostrar el contenido
  return children;
};

// Componente para proteger elementos específicos de la UI
export const ProtectedElement = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole = null,
  fallback = null 
}) => {
  const { isAuthenticated } = useAuth();
  const { hasAllPermissions, hasRole } = usePermissions();

  // Si no está autenticado, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  // Si se requieren permisos específicos, verificar
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return fallback;
  }

  // Si pasa todas las validaciones, mostrar el contenido
  return children;
};

// Hook para verificar permisos en componentes
export const useRouteProtection = (requiredPermissions = [], requiredRole = null) => {
  const { isAuthenticated } = useAuth();
  const { hasAllPermissions, hasRole } = usePermissions();

  const hasAccess = () => {
    if (!isAuthenticated) return false;
    
    if (requiredRole && !hasRole(requiredRole)) return false;
    
    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) return false;
    
    return true;
  };

  return { hasAccess };
};

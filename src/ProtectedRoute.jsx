import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, userStatus } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;

  // Si el usuario no está autenticado, redirigir al login
  if (!isAuthenticated) {
    // Guardar la URL actual en localStorage antes de redirigir
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado pero no verificado, redirigir a verificación
  if (userStatus === 'pending') {
    return <Navigate to="/verificacion" replace />;
  }

  // Si el usuario está inactivo, redirigir al login con mensaje
  if (userStatus === 'inactive') {
    // Limpiar cookies y redirigir al login
    localStorage.setItem('loginMessage', 'Tu cuenta está inactiva. Contacta al administrador.');
    return <Navigate to="/login" replace />;
  }

  // Usuario autenticado y verificado - permitir acceso
  return <Outlet />;
};

export default ProtectedRoute;

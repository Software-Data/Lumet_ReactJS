import React from 'react';
import { usePermissions } from '../../context/PermissionsContext';

/**
 * Componente que renderiza contenido basándose en permisos específicos
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar si se cumplen los permisos
 * @param {Array} props.requiredPermissions - Lista de permisos requeridos [{module, action}]
 * @param {number} props.requiredRole - Rol específico requerido
 * @param {React.ReactNode} props.fallback - Contenido alternativo si no se cumplen los permisos
 * @param {boolean} props.requireAll - Si es true, requiere todos los permisos. Si es false, solo uno
 * @param {string} props.module - Módulo específico para verificar permisos CRUD
 * @param {string} props.action - Acción específica (CREATE, READ, UPDATE, DELETE)
 */
export const PermissionGuard = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole = null,
  fallback = null,
  requireAll = true,
  module = null,
  action = null
}) => {
  const { 
    hasPermission, 
    hasRole, 
    canCreate, 
    canRead, 
    canUpdate, 
    canDelete,
    hasAllPermissions,
    hasAnyPermission
  } = usePermissions();

  // Verificar si se cumple la condición de permisos
  const hasAccess = () => {
    // Si se especifica un rol requerido, verificar primero
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }

    // Si se especifica módulo y acción específicos
    if (module && action) {
      return hasPermission(module, action);
    }

    // Si se especifica solo módulo, verificar permisos CRUD básicos
    if (module && !action) {
      return canRead(module) || canCreate(module) || canUpdate(module) || canDelete(module);
    }

    // Si se especifican permisos específicos
    if (requiredPermissions.length > 0) {
      return requireAll 
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }

    // Si no se especifica nada, permitir acceso
    return true;
  };

  return hasAccess() ? children : fallback;
};

/**
 * Componentes de conveniencia para permisos CRUD específicos
 */
export const CreateGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard 
    module={module} 
    action="CREATE" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const ReadGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard 
    module={module} 
    action="VIEW" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const UpdateGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard 
    module={module} 
    action="EDIT" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const DeleteGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard 
    module={module} 
    action="DELETE" 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * Componente para verificar acceso a módulos completos
 */
export const ModuleGuard = ({ children, module, fallback = null }) => (
  <PermissionGuard 
    module={module} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * Componente para verificar roles específicos
 */
export const RoleGuard = ({ children, roleId, fallback = null }) => (
  <PermissionGuard 
    requiredRole={roleId} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

/**
 * Hook para verificar permisos en componentes funcionales
 */
export const usePermissionGuard = () => {
  const { 
    hasPermission, 
    hasRole, 
    canCreate, 
    canRead, 
    canUpdate, 
    canDelete 
  } = usePermissions();

  const checkAccess = (module, action) => hasPermission(module, action);
  const checkRole = (roleId) => hasRole(roleId);
  const checkCRUD = (module) => ({
    canCreate: canCreate(module),
    canRead: canRead(module),
    canUpdate: canUpdate(module),
    canDelete: canDelete(module)
  });

  return {
    checkAccess,
    checkRole,
    checkCRUD
  };
};

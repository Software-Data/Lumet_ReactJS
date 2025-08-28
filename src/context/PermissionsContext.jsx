import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { useAuth } from "./AuthContext";

export const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions debe estar dentro del PermissionsProvider");
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const { user, permissions } = useAuth();
  const [userRole, setUserRole] = useState(null);

  // Extraer rol del usuario cuando se autentica
  useEffect(() => {
    if (user) {
      setUserRole(user.id_rol);
    }
  }, [user]);

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = useMemo(() => {
    return (module, action) => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.some(perm => 
        perm.module === module && perm.action === action
      );
    };
  }, [permissions]);

  // Funciones de conveniencia para permisos CRUD
  const canCreate = useMemo(() => {
    return (module) => hasPermission(module, 'CREATE');
  }, [hasPermission]);

  const canRead = useMemo(() => {
    return (module) => hasPermission(module, 'VIEW');
  }, [hasPermission]);

  const canUpdate = useMemo(() => {
    return (module) => hasPermission(module, 'EDIT');
  }, [hasPermission]);

  const canDelete = useMemo(() => {
    return (module) => hasPermission(module, 'DELETE');
  }, [hasPermission]);

  // Verificar roles específicos
  const hasRole = useMemo(() => {
    return (roleId) => userRole === roleId;
  }, [userRole]);

  const isAdmin = useMemo(() => {
    return userRole === 1; // Asumiendo que el rol 1 es admin
  }, [userRole]);

  const isSuperAdmin = useMemo(() => {
    return userRole === 1; // Ajustar según tu estructura de roles
  }, [userRole]);

  // Verificar si tiene acceso a un módulo completo
  const hasModuleAccess = useMemo(() => {
    return (module) => {
      if (!permissions || permissions.length === 0) return false;
      return permissions.some(perm => perm.module === module);
    };
  }, [permissions]);

  // Obtener todos los permisos de un módulo específico
  const getModulePermissions = useMemo(() => {
    return (module) => {
      if (!permissions || permissions.length === 0) return [];
      return permissions.filter(perm => perm.module === module);
    };
  }, [permissions]);

  // Verificar si tiene al menos un permiso de una lista
  const hasAnyPermission = useMemo(() => {
    return (permissionList) => {
      if (!permissions || permissions.length === 0) return false;
      return permissionList.some(({ module, action }) => 
        hasPermission(module, action)
      );
    };
  }, [hasPermission]);

  // Verificar si tiene todos los permisos de una lista
  const hasAllPermissions = useMemo(() => {
    return (permissionList) => {
      if (!permissions || permissions.length === 0) return false;
      return permissionList.every(({ module, action }) => 
        hasPermission(module, action)
      );
    };
  }, [hasPermission]);

  // Verificar si el usuario tiene permisos para gestionar roles y permisos
  const canManageRoles = useMemo(() => {
    return hasPermission('ROLES', 'EDIT') || hasPermission('PERMISOS', 'EDIT');
  }, [hasPermission]);

  const canManagePermissions = useMemo(() => {
    return hasPermission('PERMISOS', 'EDIT');
  }, [hasPermission]);

  const value = {
    permissions,
    userRole,
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasRole,
    isAdmin,
    isSuperAdmin,
    hasModuleAccess,
    getModulePermissions,
    hasAnyPermission,
    hasAllPermissions,
    canManageRoles,
    canManagePermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

import { useState, useCallback } from 'react';
import { permissionsService, rolesPermissionsService, userPermissionsService } from '../api/api';

/**
 * Hook personalizado para gestionar permisos y roles
 * Proporciona funciones para obtener, asignar y gestionar permisos
 */
export const usePermissionsManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Obtener todos los permisos disponibles
   */
  const getAllPermissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await permissionsService.getAll();
      return response.data || [];
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Error al obtener permisos';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener permisos de un rol específico
   * Intenta ambas rutas disponibles para mayor compatibilidad
   */
  const getRolePermissions = useCallback(async (roleId) => {
    if (!roleId) throw new Error('ID de rol requerido');
    
    setLoading(true);
    setError('');
    try {
      let response;
      
      // Intentar primero con la ruta de roles (más específica)
      try {
        response = await rolesPermissionsService.getRolePermissions(roleId);
      } catch (err) {
        // Si falla, intentar con la ruta alternativa
        console.log('Ruta de roles falló, intentando con permissions/roles...');
        response = await permissionsService.getRolePermissions(roleId);
      }
      
      // Normalizar la respuesta para manejar diferentes formatos
      const permissions = response.data?.permisos || response.data || [];
      return permissions.map(p => ({
        id: p.id || p,
        module: p.module || p.recurso,
        action: p.action || p.accion,
        descripcion: p.descripcion || p.descripcion || ''
      }));
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Error al obtener permisos del rol';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Asignar permisos a un rol
   * Intenta ambas rutas disponibles para mayor compatibilidad
   */
  const setRolePermissions = useCallback(async (roleId, permissionIds) => {
    if (!roleId) throw new Error('ID de rol requerido');
    if (!Array.isArray(permissionIds)) throw new Error('Array de permisos requerido');
    
    setLoading(true);
    setError('');
    try {
      let response;
      
      // Intentar primero con la ruta de roles (más específica)
      try {
        response = await rolesPermissionsService.setRolePermissions(roleId, permissionIds);
      } catch (err) {
        // Si falla, intentar con la ruta alternativa
        console.log('Ruta de roles falló, intentando con permissions/roles...');
        response = await permissionsService.setRolePermissions(roleId, permissionIds);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Error al asignar permisos al rol';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener permisos de un usuario específico
   */
  const getUserPermissions = useCallback(async (userId) => {
    if (!userId) throw new Error('ID de usuario requerido');
    
    setLoading(true);
    setError('');
    try {
      const response = await userPermissionsService.getUserPermissions(userId);
      return response.data || [];
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Error al obtener permisos del usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo permiso
   */
  const createPermission = useCallback(async (permissionData) => {
    setLoading(true);
    setError('');
    try {
      const response = await permissionsService.create(permissionData);
      return response.data;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Error al crear permiso';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Comparar dos arrays de permisos y obtener diferencias
   */
  const comparePermissions = useCallback((currentPermissions, newPermissions) => {
    const currentIds = currentPermissions.map(p => p.id || p);
    const newIds = newPermissions.map(p => p.id || p);
    
    const added = newIds.filter(id => !currentIds.includes(id));
    const removed = currentIds.filter(id => !newIds.includes(id));
    const unchanged = currentIds.filter(id => newIds.includes(id));
    
    return {
      added,
      removed,
      unchanged,
      hasChanges: added.length > 0 || removed.length > 0
    };
  }, []);

  /**
   * Agrupar permisos por módulo
   */
  const groupPermissionsByModule = useCallback((permissions) => {
    return permissions.reduce((acc, perm) => {
      const module = perm.module || perm.recurso;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(perm);
      return acc;
    }, {});
  }, []);

  /**
   * Filtrar permisos por módulo
   */
  const filterPermissionsByModule = useCallback((permissions, module) => {
    return permissions.filter(perm => 
      (perm.module || perm.recurso) === module
    );
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    // Estados
    loading,
    error,
    
    // Funciones principales
    getAllPermissions,
    getRolePermissions,
    setRolePermissions,
    getUserPermissions,
    createPermission,
    
    // Funciones de utilidad
    comparePermissions,
    groupPermissionsByModule,
    filterPermissionsByModule,
    clearError,
  };
};

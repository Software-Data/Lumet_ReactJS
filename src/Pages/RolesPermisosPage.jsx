import React, { useEffect, useReducer, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/layout.jsx';
import { rolesService, permissionsService, rolesPermissionsService } from '../api/api';
import { usePermissions } from '../context/PermissionsContext';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator-simple';
import { Spinner } from '../components/ui/spinner';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RefreshCw, Save, X, Check, Plus, Minus, LockKeyhole } from 'lucide-react';

// --- ESTILOS (Sin cambios, pero encapsulados para mayor claridad) ---

const CustomScrollbarStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
    .dark .custom-scrollbar { scrollbar-color: #4b5563 transparent; }
    .no-bounce { overscroll-behavior: contain; }
  `}</style>
);


// --- HOOK PERSONALIZADO PARA MANEJAR TODA LA LÓGICA ---

const initialState = {
  status: 'loading', // 'loading', 'success', 'error'
  roles: [],
  permissions: [],
  selectedRoleId: null,
  rolePermissions: {
    status: 'idle', // 'idle', 'loading', 'success', 'error'
    currentIds: [],
    originalIds: [],
  },
  savingStatus: 'idle', // 'idle', 'saving', 'success', 'error'
  error: null,
  successMessage: null,
};

function rolesPermissionsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_INIT_SUCCESS':
      return {
        ...state,
        status: 'success',
        roles: action.payload.roles,
        permissions: action.payload.permissions,
        selectedRoleId: action.payload.roles[0]?.id || null,
      };
    case 'FETCH_INIT_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'SELECT_ROLE':
      return { ...state, selectedRoleId: action.payload, successMessage: null, error: null };
    case 'FETCH_ROLE_PERMS_LOADING':
      return { ...state, rolePermissions: { ...state.rolePermissions, status: 'loading' } };
    case 'FETCH_ROLE_PERMS_SUCCESS':
      return {
        ...state,
        rolePermissions: { status: 'success', currentIds: action.payload, originalIds: action.payload },
      };
    case 'FETCH_ROLE_PERMS_ERROR':
      return { ...state, rolePermissions: { ...state.rolePermissions, status: 'error' }, error: action.payload };
    case 'TOGGLE_PERMISSION':
      const { currentIds } = state.rolePermissions;
      const newIds = currentIds.includes(action.payload)
        ? currentIds.filter(id => id !== action.payload)
        : [...currentIds, action.payload];
      return { ...state, rolePermissions: { ...state.rolePermissions, currentIds: newIds } };
    case 'CANCEL_CHANGES':
      return { ...state, rolePermissions: { ...state.rolePermissions, currentIds: state.rolePermissions.originalIds } };
    case 'SAVE_START':
      return { ...state, savingStatus: 'saving', successMessage: null, error: null };
    case 'SAVE_SUCCESS':
      return {
        ...state,
        savingStatus: 'success',
        successMessage: 'Permisos actualizados correctamente.',
        rolePermissions: { ...state.rolePermissions, originalIds: state.rolePermissions.currentIds },
      };
    case 'SAVE_ERROR':
      return { ...state, savingStatus: 'error', error: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, successMessage: null, error: null };
    case 'RESET_SAVING_STATUS':
      return { ...state, savingStatus: 'idle' };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const useRolesPermissions = () => {
  const [state, dispatch] = useReducer(rolesPermissionsReducer, initialState);
  const navigate = useNavigate();
  const { canRead } = usePermissions();

  // Comprobar permisos de lectura iniciales
  useEffect(() => {
    if (!canRead('ROLES') || !canRead('PERMISOS')) {
      navigate('/unauthorized');
    }
  }, [canRead, navigate]);

  // Función de fetch inicial
  const fetchInitialData = useCallback(async () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    try {
      const [rolesRes, permsRes] = await Promise.all([
        rolesService.getAll(),
        permissionsService.getAll(),
      ]);
      dispatch({
        type: 'FETCH_INIT_SUCCESS',
        payload: { roles: rolesRes.data || [], permissions: permsRes.data || [] },
      });
    } catch (err) {
      dispatch({ type: 'FETCH_INIT_ERROR', payload: 'No se pudieron cargar los datos iniciales.' });
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Cargar permisos cuando cambia el rol seleccionado
  useEffect(() => {
    if (!state.selectedRoleId) return;

    const fetchRolePerms = async () => {
      dispatch({ type: 'FETCH_ROLE_PERMS_LOADING' });
      dispatch({ type: 'CLEAR_MESSAGES' });
      try {
        // Estrategia de Fallback: Intenta una API, si falla, intenta con la otra.
        let response;
        try {
          response = await rolesPermissionsService.getRolePermissions(state.selectedRoleId);
        } catch (error) {
          console.warn('API principal de permisos falló, intentando fallback...');
          response = await permissionsService.getRolePermissions(state.selectedRoleId);
        }
        const ids = (response.data?.permisos || response.data || []).map(p => p.id || p);
        dispatch({ type: 'FETCH_ROLE_PERMS_SUCCESS', payload: ids });
      } catch (err) {
        dispatch({ type: 'FETCH_ROLE_PERMS_ERROR', payload: 'Error al cargar los permisos del rol.' });
      }
    };
    fetchRolePerms();
  }, [state.selectedRoleId]);
  
  // Limpiar mensaje de éxito tras un tiempo
  useEffect(() => {
    if (state.successMessage) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_MESSAGES' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.successMessage]);


  // Handlers que el componente usará
  const handleSelectRole = (roleId) => dispatch({ type: 'SELECT_ROLE', payload: roleId });
  const handleTogglePermission = (permId) => dispatch({ type: 'TOGGLE_PERMISSION', payload: permId });
  const handleCancel = () => dispatch({ type: 'CANCEL_CHANGES' });

  const handleSave = async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      // Misma estrategia de Fallback para guardar
      try {
        await rolesPermissionsService.setRolePermissions(state.selectedRoleId, state.rolePermissions.currentIds);
      } catch (error) {
        console.warn('API principal para guardar falló, intentando fallback...');
        await permissionsService.setRolePermissions(state.selectedRoleId, state.rolePermissions.currentIds);
      }
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SAVE_ERROR', payload: err?.response?.data?.message || 'No se pudo guardar los cambios.' });
    } finally {
      // Permitir que la UI muestre éxito/error antes de volver a 'idle'
      setTimeout(() => dispatch({ type: 'RESET_SAVING_STATUS' }), 2000);
    }
  };

  return { state, handlers: { handleSelectRole, handleTogglePermission, handleCancel, handleSave, fetchInitialData } };
};


// --- SUB-COMPONENTES DE UI ---

const RoleList = React.memo(({ roles, selectedRoleId, onSelectRole, onRefresh, isLoading }) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="flex-shrink-0">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl">Roles del Sistema</CardTitle>
        <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </CardHeader>
    <CardContent className="flex-1 overflow-y-auto custom-scrollbar no-bounce p-4">
      <div className="space-y-3">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              selectedRoleId === role.id
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 shadow-lg scale-105'
                : 'border-transparent hover:border-emerald-400 dark:hover:border-emerald-600 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-900'
            }`}
          >
            <p className="font-semibold text-gray-900 dark:text-white">{role.nombre}</p>
            {role.descripcion && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.descripcion}</p>}
          </button>
        ))}
      </div>
    </CardContent>
  </Card>
));

const PermissionPanel = React.memo(({ role, permissions, rolePerms, onTogglePerm, canUpdate }) => {
  const permissionsByModule = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      acc[perm.module] = acc[perm.module] || [];
      acc[perm.module].push(perm);
      return acc;
    }, {});
  }, [permissions]);

  if (rolePerms.status === 'loading') {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  }
  
  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
        <LockKeyhole className="h-24 w-24 mb-4 text-gray-300 dark:text-gray-600" />
        <h2 className="text-2xl font-semibold">Selecciona un Rol</h2>
        <p className="mt-1">Elige un rol de la lista para ver y editar sus permisos.</p>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col border-none shadow-none">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-xl">Permisos para: <span className="text-emerald-600 dark:text-emerald-400">{role.nombre}</span></CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {rolePerms.currentIds.length} de {permissions.length} permisos asignados
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto custom-scrollbar no-bounce p-4 space-y-6">
        {Object.entries(permissionsByModule).map(([module, modulePerms]) => (
          <div key={module}>
            <div className="flex items-center mb-3">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{module}</h3>
              <Badge variant="secondary" className="ml-3">
                {modulePerms.filter(p => rolePerms.currentIds.includes(p.id)).length}/{modulePerms.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {modulePerms.map(perm => {
                const isSelected = rolePerms.currentIds.includes(perm.id);
                return (
                  <button
                    key={perm.id}
                    onClick={() => onTogglePerm(perm.id)}
                    disabled={!canUpdate}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/50 dark:border-emerald-700'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                    } ${!canUpdate ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{perm.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{perm.descripcion}</p>
                    </div>
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-emerald-500 border-emerald-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover:border-emerald-500'}`}>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <Separator className="mt-6" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

const ChangeSummary = React.memo(({ permissions, addedIds, removedIds }) => {
  const getPermDetails = (id) => permissions.find(p => p.id === id);

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-4 border border-gray-200 dark:border-gray-700 mt-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">Resumen de Cambios</h4>
      {addedIds.length > 0 && (
        <div>
          <div className="flex items-center text-emerald-800 dark:text-emerald-200 font-medium mb-2">
            <Plus className="h-4 w-4 mr-2" /> Permisos a Agregar ({addedIds.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {addedIds.map(id => getPermDetails(id)).map(p => p && (
              <Badge key={`add-${p.id}`} variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700">{p.module} / {p.action}</Badge>
            ))}
          </div>
        </div>
      )}
      {removedIds.length > 0 && (
        <div>
          <div className="flex items-center text-red-800 dark:text-red-200 font-medium mb-2">
            <Minus className="h-4 w-4 mr-2" /> Permisos a Quitar ({removedIds.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {removedIds.map(id => getPermDetails(id)).map(p => p && (
              <Badge key={`rem-${p.id}`} variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700">{p.module} / {p.action}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const ActionFooter = ({ onSave, onCancel, isSaving, hasChanges, canUpdate }) => (
  <div className={`sticky bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${hasChanges ? 'translate-y-0' : 'translate-y-full'}`}>
    <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
       <p className="text-sm text-gray-600 dark:text-gray-400 mr-auto">
        {canUpdate ? 'Tienes cambios sin guardar.' : 'No tienes permisos para guardar cambios.'}
       </p>
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={isSaving || !canUpdate} className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]">
        {isSaving ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </div>
  </div>
);


// --- COMPONENTE PRINCIPAL ---

function RolesPermisosPage() {
  const { canUpdate } = usePermissions();
  const { state, handlers } = useRolesPermissions();
  
  const { status, roles, permissions, selectedRoleId, rolePermissions, savingStatus, error, successMessage } = state;
  const { handleSelectRole, handleTogglePermission, handleCancel, handleSave, fetchInitialData } = handlers;
  
  const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId), [roles, selectedRoleId]);
  
  const addedIds = useMemo(() => rolePermissions.currentIds.filter(id => !rolePermissions.originalIds.includes(id)), [rolePermissions]);
  const removedIds = useMemo(() => rolePermissions.originalIds.filter(id => !rolePermissions.currentIds.includes(id)), [rolePermissions]);
  const hasChanges = addedIds.length > 0 || removedIds.length > 0;

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen"><Spinner size="xl" /></div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={[{ module: 'ROLES', action: 'VIEW' }, { module: 'PERMISOS', action: 'VIEW' }]}>
      <Layout>
        <CustomScrollbarStyles />
        <div className="h-screen flex flex-col">
          {/* Header */}
          <header className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Roles y Permisos</h1>
            <p className="text-gray-500 dark:text-gray-400">Asigna permisos específicos a cada rol del sistema.</p>
          </header>

          {/* Alertas */}
          <div className="p-6 pt-2 pb-0">
            {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
            {successMessage && <Alert className="mb-4 border-emerald-500 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300"><AlertDescription>{successMessage}</AlertDescription></Alert>}
          </div>
          
          {/* Contenido principal */}
          <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
            <div className="h-full overflow-hidden">
              <RoleList 
                roles={roles} 
                selectedRoleId={selectedRoleId} 
                onSelectRole={handleSelectRole}
                onRefresh={fetchInitialData}
                isLoading={status === 'loading'}
              />
            </div>

            <div className="lg:col-span-2 h-full overflow-y-auto custom-scrollbar no-bounce">
              <PermissionPanel
                role={selectedRole}
                permissions={permissions}
                rolePerms={rolePermissions}
                onTogglePerm={handleTogglePermission}
                canUpdate={canUpdate('PERMISOS')}
              />
              {hasChanges && (
                <ChangeSummary 
                  permissions={permissions}
                  addedIds={addedIds}
                  removedIds={removedIds}
                />
              )}
            </div>
          </main>
          
          {/* Pie de página de acciones */}
          <ActionFooter
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={savingStatus === 'saving'}
            hasChanges={hasChanges}
            canUpdate={canUpdate('PERMISOS')}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default RolesPermisosPage;
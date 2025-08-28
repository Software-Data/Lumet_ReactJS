import { createContext, useState, useContext, useEffect } from "react";
import { loginRequest } from "../api/Auth";
import { registerService, authService, userPermissionsService } from "../api/api";
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("Debe estar dentro del Provider");
    }
    return context;
}

// Hook personalizado para permisos en tiempo real
export const usePermissions = () => {
    const { permissions, permissionsLastUpdate, refreshPermissionsNow, permissionsRefreshing } = useAuth();
    
    return {
        permissions,
        permissionsLastUpdate,
        refreshPermissionsNow,
        permissionsRefreshing,
        // Función helper para verificar si un permiso específico existe
        hasPermission: (module, action) => {
            return permissions.some(perm => 
                perm.module === module && perm.action === action
            );
        },
        // Función helper para verificar múltiples permisos
        hasAnyPermission: (permissionList) => {
            return permissionList.some(({ module, action }) => 
                permissions.some(perm => perm.module === module && perm.action === action)
            );
        },
        // Función helper para verificar todos los permisos
        hasAllPermissions: (permissionList) => {
            return permissionList.every(({ module, action }) => 
                permissions.some(perm => perm.module === module && perm.action === action)
            );
        }
    };
};

export const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    Cookies.remove('permissions');
    window.location.href = '/login';
}

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState(null); // 'pending', 'verified', 'inactive'
    const [permissionsLastUpdate, setPermissionsLastUpdate] = useState(null);
    const [permissionsRefreshing, setPermissionsRefreshing] = useState(false);
    const [lastPermissionsRefresh, setLastPermissionsRefresh] = useState(null);

    // Función para refrescar permisos desde el backend
    const refreshPermissionsFromBackend = async (userId) => {
        try {
            if (!userId || permissionsRefreshing) {
                console.log('No se pueden refrescar permisos:', { userId, permissionsRefreshing });
                return;
            }

            setPermissionsRefreshing(true);
            console.log('Refrescando permisos desde el backend para usuario:', userId);
            
            // Usar el endpoint correcto para obtener permisos del usuario
            const response = await userPermissionsService.getUserPermissions(userId);
            console.log('Respuesta del servicio de permisos:', response);
            
            if (response.data && response.data.success) {
                const { permisos } = response.data;
                
                // Actualizar permisos si hay cambios
                if (permisos && JSON.stringify(permisos) !== JSON.stringify(permissions)) {
                    console.log('Permisos actualizados desde el backend:', permisos);
                    setPermissions(permisos);
                    setPermissionsLastUpdate(new Date());
                    // Actualizar cookies de permisos
                    Cookies.set('permissions', JSON.stringify(permisos));
                } else {
                    console.log('No hay cambios en los permisos');
                }
                
                setLastPermissionsRefresh(new Date());
            } else {
                console.log('No se pudieron obtener permisos actualizados del backend');
            }
        } catch (error) {
            console.error('Error al refrescar permisos desde el backend:', error);
            
            // Si hay error de autenticación, limpiar estado
            if (error.response?.status === 401) {
                console.log('Token expirado, limpiando estado de autenticación');
                logout();
            }
        } finally {
            setPermissionsRefreshing(false);
        }
    };

    // Función para refrescar permisos manualmente
    const refreshPermissionsNow = async () => {
        if (user?.id && !permissionsRefreshing) {
            console.log('Refresco manual de permisos solicitado');
            await refreshPermissionsFromBackend(user.id);
        }
    };

    const login = async (userCredentials) => {
        try {
            console.log('Intentando login con:', userCredentials);
            
            const response = await loginRequest(userCredentials);
            console.log('Respuesta del login:', response);
            
            // Verificar que la respuesta tenga la estructura esperada
            if (!response.data) {
                throw new Error('Respuesta del servidor inválida');
            }
            
            const { usuario, token, permissions: userPermissions } = response.data;
            
            // Validar que tengamos los datos necesarios
            if (!usuario || !token) {
                throw new Error('Datos de usuario o token faltantes');
            }
            
            console.log('Usuario autenticado:', usuario);
            console.log('Permisos:', userPermissions);
            
            // Verificar el estado del usuario
            const userVerificado = usuario.verificado || usuario.verified || false;
            const userActivo = usuario.activo !== false && usuario.active !== false; // Por defecto activo si no se especifica
            
            console.log('Usuario verificado:', userVerificado);
            console.log('Usuario activo:', userActivo);
            
            // Determinar el estado del usuario
            let status = 'pending';
            if (!userActivo) {
                status = 'inactive';
            } else if (!userVerificado) {
                status = 'pending';
            } else {
                status = 'verified';
            }
            
            setUserStatus(status);
            
            // Si el usuario está inactivo, no permitir login
            if (!userActivo) {
                return { 
                    success: false, 
                    message: 'Tu cuenta está inactiva. Contacta al administrador.',
                    status: 'inactive'
                };
            }
            
            // Si el usuario no está verificado, permitir login pero marcar como pendiente
            if (!userVerificado) {
                // Guardar datos básicos para verificación
                setUser(usuario);
                setPermissions(userPermissions || []);
                setIsAuthenticated(false); // No autenticado hasta verificar
                
                // Guardar en cookies temporalmente
                Cookies.set('tempToken', token);
                Cookies.set('tempUser', JSON.stringify(usuario));
                
                return { 
                    success: false, 
                    message: 'Tu cuenta requiere verificación.',
                    status: 'pending',
                    requiresVerification: true
                };
            }
            
            // Usuario verificado y activo - login completo
            setUser(usuario);
            setPermissions(userPermissions || []);
            setIsAuthenticated(true);
            setUserStatus('verified');
            
            // Guardar en cookies permanentes
            Cookies.set('token', token);
            Cookies.set('user', JSON.stringify(usuario));
            Cookies.set('permissions', JSON.stringify(userPermissions || []));
            
            // Refrescar permisos desde el backend para asegurar que estén actualizados
            console.log('Usuario autenticado, refrescando permisos desde el backend...');
            setTimeout(() => {
                if (usuario.id) {
                    refreshPermissionsFromBackend(usuario.id);
                }
            }, 1000); // Pequeño delay para asegurar que el estado se haya establecido
            
            return { 
                success: true, 
                message: 'Login exitoso.',
                status: 'verified'
            };
            
        } catch (error) {
            console.error('Error en login:', error);
            
            let errorMessage = 'Error en el inicio de sesión';
            
            if (error.response) {
                // Error de respuesta del servidor
                errorMessage = error.response.data?.message || error.response.data?.error || 'Credenciales inválidas';
                console.error('Error del servidor:', error.response.data);
            } else if (error.request) {
                // Error de red
                errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
                console.error('Error de red:', error.request);
            } else {
                // Error del cliente
                errorMessage = error.message || 'Error inesperado';
                console.error('Error del cliente:', error.message);
            }
            
            return { 
                success: false, 
                message: errorMessage,
                status: 'error'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await registerService.register(userData);
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const verifyCode = async (code, correo) => {
        try {
            // Usar el nuevo authService.verifyCode que envía codigo y correo
            const res = await authService.verifyCode(code, correo);
            if (res.data.token) {
                const userData = res.data.usuario;
                const userPermissions = res.data.permissions || [];
                
                // Verificar que el usuario esté verificado después del código
                const userVerificado = userData.verificado || userData.verified || false;
                const userActivo = userData.activo !== false && userData.active !== false;
                
                if (!userActivo) {
                    throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
                }
                
                if (!userVerificado) {
                    throw new Error('La verificación no se completó correctamente.');
                }
                
                // Usuario verificado y activo
                setUser(userData);
                setPermissions(userPermissions);
                setIsAuthenticated(true);
                setUserStatus('verified');
                
                // Limpiar cookies temporales y establecer permanentes
                Cookies.remove('tempToken');
                Cookies.remove('tempUser');
                Cookies.set('token', res.data.token);
                Cookies.set('user', JSON.stringify(userData));
                Cookies.set('permissions', JSON.stringify(userPermissions));
                
                // Refrescar permisos desde el backend para asegurar que estén actualizados
                console.log('Usuario verificado, refrescando permisos desde el backend...');
                setTimeout(() => {
                    if (userData.id) {
                        refreshPermissionsFromBackend(userData.id);
                    }
                }, 1000); // Pequeño delay para asegurar que el estado se haya establecido
            }
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const verifyAccessCode = async (accessCode) => {
        try {
            const res = await registerService.accessCode(accessCode);
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    // Función para actualizar permisos del usuario
    const updateUserPermissions = (newPermissions) => {
        setPermissions(newPermissions);
        Cookies.set('permissions', JSON.stringify(newPermissions));
    };

    // Función para refrescar datos del usuario
    const refreshUserData = async () => {
        try {
            // Aquí podrías hacer una llamada a /api/auth/me para obtener datos actualizados
            // Por ahora, solo recargamos desde las cookies
            const cookies = Cookies.get();
            if (cookies.token && cookies.user) {
                const userData = JSON.parse(cookies.user);
                const userPermissions = cookies.permissions ? JSON.parse(cookies.permissions) : [];
                
                setUser(userData);
                setPermissions(userPermissions);
                setIsAuthenticated(true);
                
                // Determinar estado del usuario
                const userVerificado = userData.verificado || userData.verified || false;
                const userActivo = userData.activo !== false && userData.active !== false;
                
                if (!userActivo) {
                    setUserStatus('inactive');
                } else if (!userVerificado) {
                    setUserStatus('pending');
                } else {
                    setUserStatus('verified');
                }
                
                // Refrescar permisos desde el backend si el usuario está verificado
                if (userData.id && userVerificado && userActivo) {
                    console.log('Usuario verificado en refreshUserData, refrescando permisos...');
                    setTimeout(() => {
                        refreshPermissionsFromBackend(userData.id);
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error al refrescar datos del usuario:', error);
        }
    };

    // Función para limpiar estado de verificación pendiente
    const clearPendingVerification = () => {
        Cookies.remove('tempToken');
        Cookies.remove('tempUser');
        setUser(null);
        setPermissions([]);
        setIsAuthenticated(false);
        setUserStatus(null);
    };

    useEffect(() => {
        const cookies = Cookies.get();
        
        // Primero verificar si hay cookies temporales (usuario pendiente de verificación)
        if (cookies.tempToken && cookies.tempUser) {
            try {
                const userData = JSON.parse(cookies.tempUser);
                console.log('Usuario pendiente de verificación encontrado en cookies temporales:', userData);
                
                // Usuario no verificado - no autenticar pero mantener datos
                setUser(userData);
                setUserStatus('pending');
                setIsAuthenticated(false);
                setLoading(false);
                return;
            } catch (error) {
                console.error('Error al parsear datos temporales del usuario:', error);
                // Si hay error, limpiar cookies temporales corruptas
                Cookies.remove('tempToken');
                Cookies.remove('tempUser');
            }
        }
        
        // Luego verificar cookies permanentes (usuario verificado)
        if (cookies.token && cookies.user) {
            try {
                const userData = JSON.parse(cookies.user);
                console.log('Usuario verificado encontrado en cookies permanentes:', userData);
                
                // Verificar estado del usuario
                const userVerificado = userData.verificado || userData.verified || false;
                const userActivo = userData.activo !== false && userData.active !== false;
                
                if (!userActivo) {
                    setUserStatus('inactive');
                    // Usuario inactivo - limpiar cookies y redirigir
                    Cookies.remove('token');
                    Cookies.remove('user');
                    Cookies.remove('permissions');
                    setLoading(false);
                    return;
                }
                
                if (!userVerificado) {
                    setUserStatus('pending');
                    // Usuario no verificado - no autenticar
                    setIsAuthenticated(false);
                } else {
                    setUserStatus('verified');
            setIsAuthenticated(true);
                }
                
                setUser(userData);
                
                // Cargar permisos si existen
                if (cookies.permissions) {
                    setPermissions(JSON.parse(cookies.permissions));
                }
            } catch (error) {
                console.error('Error al parsear datos del usuario:', error);
                // Si hay error, limpiar cookies corruptas
                Cookies.remove('token');
                Cookies.remove('user');
                Cookies.remove('permissions');
            }
        }
        
        setLoading(false);
    }, []);
    
    // useEffect para refrescar permisos en cada refresh de página (evitando ciclos)
    useEffect(() => {
        if (isAuthenticated && user?.id && !permissionsRefreshing) {
            // Solo refrescar si han pasado al menos 30 segundos desde el último refresco
            const now = new Date();
            const timeSinceLastRefresh = lastPermissionsRefresh ? (now - lastPermissionsRefresh) / 1000 : 999;
            
            if (timeSinceLastRefresh > 30) {
                console.log('Usuario autenticado, refrescando permisos desde el backend...');
                refreshPermissionsFromBackend(user.id);
            } else {
                console.log('Permisos refrescados recientemente, saltando refresco automático');
            }
        }
    }, [isAuthenticated, user?.id]); // Solo se ejecuta cuando cambian isAuthenticated o user.id

    return (
        <AuthContext.Provider 
            value={{
                login,
                register,
                verifyCode,
                verifyAccessCode,
                user,
                permissions,
                logout,
                isAuthenticated,
                loading,
                userStatus,
                updateUserPermissions,
                refreshUserData,
                clearPendingVerification,
                refreshPermissionsNow, // Exponer la nueva función
                permissionsLastUpdate, // Exponer la información de última actualización
                permissionsRefreshing // Exponer el estado de refreshing
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

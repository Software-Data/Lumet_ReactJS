import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usuariosService, authService } from '../api/api';
import imagenLogo from '../assets/Logo.png';
import { Mail, CheckCircle, XCircle, ArrowLeft, RefreshCw, User, AlertCircle, Clock } from 'lucide-react';
import { ColorRing } from "react-loader-spinner";

function VerificacionPage() {
  const navigate = useNavigate();
  const { correo } = useParams(); // Obtener el correo de los parámetros de la URL
  const { user, userStatus, isAuthenticated, clearPendingVerification, verifyCode } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [userByEmail, setUserByEmail] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [resendResult, setResendResult] = useState(null);

  // Debug: verificar que el componente se esté renderizando
  console.log('=== DEBUG: VerificacionPage renderizado ===');
  console.log('correo (URL):', correo);
  console.log('user (AuthContext):', user);
  console.log('userStatus:', userStatus);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('authService disponible:', typeof authService);
  console.log('authService.resendCode disponible:', typeof authService?.resendCode);

  // Si hay correo en la URL, buscar el usuario correspondiente
  useEffect(() => {
    if (correo) {
      console.log('=== DEBUG: Búsqueda de usuario por correo ===');
      console.log('Correo a buscar:', correo);
      
      setLoadingUser(true);
      setEmailError(null);
      
      usuariosService.getByEmail(correo)
        .then(response => {
          console.log('Respuesta completa del servicio:', response);
          if (response.data) {
            setUserByEmail(response.data.data);
            console.log('Usuario encontrado por correo:', response.data.data);
          } else {
            console.log('Respuesta sin data:', response.data);
            setEmailError('No se encontró un usuario con ese correo electrónico.');
          }
        })
        .catch(error => {
          console.error('Error al buscar usuario por correo:', error);
          setEmailError('Error al buscar usuario. Verifica que el correo sea correcto.');
        })
        .finally(() => {
          setLoadingUser(false);
        });
    }
  }, [correo]);

  // Redirigir si el usuario ya está verificado o no hay usuario pendiente
  useEffect(() => {
    console.log('=== DEBUG: useEffect de redirección ===');
    console.log('userStatus:', userStatus);
    console.log('user:', user);
    console.log('correo:', correo);
    console.log('isAuthenticated:', isAuthenticated);
    
    if (userStatus === 'verified') {
      console.log('Usuario verificado, redirigiendo a dashboard');
      navigate('/dashboard');
    } else if (!user && userStatus !== 'pending' && !correo) {
      console.log('No hay usuario y no hay correo en URL, redirigiendo a login');
      navigate('/login');
    } else if (userStatus === 'pending' && user) {
      console.log('Usuario pendiente de verificación encontrado:', user);
    } else if (correo) {
      console.log('Verificación directa por correo:', correo);
    }
  }, [userStatus, user, navigate, correo, isAuthenticated]);

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setVerificationResult({
        type: 'error',
        title: 'Código Requerido',
        message: 'Por favor ingresa el código de verificación.'
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Si tenemos usuario por correo, usar ese ID
      const userId = userByEmail ? userByEmail.id : (user ? user.id : null);
      
      if (!userId) {
        throw new Error('No se pudo identificar al usuario para verificar.');
      }

      // Determinar el correo a usar según el contexto
      let correoToUse;
      
      if (correo) {
        // Contexto directo: usar el correo de los parámetros de la URL
        correoToUse = correo;
        console.log('Verificando código por correo directo:', correoToUse);
      } else if (user) {
        // Contexto de login: usar el correo del AuthContext
        correoToUse = user.email || user.username;
        console.log('Verificando código por contexto de login:', correoToUse);
      } else if (userByEmail) {
        // Contexto de búsqueda por correo: usar el correo del usuario encontrado
        correoToUse = userByEmail.email || userByEmail.username;
        console.log('Verificando código por usuario encontrado por correo:', correoToUse);
      } else {
        console.error('No se pudo determinar el correo electrónico:');
        console.error('- correo:', correo);
        console.error('- user:', user);
        console.error('- userStatus:', userStatus);
        console.error('- userByEmail:', userByEmail);
        throw new Error('No se pudo determinar el correo electrónico para verificar.');
      }
      
      if (!correoToUse) {
        throw new Error('No se pudo determinar el correo electrónico para verificar.');
      }

      console.log('Enviando verificación con código:', verificationCode, 'y correo:', correoToUse);
      const result = await verifyCode(verificationCode, correoToUse);
      
      if (result.success || result.token) {
        setVerificationResult({
          type: 'success',
          title: 'Verificación Exitosa',
          message: 'Tu cuenta ha sido verificada correctamente. Serás redirigido al dashboard.',
          action: 'redirect'
        });
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setVerificationResult({
          type: 'error',
          title: 'Verificación Fallida',
          message: result.message || 'El código de verificación no es válido.',
          action: 'retry'
        });
      }
    } catch (error) {
      console.error('Error en verificación:', error);
      setVerificationResult({
        type: 'error',
        title: 'Error en Verificación',
        message: error.message || 'Ocurrió un error durante la verificación.',
        action: 'retry'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    console.log('=== INICIO: handleResendCode ejecutado ===');
    setResendLoading(true);
    setResendResult(null);
    
    try {
      // Debug: mostrar información del contexto
      console.log('=== DEBUG: Reenvío de código ===');
      console.log('correo (URL):', correo);
      console.log('user (AuthContext):', user);
      console.log('userStatus:', userStatus);
      console.log('isAuthenticated:', isAuthenticated);
      console.log('userByEmail:', userByEmail);
      
      // Determinar el correo a usar según el contexto
      let emailToUse;
      
      if (correo) {
        // Contexto directo: usar el correo de los parámetros de la URL
        emailToUse = correo;
        console.log('Reenviando código por correo directo:', emailToUse);
      } else if (user) {
        // Contexto de login: usar el correo del AuthContext
        emailToUse = user.email || user.username;
        console.log('Reenviando código por contexto de login:', emailToUse);
      } else if (userByEmail) {
        // Contexto de búsqueda por correo: usar el correo del usuario encontrado
        emailToUse = userByEmail.email || userByEmail.username;
        console.log('Reenviando código por usuario encontrado por correo:', emailToUse);
      } else {
        console.error('No se pudo determinar el correo electrónico:');
        console.error('- correo:', correo);
        console.error('- user:', user);
        console.error('- userStatus:', userStatus);
        console.error('- userByEmail:', userByEmail);
        throw new Error('No se pudo determinar el correo electrónico para reenviar el código.');
      }
      
      if (!emailToUse) {
        throw new Error('No se pudo determinar el correo electrónico para reenviar el código.');
      }

      console.log('Email a usar para reenvío:', emailToUse);

      // Llamar al servicio real de reenvío
      console.log('Enviando request a /auth/reenviar-codigo con:', { correo: emailToUse });
      console.log('authService.resendCode disponible:', typeof authService.resendCode);
      
      const response = await authService.resendCode(emailToUse);
      console.log('Respuesta del servicio resendCode:', response);
      
      if (response.data && response.data.success) {
        const { data } = response.data;
        
        setResendResult({
          type: 'success',
          title: 'Código Reenviado',
          message: data.mensaje || 'Se ha enviado un nuevo código de verificación a tu correo electrónico.',
          data: {
            nuevoCodigo: data.nuevo_codigo,
            expiraEn: data.expira_en,
            usuarioId: data.usuario_id
          }
        });

        // Limpiar el resultado después de 5 segundos
        setTimeout(() => {
          setResendResult(null);
        }, 5000);
      } else {
        throw new Error(response.data?.message || 'No se pudo reenviar el código.');
      }
    } catch (error) {
      console.error('Error al reenviar código:', error);
      console.error('Stack trace:', error.stack);
      setResendResult({
        type: 'error',
        title: 'Error al Reenviar',
        message: error.message || 'No se pudo reenviar el código. Intenta nuevamente.',
        action: 'retry'
      });
    } finally {
      setResendLoading(false);
      console.log('=== FIN: handleResendCode completado ===');
    }
  };

  const handleBackToLogin = () => {
    if (user) {
      clearPendingVerification();
    }
    navigate('/login');
  };

  const handleAction = () => {
    if (verificationResult?.action === 'retry') {
      setVerificationResult(null);
      setVerificationCode('');
    }
    if (resendResult?.action === 'retry') {
      setResendResult(null);
    }
  };

  // Determinar qué usuario mostrar
  const currentUser = userByEmail || user;

  // Si hay correo pero no se encontró usuario, mostrar error
  if (correo && !loadingUser && !userByEmail && emailError) {
    return (
      <div className="relative min-h-screen w-full bg-gray-900 fill-transparent overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={imagenLogo}
            alt="Fondo desenfocado"
            className="m-auto h-full object-cover opacity-70"
          />
        </div>

        <div className="flex justify-center items-center min-h-screen px-4">
          <div className="p-12 bg-opacity-30 rounded-4xl max-w-lg w-full backdrop-blur-xl shadow-cyan-50"
               style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}>
            
            <button
              onClick={handleBackToLogin}
              className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Login
            </button>

            <div className="flex justify-center mb-6">
              <img src={imagenLogo} alt="Logo" className="w-20 h-20" />
            </div>

            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-600 rounded-full">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-white text-3xl font-semibold mb-2">
                Usuario No Encontrado
              </h2>
              <p className="text-gray-400">
                No se encontró un usuario con el correo: <strong>{correo}</strong>
              </p>
            </div>

            <div className="bg-red-900/50 border border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-red-400 font-medium">Error de Validación</h3>
                  <p className="text-red-300 text-sm mt-1">{emailError}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleBackToLogin}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuario y no hay correo, mostrar loading
  if (!currentUser && !correo) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperClass="color-ring-wrapper"
          colors={["#E6F3FF", "#E0F2FE", "#DEEAF6", "#D4E6F1", "#C9E4EC"]}
        />
      </div>
    );
  }

  // Si hay correo pero aún está cargando
  if (correo && loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center flex flex-col items-center justify-center">
          <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperClass="color-ring-wrapper"
            colors={["#E6F3FF", "#E0F2FE", "#DEEAF6", "#D4E6F1", "#C9E4EC"]}
          />
          <p className="text-white mt-4">Buscando usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-900 fill-transparent overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={imagenLogo}
          alt="Fondo desenfocado"
          className="m-auto h-full object-cover opacity-70"
        />
      </div>

      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="p-12 bg-opacity-30 rounded-4xl max-w-lg w-full backdrop-blur-xl shadow-cyan-50"
             style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}>
          
          {/* Botón de regreso */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </button>

          <div className="flex justify-center mb-6">
            <img src={imagenLogo} alt="Logo" className="w-20 h-20" />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-600 rounded-full">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-white text-3xl font-semibold mb-2">
              Verifica tu Cuenta
            </h2>
            <p className="text-gray-400">
              Hemos enviado un código de verificación a tu correo electrónico
            </p>
          </div>

          {/* Información del usuario */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-center justify-center text-gray-300">
              <User className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Verificando cuenta para: <strong>{currentUser?.email || currentUser?.username || correo || 'Usuario'}</strong>
              </span>
            </div>
            {correo && (
              <div className="mt-2 text-center">
                <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                  Verificación por correo directo
                </span>
              </div>
            )}
          </div>

          {/* Formulario de verificación */}
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 transition"
                placeholder="Ingresa el código de 6 dígitos"
                maxLength={6}
                disabled={isVerifying}
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !verificationCode.trim()}
              className={`w-full p-3 rounded-md font-medium transition ${
                isVerifying || !verificationCode.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <ColorRing
                    visible={true}
                    height="20"
                    width="20"
                    ariaLabel="color-ring-loading"
                    wrapperClass="color-ring-wrapper"
                    colors={["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]}
                  />
                  <span className="ml-2">Verificando...</span>
                </div>
              ) : (
                'Verificar Cuenta'
              )}
            </button>
          </form>

          {/* Botón de reenvío */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResendCode}
              disabled={resendLoading}
              className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors disabled:opacity-50"
            >
              {resendLoading ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Reenviando...
                </div>
              ) : (
                '¿No recibiste el código? Reenviar'
              )}
            </button>
            
            {/* Botón de test temporal */}
            <button
              onClick={() => {
                console.log('=== TEST: Botón de test clickeado ===');
                console.log('authService:', authService);
                console.log('authService.resendCode:', authService?.resendCode);
                console.log('typeof authService.resendCode:', typeof authService?.resendCode);
              }}
              className="ml-4 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              Test Debug
            </button>
          </div>

          {/* Resultado del reenvío */}
          {resendResult && (
            <div className={`mt-4 p-4 rounded-lg border ${
              resendResult.type === 'error' 
                ? 'border-red-500 bg-red-900/50' 
                : 'border-green-500 bg-green-900/50'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {resendResult.type === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    resendResult.type === 'error' 
                      ? 'text-red-400' 
                      : 'text-green-400'
                  }`}>
                    {resendResult.title}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {resendResult.message}
                  </p>
                  
                  {/* Mostrar información del nuevo código si está disponible */}
                  {resendResult.data && resendResult.data.nuevoCodigo && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Nuevo Código:</span>
                        <span className="text-xs text-yellow-400 font-mono bg-yellow-900/30 px-2 py-1 rounded">
                          {resendResult.data.nuevoCodigo}
                        </span>
                      </div>
                      {resendResult.data.expiraEn && (
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          Expira: {new Date(resendResult.data.expiraEn).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {resendResult.action && (
                    <button
                      type="button"
                      onClick={handleAction}
                      className={`mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        resendResult.type === 'error'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      Intentar Nuevamente
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resultado de la verificación */}
          {verificationResult && (
            <div className={`mt-6 p-4 rounded-lg border ${
              verificationResult.type === 'error' 
                ? 'border-red-500 bg-red-900/50' 
                : verificationResult.type === 'warning'
                ? 'border-yellow-500 bg-yellow-900/50'
                : 'border-green-500 bg-green-900/50'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {verificationResult.type === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : verificationResult.type === 'warning' ? (
                    <Mail className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    verificationResult.type === 'error' 
                      ? 'text-red-400' 
                      : verificationResult.type === 'warning'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    {verificationResult.title}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {verificationResult.message}
                  </p>
                  {verificationResult.action && (
                    <button
                      type="button"
                      onClick={handleAction}
                      className={`mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        verificationResult.type === 'error'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : verificationResult.type === 'warning'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {verificationResult.action === 'retry' ? 'Intentar Nuevamente' : 'Continuar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              El código de verificación expira en 24 horas
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Revisa tu carpeta de spam si no encuentras el correo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificacionPage;

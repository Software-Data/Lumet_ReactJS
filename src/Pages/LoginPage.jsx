
import {useForm} from "react-hook-form"
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import imagenLogo from '../assets/Logo.png'; 
import carousel1 from '../assets/carousel/carousel1.png';
import carousel2 from '../assets/carousel/carousel2.png';
import carousel3 from '../assets/carousel/carousel3.png';
import carousel4 from '../assets/carousel/carousel4.png';
import { useEffect } from "react";
import { ColorRing } from "react-loader-spinner";
import { useState } from "react";
import { Carousel } from "@material-tailwind/react";
import { AlertCircle, CheckCircle, XCircle, Mail, Lock, User } from 'lucide-react';
 
function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isAuthenticated, loading, userStatus } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginResult, setLoginResult] = useState(null);

  // Verificar si hay mensajes del localStorage al cargar la página
  useEffect(() => {
    const storedMessage = localStorage.getItem('loginMessage');
    if (storedMessage) {
      setLoginResult({
        type: 'error',
        title: 'Acceso Denegado',
        message: storedMessage,
        action: 'retry'
      });
      localStorage.removeItem('loginMessage'); // Limpiar el mensaje
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && userStatus === 'verified') {
      console.log('Usuario autenticado y verificado, redirigiendo...');
      // Obtener la URL guardada o ir al Dashboard por defecto
      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      localStorage.removeItem('redirectAfterLogin'); // Limpiar
      console.log('Redirigiendo a:', redirectTo);
      navigate(redirectTo);
    } else if (userStatus === 'pending') {
      console.log('Usuario requiere verificación, redirigiendo...');
      navigate('/verificacion');
    } else if (userStatus === 'inactive') {
      console.log('Usuario inactivo, mostrando mensaje...');
      // El mensaje se mostrará en el estado
    }
  }, [isAuthenticated, userStatus, navigate])

  const onSubmit = handleSubmit(async(values) => {
    console.log('Formulario enviado:', values);
    setIsLoading(true);
    setLoginResult(null);
    
    try {
      const result = await login(values);
      console.log('Resultado del login:', result);
      
      if (result.success) {
        if (result.status === 'verified') {
          console.log('Login exitoso, usuario verificado');
          // El useEffect se encargará de la redirección
        } else if (result.status === 'pending') {
          console.log('Usuario requiere verificación');
          setLoginResult({
            type: 'warning',
            title: 'Verificación Requerida',
            message: result.message,
            action: 'redirect',
            actionText: 'Ir a Verificación',
            actionUrl: '/verificacion'
          });
        }
      } else {
        if (result.status === 'inactive') {
          setLoginResult({
            type: 'error',
            title: 'Cuenta Inactiva',
            message: result.message,
            action: 'contact',
            actionText: 'Contactar Administrador'
          });
        } else if (result.status === 'pending') {
          setLoginResult({
            type: 'warning',
            title: 'Verificación Requerida',
            message: result.message,
            action: 'redirect',
            actionText: 'Ir a Verificación',
            actionUrl: '/verificacion'
          });
        } else {
          setLoginResult({
            type: 'error',
            title: 'Error de Autenticación',
            message: result.message,
            action: 'retry'
          });
        }
        console.error('Error de autenticación:', result.message);
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      setLoginResult({
        type: 'error',
        title: 'Error Inesperado',
        message: 'Error inesperado. Intenta nuevamente.',
        action: 'retry'
      });
    } finally {
      setIsLoading(false);
    }
  });

  const handleAction = () => {
    if (loginResult?.action === 'redirect' && loginResult?.actionUrl) {
      navigate(loginResult.actionUrl);
    } else if (loginResult?.action === 'contact') {
      // Aquí podrías abrir un modal o redirigir a una página de contacto
      alert('Por favor contacta al administrador del sistema para activar tu cuenta.');
    } else if (loginResult?.action === 'retry') {
      setLoginResult(null);
    }
  };

  // Si ya está autenticado, mostrar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
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

  return (
    <div className="relative min-h-screen w-full bg-gray-900 fill-transparent overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={imagenLogo}
          alt="Fondo desenfocado"
          className="m-auto h-full object-cover opacity-70 "
        />
      </div>

      <div className="flex justify-center items-center min-h-screen px-4">
        <form
          onSubmit={onSubmit}
          className="p-12 bg-opacity-30 rounded-4xl max-w-lg w-full backdrop-blur-xl shadow-cyan-50"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
        >
          <div className="flex justify-center">
            <img src={imagenLogo} alt="Logo" className="w-70 h-70 " />
          </div>
          <h2 className="text-white text-4xl font-semibold text-center mb-6">
            Iniciar sesión
          </h2>

          <label className="text-gray-400 text-sm flex items-center">
            <User className="h-4 w-4 mr-2" />
            Usuario
          </label>
          <input
            type="text"
            {...register("username", { 
              required: "El usuario es requerido" 
            })}
            className={`w-full p-3 bg-gray-700 text-white rounded-md my-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition ${
              errors.username ? 'border-red-500' : ''
            }`}
            placeholder="Nombre de usuario o correo electrónico"
            autoComplete="username"
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
          )}

          <label className="text-gray-400 text-sm flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Contraseña
          </label>
          <input
            type="password"
            {...register("clave", { 
              required: "La contraseña es requerida" 
            })}
            className={`w-full p-3 bg-gray-700 text-white rounded-md my-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition ${
              errors.clave ? 'border-red-500' : ''
            }`}
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
          />
          {errors.clave && (
            <p className="text-red-400 text-sm mt-1">{errors.clave.message}</p>
          )}

          <div className="flex justify-between text-gray-400 text-sm mb-4">
            <a href="#" className="hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
            <a href="#" className="hover:underline">
              Crear cuenta
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 p-3 bg-slate-600 text-white rounded-md hover:bg-blue-900 transition ${
              isLoading ? "opacity-90 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <ColorRing
                visible={true}
                height="40"
                width="100%"
                ariaLabel="color-ring-loading"
                wrapperClass="color-ring-wrapper"
                colors={["#E6F3FF", "#E0F2FE", "#DEEAF6", "#D4E6F1", "#C9E4EC"]}
              />
            ) : (
              "Iniciar sesión"
            )}
          </button>
            <Link to="/register">
              <button className="w-full mt-2 p-3 bg-slate-600 text-white rounded-md hover:bg-blue-900 transition">
                Crear cuenta
              </button>
            </Link>
          {/* Resultado del login */}
          {loginResult && (
            <div className={`mt-4 p-4 rounded-lg border ${
              loginResult.type === 'error' 
                ? 'border-red-500 bg-red-900/50' 
                : loginResult.type === 'warning'
                ? 'border-yellow-500 bg-yellow-900/50'
                : 'border-green-500 bg-green-900/50'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {loginResult.type === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : loginResult.type === 'warning' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    loginResult.type === 'error' 
                      ? 'text-red-400' 
                      : loginResult.type === 'warning'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    {loginResult.title}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {loginResult.message}
                  </p>
                  {loginResult.action && (
                    <button
                      type="button"
                      onClick={handleAction}
                      className={`mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        loginResult.type === 'error'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : loginResult.type === 'warning'
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {loginResult.actionText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-gray-400 text-sm text-center">
              Al iniciar sesión, aceptas nuestros{" "}
              <a href="/terminos" className="text-blue-500 hover:underline">
                Términos y condiciones
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
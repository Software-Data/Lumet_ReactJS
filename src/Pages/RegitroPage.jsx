import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/api";

import imagenLogo from '../assets/Logo.png';
import loginBackground from '../assets/Logo.png';

function RegistroPage() {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { verifyAccessCode, register: registerUser, verifyCode } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [accessCodeData, setAccessCodeData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [resendResult, setResendResult] = useState(null);

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  // Función para obtener el texto de fortaleza
  const getPasswordStrengthText = (password) => {
    const strength = getPasswordStrength(password);
    const texts = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
    return texts[strength];
  };

  // Contador para reenvío de código
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const getResendDelay = () => {
    if (resendAttempts === 0) return 60; // 60 segundos
    if (resendAttempts === 1) return 300; // 5 minutos
    if (resendAttempts === 2) return 3600; // 1 hora
    return 86400; // 24 horas
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    try {
      setIsLoading(true);
      setResendResult(null);
      
      // Determinar el correo a usar
      const emailToUse = email || userData?.email || userData?.username;
      
      if (!emailToUse) {
        throw new Error('No se pudo determinar el correo electrónico para reenviar el código.');
      }

      // Llamar al servicio real de reenvío
      const response = await authService.resendCode(emailToUse);
      
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

        setResendAttempts(prev => prev + 1);
        setResendTimer(getResendDelay());
        setMensaje("Código reenviado exitosamente.");
        
        // Limpiar el resultado después de 5 segundos
        setTimeout(() => {
          setResendResult(null);
        }, 5000);
      } else {
        throw new Error(response.data?.message || 'No se pudo reenviar el código.');
      }
    } catch (err) {
      console.error('Error al reenviar código:', err);
      setResendResult({
        type: 'error',
        title: 'Error al Reenviar',
        message: err.message || 'Error al reenviar código. Intente nuevamente.',
        action: 'retry'
      });
      setError("Error al reenviar código. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
  };

  // Paso 1: Verificar código de acceso
  const onAccessCodeSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setError("");
    setMensaje("");

    try {
      const response = await verifyAccessCode({ codigo: values.accessCode });
      setAccessCodeData(response);
      
      const rolNombre = response.rol?.nombre || response.rol || 'No especificado';
      setMensaje(`Código de acceso válido para el rol: ${rolNombre}`);
      setCurrentStep(2);
    } catch (err) {
      setError("Código de acceso inválido. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  });

  // Paso 2: Datos de registro
  const onRegisterSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setError("");
    setMensaje("");

    try {
      const userDataToSend = {
        ...values,
        id_rol: accessCodeData.rol?.id || accessCodeData.rol,
        codigo: accessCodeData.codigo || values.accessCode // Enviar el código de acceso
      };
      
      console.log("Datos a enviar al registro:", userDataToSend);
      await registerUser(userDataToSend);
      setUserData(userDataToSend);
      setEmail(values.correo);
      setMensaje("Usuario registrado. Verifique su correo electrónico.");
      setResendTimer(60); // Iniciar timer de 60 segundos
      setTimeout(() => setCurrentStep(3), 1500);
    } catch (err) {
      setError("Error al registrar usuario. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  });

  // Paso 3: Verificación de correo
  const onEmailVerification = () => {
    setCurrentStep(4);
  };

  // Paso 4: Verificar código de 6 dígitos
  const onVerifyCodeSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setError("");
    setMensaje("");

    try {
      const response = await verifyCode({
        codigo: values.verificationCode,
        correo: email
      });
      
      setMensaje("¡Verificación exitosa! Tu cuenta ha sido activada correctamente.");
      navigate("/dashboard");
    } catch (err) {
      setError("Código de verificación inválido. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  });

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      setMensaje("");
    }
  };

  const renderStep1 = () => (
    <div className="text-center">
      <p className="text-gray-300 mb-6">Ingrese su código de acceso</p>
      
      <form onSubmit={onAccessCodeSubmit}>
        <div className="mb-4">
          {/* Cajas para cada dígito */}
          <div className="flex justify-center gap-1 sm:gap-2 lg:gap-3 mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const currentValue = watch('accessCode') || '';
              const digit = currentValue[index] || '';
              
              return (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-center text-sm sm:text-lg md:text-xl lg:text-2xl font-bold rounded-lg border-2 transition-all duration-200 ${
                    digit 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 hover:border-gray-500'
                  }`}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && /^\d$/.test(value)) {
                      // Actualizar el valor en el formulario
                      const newValue = currentValue.slice(0, index) + value + currentValue.slice(index + 1);
                      setValue('accessCode', newValue);
                      
                      // Mover al siguiente input si no es el último
                      if (index < 5) {
                        // Usar setTimeout para asegurar que el DOM se actualice
                        setTimeout(() => {
                          const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                          const nextInput = inputs[index + 1];
                          if (nextInput) {
                            nextInput.focus();
                            nextInput.select();
                          }
                        }, 0);
                      }
                    } else {
                      // Si no es un número, limpiar el input
                      e.target.value = '';
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      if (e.target.value) {
                        // Si hay valor, limpiarlo
                        const newValue = currentValue.slice(0, index) + '' + currentValue.slice(index + 1);
                        setValue('accessCode', newValue);
                        e.target.value = '';
                      } else if (index > 0) {
                        // Mover al input anterior en backspace
                        const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                        const prevInput = inputs[index - 1];
                        if (prevInput) {
                          prevInput.focus();
                          prevInput.select();
                        }
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6);
                    if (/^\d{6}$/.test(pastedData)) {
                      // Primero actualizar el formulario
                      setValue('accessCode', pastedData);
                      
                      // Luego llenar todos los inputs visualmente
                      const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                      inputs.forEach((input, i) => {
                        input.value = pastedData[i] || '';
                      });
                      
                      // Enfocar el último input
                      setTimeout(() => {
                        inputs[pastedData.length - 1]?.focus();
                      }, 10);
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                />
              );
            })}
          </div>
          
          
          {/* Indicador de progreso */}
          <div className="text-center mb-4">
            <p className={`text-sm font-medium ${
              (watch('accessCode')?.length || 0) === 6 
                ? 'text-green-400' 
                : 'text-gray-400'
            }`}>
              {watch('accessCode')?.length || 0} de 6 dígitos ingresados
            </p>
          </div>
          
          {errors.accessCode && (
            <p className="text-red-400 text-sm mt-1">{errors.accessCode.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !watch('accessCode') || watch('accessCode')?.length !== 6}
          className={`w-full p-3 rounded-lg transition-all duration-200 hover-lift ${
            isLoading || !watch('accessCode') || watch('accessCode')?.length !== 6
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
              : 'bg-slate-600 text-white hover:bg-blue-900'
          }`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center">
              <ColorRing
                visible={true}
                height="30"
                width="30"
                ariaLabel="color-ring-loading"
                wrapperClass="color-ring-wrapper"
                colors={["#E6F3FF", "#E0F2FE", "#DEEAF6", "#D4E6F1", "#C9E4EC"]}
              />
            </div>
          ) : (
            "Verificar código"
          )}
        </button>
      </form>
    </div>
  );

  const renderStep2 = () => (
    <div className="text-center">
      <p className="text-gray-300 mb-6">Complete sus datos personales</p>
      
      <form onSubmit={onRegisterSubmit} className="space-y-4">
        {/* Nombre y Username en grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-left text-white text-sm font-medium">
              Nombre completo *
            </label>
            <input
              type="text"
              {...register("nombre", { 
                required: "Nombre es requerido",
                minLength: {
                  value: 2,
                  message: "Nombre debe tener al menos 2 caracteres"
                }
              })}
              placeholder="Ingrese su nombre completo"
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            {errors.nombre && (
              <p className="text-red-400 text-sm text-left">{errors.nombre.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-left text-white text-sm font-medium">
              Nombre de usuario *
            </label>
            <input
              type="text"
              {...register("username", { 
                required: "Username es requerido",
                minLength: {
                  value: 3,
                  message: "Username debe tener al menos 3 caracteres"
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Username solo puede contener letras, números y guiones bajos"
                }
              })}
              placeholder="Ingrese su username"
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            {errors.username && (
              <p className="text-red-400 text-sm text-left">{errors.username.message}</p>
            )}
          </div>
        </div>
        
        {/* Correo electrónico */}
        <div className="space-y-2">
          <label className="block text-left text-white text-sm font-medium">
            Correo electrónico *
          </label>
          <input
            type="email"
            {...register("correo", { 
              required: "Correo es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Correo inválido"
              }
            })}
            placeholder="ejemplo@correo.com"
            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          {errors.correo && (
            <p className="text-red-400 text-sm text-left">{errors.correo.message}</p>
          )}
        </div>
        
        {/* Contraseñas en grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-left text-white text-sm font-medium">
              Contraseña *
            </label>
            <input
              type="password"
              {...register("clave", { 
                required: "Contraseña es requerida",
                minLength: {
                  value: 6,
                  message: "Contraseña debe tener al menos 6 caracteres"
                }
              })}
              placeholder="Mínimo 6 caracteres"
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            {errors.clave && (
              <p className="text-red-400 text-sm text-left">{errors.clave.message}</p>
            )}
            {/* Indicador de fortaleza de contraseña */}
            {watch('clave') && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Fortaleza:</span>
                  <span className={`text-xs font-medium ${
                    getPasswordStrength(watch('clave')) >= 3 ? 'text-green-400' : 
                    getPasswordStrength(watch('clave')) >= 2 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {getPasswordStrengthText(watch('clave'))}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = getPasswordStrength(watch('clave'));
                    return (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded transition-all duration-300 ${
                          level <= strength 
                            ? strength >= 3 ? 'bg-green-500' : strength >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                            : 'bg-gray-600'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-gray-400 text-left">
                  <ul className="space-y-1">
                    <li className={watch('clave')?.length >= 6 ? 'text-green-400' : 'text-gray-500'}>
                      ✓ Mínimo 6 caracteres
                    </li>
                    <li className={watch('clave')?.length >= 8 ? 'text-green-400' : 'text-gray-500'}>
                      ✓ Mínimo 8 caracteres
                    </li>
                    <li className={/[a-z]/.test(watch('clave')) && /[A-Z]/.test(watch('clave')) ? 'text-green-400' : 'text-gray-500'}>
                      ✓ Mayúsculas y minúsculas
                    </li>
                    <li className={/[0-9]/.test(watch('clave')) ? 'text-green-400' : 'text-gray-500'}>
                      ✓ Incluir números
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="block text-left text-white text-sm font-medium">
              Confirmar contraseña *
            </label>
            <input
              type="password"
              {...register("confirmarClave", { 
                required: "Confirmar contraseña es requerida",
                validate: (value) => {
                  const clave = watch('clave');
                  return value === clave || "Las contraseñas no coinciden";
                }
              })}
              placeholder="Repita su contraseña"
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            {errors.confirmarClave && (
              <p className="text-red-400 text-sm text-left">{errors.confirmarClave.message}</p>
            )}
            {/* Indicador de coincidencia */}
            {watch('clave') && watch('confirmarClave') && (
              <div className={`mt-3 p-3 rounded-lg border transition-all duration-300 ${
                watch('clave') === watch('confirmarClave') 
                  ? 'bg-green-900 bg-opacity-30 border-green-500' 
                  : 'bg-red-900 bg-opacity-30 border-red-500'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg ${
                    watch('clave') === watch('confirmarClave') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {watch('clave') === watch('confirmarClave') ? '✓' : '✗'}
                  </span>
                  <span className={`text-sm font-medium ${
                    watch('clave') === watch('confirmarClave') ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {watch('clave') === watch('confirmarClave') 
                      ? 'Las contraseñas coinciden' 
                      : 'Las contraseñas no coinciden'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="flex-1 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover-lift border border-gray-500"
          >
            ← Atrás
          </button>
          <button
            type="submit"
            disabled={isLoading || !watch('clave') || !watch('confirmarClave') || watch('clave') !== watch('confirmarClave')}
            className={`flex-1 p-3 rounded-lg transition-all duration-200 hover-lift border ${
              isLoading || !watch('clave') || !watch('confirmarClave') || watch('clave') !== watch('confirmarClave')
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed border-gray-500'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-blue-500 shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <ColorRing
                  visible={true}
                  height="30"
                  width="30"
                  ariaLabel="color-ring-loading"
                  wrapperClass="color-ring-wrapper"
                  colors={["#E6F3FF", "#E0F2FE", "#DEEAF6", "#D4E6F1", "#C9E4EC"]}
                />
              </div>
            ) : (
              "Crear Cuenta →"
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center">
      <p className="text-gray-300 mb-6">
        Se ha enviado un código de verificación a:
      </p>
      <p className="text-blue-400 text-lg font-mono mb-6">
        {email ? email.replace(/(.{3}).*(@.*)/, '$1***$2') : ''}
      </p>
      <p className="text-gray-300 mb-6">
        Revise su bandeja de entrada y haga clic en "Continuar" cuando esté listo
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={goToPreviousStep}
          className="flex-1 p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition hover-lift"
        >
          Atrás
        </button>
        <button
          onClick={onEmailVerification}
          className="flex-1 p-3 bg-slate-600 text-white rounded-md hover:bg-blue-900 transition hover-lift"
        >
          Continuar
        </button>
      </div>
      
      <div className="mt-4">
        <button
          onClick={handleResendCode}
          disabled={resendTimer > 0 || isLoading}
          className={`text-blue-400 hover:text-blue-300 transition resend-button ${
            resendTimer > 0 ? "opacity-50 cursor-not-allowed" : "hover-lift"
          }`}
        >
          {resendTimer > 0 
            ? `Reenviar en ${formatTime(resendTimer)}`
            : "Reenviar código"
          }
        </button>
      </div>

      {/* Resultado del reenvío */}
      {resendResult && (
        <div className={`mt-6 p-4 rounded-lg border ${
          resendResult.type === 'error' 
            ? 'border-red-500 bg-red-900/50' 
            : 'border-green-500 bg-green-900/50'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {resendResult.type === 'error' ? (
                <div className="w-5 h-5 text-red-400">✗</div>
              ) : (
                <div className="w-5 h-5 text-green-400">✓</div>
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
                      <span className="text-xs text-gray-400 mr-1">⏰</span>
                      Expira: {new Date(resendResult.data.expiraEn).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center">
      <p className="text-gray-300 mb-6">
        Ingrese el código
      </p>
      
      <form onSubmit={onVerifyCodeSubmit}>
        <div className="mb-6">
          {/* Cajas para cada dígito */}
          <div className="flex justify-center gap-1 sm:gap-2 lg:gap-3 mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const currentValue = watch('verificationCode') || '';
              const digit = currentValue[index] || '';
              
              return (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-center text-sm sm:text-lg md:text-xl lg:text-2xl font-bold rounded-lg border-2 transition-all duration-200 ${
                    digit 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 hover:border-gray-500'
                  }`}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && /^\d$/.test(value)) {
                      // Actualizar el valor en el formulario
                      const newValue = currentValue.slice(0, index) + value + currentValue.slice(index + 1);
                      setValue('verificationCode', newValue);
                      
                      // Mover al siguiente input si no es el último
                      if (index < 5) {
                        // Usar setTimeout para asegurar que el DOM se actualice
                        setTimeout(() => {
                          const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                          const nextInput = inputs[index + 1];
                          if (nextInput) {
                            nextInput.focus();
                            nextInput.select();
                          }
                        }, 0);
                      }
                    } else {
                      // Si no es un número, limpiar el input
                      e.target.value = '';
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      if (e.target.value) {
                        // Si hay valor, limpiarlo
                        const newValue = currentValue.slice(0, index) + '' + currentValue.slice(index + 1);
                        setValue('verificationCode', newValue);
                        e.target.value = '';
                      } else if (index > 0) {
                        // Mover al input anterior en backspace
                        const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                        const prevInput = inputs[index - 1];
                        if (prevInput) {
                          prevInput.focus();
                          prevInput.select();
                        }
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6);
                    if (/^\d{6}$/.test(pastedData)) {
                      // Primero actualizar el formulario
                      setValue('verificationCode', pastedData);
                      
                      // Luego llenar todos los inputs visualmente
                      const inputs = e.target.parentElement.parentElement.querySelectorAll('input');
                      inputs.forEach((input, i) => {
                        input.value = pastedData[i] || '';
                      });
                      
                      // Enfocar el último input
                      setTimeout(() => {
                        inputs[pastedData.length - 1]?.focus();
                      }, 10);
                    }
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                />
              );
            })}
          </div>
          
          {/* Indicador de progreso */}
          <div className="text-center mb-4">
            <p className={`text-sm font-medium ${
              (watch('verificationCode')?.length || 0) === 6 
                ? 'text-green-400' 
                : 'text-gray-400'
            }`}>
            </p>
          </div>
          
          {errors.verificationCode && (
            <p className="text-red-400 text-sm mt-1">{errors.verificationCode.message}</p>
          )}
        </div>
        
        <div className="mt-4 mb-4">
          <button
            onClick={handleResendCode}
            disabled={resendTimer > 0 || isLoading}
            className={`text-blue-400 hover:text-blue-300 transition resend-button ${
              resendTimer > 0 ? "opacity-50 cursor-not-allowed" : "hover-lift"
            }`}
          >
            {resendTimer > 0 
              ? `Reenviar en ${formatTime(resendTimer)}`
              : "Reenviar código"
            }
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
                  <div className="w-5 h-5 text-red-400">✗</div>
                ) : (
                  <div className="w-5 h-5 text-green-400">✓</div>
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
                        <span className="text-xs text-gray-400 mr-1">⏰</span>
                        Expira: {new Date(resendResult.data.expiraEn).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="flex-1 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 hover-lift border border-gray-500"
          >
            ← Atrás
          </button>
          <button
            type="submit"
            disabled={isLoading || !watch('verificationCode') || watch('verificationCode')?.length !== 6}
            className={`flex-1 p-3 rounded-lg transition-all duration-200 hover-lift border ${
              isLoading || !watch('verificationCode') || watch('verificationCode')?.length !== 6
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed border-gray-500'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-blue-500 shadow-lg'
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <ColorRing
                  visible={true}
                  height="30"
                  width="30"
                  ariaLabel="color-ring-loading"
                  wrapperClass="color-ring-wrapper"
                  colors={["#E6F3FF", "#E0F2FE", "#DEEAF6", "#D4E6F1", "#C9E4EC"]}
                />
              </div>
            ) : (
              "Verificar código"
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Código de Acceso";
      case 2:
        return "Datos de Registro";
      case 3:
        return "Verificación de Correo";
      case 4:
        return "Código de Verificación";
      default:
        return "Registro";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-2 sm:px-4 py-4 sm:py-8">
      <div className="absolute inset-0">
        <img
          src={imagenLogo}
          alt="Fondo desenfocado"
          className="m-auto h-full object-cover opacity-70"
        />
      </div>

      <div
        className="flex w-full max-w-4xl lg:max-w-5xl rounded-xl sm:rounded-2xl overflow-hidden fill-transparent bg-gray-900 bg-opacity-30 shadow-2xl backdrop-blur-xl border border-gray-700"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
      >
        {/* Imagen lateral izquierda */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
          <img
            src={loginBackground}
            alt="Imagen de login"
            className="w-full h-full object-contain p-6 lg:p-8 relative z-10"
          />
        </div>

        {/* Formulario lado derecho */}
        <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 xl:p-8 flex flex-col justify-cente overflow-y-auto">
          {/* Indicador de pasos */}
          
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-500 shadow-lg ${
                    step < currentStep 
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white scale-110 shadow-green-500/50" 
                      : step === currentStep
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white scale-110 ring-2 sm:ring-4 ring-blue-300/50 animate-pulse-slow shadow-blue-500/50"
                      : "bg-gray-700 text-gray-300 border-2 border-gray-600"
                  }`}>
                    {step < currentStep ? "✓" : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-8 sm:w-12 lg:w-16 xl:w-16 h-1 mx-2 sm:mx-3 transition-all duration-700 ${
                      step < currentStep 
                        ? "bg-gradient-to-r from-green-500 to-blue-500" 
                        : "bg-gray-600"
                    }`}></div>
                )}
              </div>
            ))}
            </div>
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-gray-400 text-center text-xs sm:text-sm lg:text-base">
              Paso {currentStep} de 4
            </p>
            
            {/* Barra de progreso mejorada */}
            <div className="mt-4 sm:mt-6 w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-900 h-2 sm:h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          
          </div>

          {/* Contenido del paso actual */}
          <div className="animate-fadeIn step-transition">
            {renderCurrentStep()}
          </div>

          {/* Mensajes de error y éxito mejorados */}
          {error && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-900/50 border border-red-500 rounded-lg sm:rounded-xl animate-fadeIn shadow-lg">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-bold">!</span>
                </div>
                <p className="text-red-300 text-xs sm:text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Enlaces de navegación */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium">
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;

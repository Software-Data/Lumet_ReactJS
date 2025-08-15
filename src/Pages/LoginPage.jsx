
import {useForm} from "react-hook-form"
import { useAuth } from "../context/AuthContext";
import imagenLogo from '../assets/Logo.png'; 
import carousel1 from '../assets/carousel/carousel1.png';
import carousel2 from '../assets/carousel/carousel2.png';
import carousel3 from '../assets/carousel/carousel3.png';
import carousel4 from '../assets/carousel/carousel4.png';
import { useEffect } from "react";
import {useNavigate} from "react-router-dom"
import { ColorRing } from "react-loader-spinner";
import { useState } from "react";
import { Carousel } from "@material-tailwind/react";
 


function LoginPage() {
  const { register, handleSubmit } = useForm();
  const {login, isAuthenticated} = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [badAuth, setBadAuth] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate('/Dashboard')
  },[isAuthenticated])

  const onSubmit = handleSubmit(async(values) => {
    setIsLoading(true);
    try {
      const autenticacion = await login(values);
      if (autenticacion != null) {
        setBadAuth(true);
        setMensaje(autenticacion);
      }
    } finally {
      setIsLoading(false);
    }
  })

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


      <label className="text-gray-400 text-sm">Usuario</label>
      <input
        type="text"
        {...register("username", { required: true })}
        className="w-full p-3 bg-gray-700 text-white rounded-md my-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition"
        placeholder="Nombre de usuario o correo electrónico"
        autoComplete="username"
      />

      <label className="text-gray-400 text-sm">Contraseña</label>
      <input
        type="password"
        {...register("clave", { required: true })}
        className="w-full p-3 bg-gray-700 text-white rounded-md my-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition"
        placeholder="Ingresa tu contraseña"
        autoComplete="clave"
      />

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
          isLoading ? "p-[0.22em] opacity-90 cursor-not-allowed" : ""
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

      {badAuth && (
        <div className="mt-4">
          <p className="text-red-400 text-sm text-center">{mensaje}</p>
        </div>
      )}

      <div className="mt-4">
        <p className="text-gray-400 text-sm text-center">
          Al iniciar sesión, aceptas nuestros{" "}
          <a href="/Terminos" className="text-blue-500 hover:underline">
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
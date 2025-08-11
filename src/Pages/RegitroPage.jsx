import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import { usuariosService, rolesService } from "../api/api";

import imagenLogo from '../assets/Logo.png';
import loginBackground from '../assets/Logo.png';

function RegistroPage() {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cargar roles para el select
    const fetchRoles = async () => {
      try {
        const rolesRes = await rolesService.getAll();
        setRoles(rolesRes.data);
      } catch (err) {
        console.error("Error al cargar roles:", err);
        setError("Error al cargar los roles.");
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setError("");
    setMensaje("");

    try {
      await usuariosService.create(values);
      setMensaje("Usuario registrado con éxito.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      setError("Error al registrar usuario. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  });

  const fields = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Ingrese el nombre completo",
    },
    {
      name: "correo",
      label: "Correo",
      type: "email",
      required: true,
      placeholder: "Ingrese el correo electrónico",
    },
    {
      name: "username",
      label: "Nombre de usuario",
      type: "text",
      required: true,
      placeholder: "Ingrese el username",
    },
    {
      name: "clave",
      label: "Contraseña",
      type: "password",
      required: true,
      placeholder: "Ingrese la contraseña",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="absolute inset-0">
        <img
          src={imagenLogo}
          alt="Fondo desenfocado"
          className="m-auto h-full object-cover opacity-70"
        />
      </div>

      <div
        className="flex w-full max-w-4xl rounded-lg overflow-hidden fill-transparent bg-gray-900 bg-opacity-30 shadow-lg backdrop-blur-xl"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.04)" }}
      >
        {/* Imagen lateral izquierda */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={loginBackground}
            alt="Imagen de login"
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute inset-0 bg-gray-90"></div>
        </div>

        {/* Formulario lado derecho */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-white text-3xl font-semibold text-center mb-6">
            Crear cuenta
          </h2>

          <form onSubmit={onSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="mb-4">
                <label className="text-white text-sm">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    {...register(field.name, { required: field.required })}
                    className="w-full p-3 bg-gray-700 text-white rounded-md my-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition"
                  >
                    <option value="">Seleccione un rol</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      {...register(field.name)}
                      className="mr-2"
                      defaultChecked
                    />
                    <span className="text-white text-sm">
                      {field.checkboxLabel}
                    </span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    {...register(field.name, { required: field.required })}
                    placeholder={field.placeholder}
                    className="w-full p-3 bg-gray-700 text-white rounded-md my-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition"
                  />
                )}
              </div>
            ))}

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
                "Registrarse"
              )}
            </button>

            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
            {mensaje && <p className="text-green-400 text-sm text-center mt-4">{mensaje}</p>}

            <div className="mt-4">
              <p className="text-gray-400 text-sm text-center">
                Al crear cuenta, aceptas nuestros{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Términos y condiciones
                </a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistroPage;

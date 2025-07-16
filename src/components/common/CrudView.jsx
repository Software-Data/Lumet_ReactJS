import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { imagesService } from '../../api/api';
import { imagenResultado } from '../../api/api';
import { ArrowLeft, Pencil } from "lucide-react";
import Layout from "../layout/layout";

// Componente para mostrar un campo individual
const ViewField = ({ label, children, fullWidth = false }) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <p className="text-sm font-bold text-gray-400 mb-1">{label}</p>
    <div className="text-gray-50 bg-gray-900/50 p-3 rounded-md min-h-[44px] flex items-center">
      {children}
    </div>
  </div>
);

function CrudView({ title, data, fields, basePath }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID de la URL para el botón de editar
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Efecto para cargar la imagen asociada si existe
  useEffect(() => {
    const loadImages = async () => {
      if (data && data.id_imagen) {
        setLoadingImage(true);
        setImageError(null);
        try {
          const res = await imagesService.getById(data.id_imagen);
          setImageUrl(res.data.imagenBase64);
        } catch (error) {
          console.error("Error al cargar la imagen:", error);
          setImageError("No se pudo cargar la imagen.");
        } finally {
          setLoadingImage(false);
        }
      }
      if (data && data.id_imagen_procesada) {
        setLoadingImage(true);
        setImageError(null);
        try {
          const res = await imagenResultado.getImage(data.id_imagen_procesada);
          setImageUrl(res.data.imagenBase64);
        } catch (error) {
          console.error("Error al cargar la imagen:", error);
          setImageError("No se pudo cargar la imagen.");
        } finally {
          setLoadingImage(false);
        }
      }
    };

    loadImages();
  }, [data]);

  // Si no hay datos, muestra un mensaje de carga o error
  if (!data) {
    return (
      <Layout>
        <p className="text-white text-center">Cargando datos...</p>
      </Layout>
    );
  }

  // Función para obtener la etiqueta de una opción de un select
  const getSelectLabel = (fieldName, value) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field || !field.options) return value;
    const option = field.options.find(o => String(o.value) === String(value));
    return option ? option.label : value;
  };
  
  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6 sticky top-[0] bg-gray-800 z-[50] border-b-2 border-b-emerald-800 h-20 px-6">
          <h1 className="text-2xl font-bold text-gray-50">{`Detalles de ${title}`}</h1>
          <button
            onClick={() => navigate(`/${basePath}`)}
            className="flex items-center text-gray-50 hover:text-red-500 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 mr-1 mt-1" />
            Volver
          </button>
        </div>

        <div className="bg-black border-gray-50 border rounded-lg shadow p-6 mx-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => {
              // No renderizar campos de tipo 'hidden'
              if (field.type === 'hidden') {
                return null;
              }
              
              const value = data[field.name];

              // Renderizado especial para el campo de la cámara/imagen
              if (field.type === 'camera') {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <p className="text-sm font-bold text-gray-400 mb-1">{field.label}</p>
                    <div className="bg-gray-900/50 p-4 rounded-md flex justify-center items-center min-h-[200px]">
                      {loadingImage && <p className="text-gray-300">Cargando imagen...</p>}
                      {imageError && <p className="text-red-400">{imageError}</p>}
                      {imageUrl && !loadingImage && (
                        <img src={imageUrl} alt={field.label} className="max-w-md w-full h-auto rounded-lg shadow-lg" />
                      )}
                      {!imageUrl && !loadingImage && !imageError && (
                         <p className="text-gray-500">No hay imagen disponible.</p>
                      )}
                    </div>
                  </div>
                );
              }

              if (field.type === 'imperfeccion') {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <p className="text-sm font-bold text-gray-400 mb-1">{field.label}</p>
                    <div className="bg-gray-900/50 p-4 rounded-md flex justify-center items-center min-h-[200px]">
                      {loadingImage && <p className="text-gray-300">Cargando imagen...</p>}
                      {imageError && <p className="text-red-400">{imageError}</p>}
                      {imageUrl && !loadingImage && (
                        <img src={imageUrl} alt={field.label} className="max-w-md w-full h-auto rounded-lg shadow-lg" />
                      )}
                      {!imageUrl && !loadingImage && !imageError && (
                         <p className="text-gray-500">No hay imagen disponible. {data.id_imagen_procesada}</p>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <ViewField key={field.name} label={field.label} fullWidth={field.fullWidth}>
                  {(() => {
                    // Si el valor es nulo o indefinido, muestra un guion
                    if (value === null || typeof value === 'undefined' || value === '') {
                      return <span className="text-gray-500">-</span>;
                    }

                    // Renderizado según el tipo de campo
                    switch (field.type) {
                      case 'select':
                        return getSelectLabel(field.name, value);
                      case 'checkbox':
                        return value ? 'Sí' : 'No';
                      case 'colores':
                        return (
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded border border-gray-400"
                              style={{ backgroundColor: value }}
                            ></div>
                            <span>{value}</span>
                          </div>
                        );
                      case 'textarea':
                        return <p className="whitespace-pre-wrap">{value}</p>;
                      default:
                        return String(value);
                    }
                  })()}
                </ViewField>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(`/${basePath}`)}
              className="px-6 py-2 border w-[200px] bg-gray-700 border-gray-600 rounded-md text-sm font-medium text-gray-100 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${basePath}/editar/${id}`)}
              className="px-6 py-2 flex justify-center items-center w-[200px] border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CrudView;
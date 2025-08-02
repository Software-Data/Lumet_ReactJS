import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { imagesService, imagenResultado } from '../../api/api';
import { ArrowLeft, Pencil } from "lucide-react";
import Layout from "../layout/layout";

const ViewField = ({ label, children, fullWidth = false }) => (
  <div className={fullWidth ? "md:col-span-2" : ""}>
    <p className="text-sm font-bold text-gray-400 mb-1">{label}</p>
    <div className="text-gray-50 bg-gray-900/50 p-3 rounded-md min-h-[44px] flex items-center">
      {children}
    </div>
  </div>
);

const ImagenView = ({ label, url, loading, error }) => (
  <div className="md:col-span-1">
    <p className="text-sm font-bold text-gray-400 mb-1">{label}</p>
    <div className="bg-gray-900/50 p-4 rounded-md flex justify-center items-center min-h-[200px]">
      {loading && <p className="text-gray-300">Cargando imagen...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {url && !loading && (
        <img src={url} alt={label} className="max-w-md w-full h-auto rounded-lg shadow-lg" />
      )}
      {!url && !loading && !error && (
        <p className="text-gray-500">No hay imagen disponible.</p>
      )}
    </div>
  </div>
);

function CrudView({ title, data, fields, basePath }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [imagenOriginalUrl, setImagenOriginalUrl] = useState(null);
  const [imagenProcesadaUrl, setImagenProcesadaUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    const loadImages = async () => {
      setLoadingImage(true);
      setImageError(null);
      try {
        if (data?.id_imagen) {
          const res = await imagesService.getById(data.id_imagen);
          setImagenOriginalUrl(res.data.imagenBase64);
        }
        if (data?.id_imagen_procesada) {
          const res = await imagenResultado.getImage(data.id_imagen_procesada);
          setImagenProcesadaUrl(res.data.imagenBase64);
        }
      } catch (error) {
        console.error("Error al cargar imágenes:", error);
        setImageError("No se pudo cargar la imagen.");
      } finally {
        setLoadingImage(false);
      }
    };

    loadImages();
  }, [data]);

  if (!data) {
    return (
      <Layout>
        <p className="text-white text-center">Cargando datos...</p>
      </Layout>
    );
  }

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
              if (field.type === 'hidden') return null;

              const value = data[field.name];

              // Imagen original
              if (field.type === 'camera' && field.name === 'id_imagen') {
                return (
                  <ImagenView
                    key={field.name}
                    label="Imagen Original"
                    url={imagenOriginalUrl}
                    loading={loadingImage}
                    error={imageError}
                  />
                );
              }

              // Imagen procesada
              if (field.type === 'imperfeccion' && field.name === 'id_imagen_procesada') {
                return (
                  <ImagenView
                    key={field.name}
                    label="Imagen Procesada"
                    url={imagenProcesadaUrl}
                    loading={loadingImage}
                    error={imageError}
                  />
                );
              }

              return (
                <ViewField key={field.name} label={field.label} fullWidth={field.fullWidth}>
                  {(() => {
                    if (value === null || typeof value === 'undefined' || value === '') {
                      return <span className="text-gray-500">-</span>;
                    }

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

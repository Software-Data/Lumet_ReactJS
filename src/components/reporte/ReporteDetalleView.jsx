import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { 
  reportesService, 
  prioridadesService, 
  imperfeccionesService, 
  carroceriasService, 
  usuariosService,
  severidadesService,
  imagesService,
  imagenResultado
} from "../../api/api";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  User, 
  Car, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import Layout from "../layout/layout";
import { generateReportePDF } from "../../services/pdfService";
import ImperfeccionesVisualizador from "./ImperfeccionesVisualizador";

function ReporteDetalleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [carroceria, setCarroceria] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [prioridad, setPrioridad] = useState(null);
  const [severidad, setSeveridad] = useState(null);
  const [imperfeccionDetalle, setImperfeccionDetalle] = useState(null);
  const [imagenAnalizada, setImagenAnalizada] = useState(null);
  const [imagenOriginal, setImagenOriginal] = useState(null);
  const [imagenProcesada, setImagenProcesada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReporte = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log('=== INICIANDO CARGA DEL REPORTE ===');
        console.log('ID del reporte a cargar:', id);
        
        // 1. Cargar el reporte principal
        const reporteRes = await reportesService.getById(id);
        console.log('Respuesta del reporte:', reporteRes);
        
        const reporteData = reporteRes.data;
        console.log('Datos del reporte:', reporteData);
        
        // Verificar que tenemos los datos del reporte
        if (!reporteData) {
          throw new Error('No se recibieron datos del reporte');
        }
        
        // La API retorna una estructura anidada, extraer los datos correctos
        const reporte = reporteData.reporte || reporteData;
        const imagenAnalizada = reporteData.imagen_analizada;
        
        console.log('Reporte extraído:', reporte);
        console.log('Imagen analizada:', imagenAnalizada);
        
        setReporte(reporte);
        setImagenAnalizada(imagenAnalizada);
        
        // 2. Extraer los IDs necesarios del reporte
        const idCarroceria = reporte.id_carrocerias;
        const idUsuario = reporte.id_usuario;
        const idImperfeccion = reporte.id_imperfecciones;
        
        console.log('IDs extraídos del reporte:', {
          idCarroceria,
          idUsuario,
          idImperfeccion
        });
        
        // 3. Cargar carrocería si existe ID
        if (idCarroceria) {
          console.log('Cargando carrocería con ID:', idCarroceria);
          try {
            const carroceriaRes = await carroceriasService.getById(idCarroceria);
            console.log('Respuesta de carrocería:', carroceriaRes);
            setCarroceria(carroceriaRes.data);
          } catch (carroceriaErr) {
            console.error('Error cargando carrocería:', carroceriaErr);
            setCarroceria(null);
          }
        } else {
          console.log('No hay ID de carrocería en el reporte');
        }
        
        // 4. Cargar usuario si existe ID
        if (idUsuario) {
          console.log('Cargando usuario con ID:', idUsuario);
          try {
            const usuarioRes = await usuariosService.getById(idUsuario);
            console.log('Respuesta de usuario:', usuarioRes);
            setUsuario(usuarioRes.data);
          } catch (usuarioErr) {
            console.error('Error cargando usuario:', usuarioErr);
            setUsuario(null);
          }
        } else {
          console.log('No hay ID de usuario en el reporte');
        }
        
        // 5. Cargar imperfección si existe ID
        if (idImperfeccion) {
          console.log('Cargando imperfección con ID:', idImperfeccion);
          try {
            const imperfeccionRes = await imperfeccionesService.getById(idImperfeccion);
            console.log('Respuesta de imperfección:', imperfeccionRes);
            setImperfeccionDetalle(imperfeccionRes.data);
            
            // 6. Cargar prioridad y severidad de la imperfección
            if (imperfeccionRes.data.id_prioridad) {
              console.log('Cargando prioridad con ID:', imperfeccionRes.data.id_prioridad);
              const prioridadRes = await prioridadesService.getById(imperfeccionRes.data.id_prioridad);
              setPrioridad(prioridadRes.data);
            }
            
            if (imperfeccionRes.data.id_severidad) {
              console.log('Cargando severidad con ID:', imperfeccionRes.data.id_severidad);
              const severidadRes = await severidadesService.getById(imperfeccionRes.data.id_severidad);
              setSeveridad(severidadRes.data);
            }
          } catch (imperfeccionErr) {
            console.error('Error cargando imperfección:', imperfeccionErr);
            setImperfeccionDetalle(null);
          }
        } else {
          console.log('No hay ID de imperfección en el reporte');
        }
        
        // 7. Cargar prioridad del reporte si existe (puede venir directamente del reporte)
        if (reporte.id_prioridad) {
          console.log('Cargando prioridad del reporte con ID:', reporte.id_prioridad);
          try {
            const prioridadRes = await prioridadesService.getById(reporte.id_prioridad);
            setPrioridad(prioridadRes.data);
          } catch (prioridadErr) {
            console.error('Error cargando prioridad del reporte:', prioridadErr);
          }
        }
        
        console.log('=== FINALIZADA CARGA DE DATOS RELACIONADOS ===');
        
      } catch (err) {
        console.error("Error al cargar el reporte:", err);
        setError("No se pudieron cargar los detalles del reporte.");
      } finally {
        setLoading(false);
      }
    };

    fetchReporte();
  }, [id]);

  // Cargar imágenes después de que se hayan cargado los datos relacionados
  useEffect(() => {
    const loadImages = async () => {
      // La imagen original viene de la carrocería
      if (carroceria?.id_imagen) {
        console.log('Cargando imagen original de carrocería con ID:', carroceria.id_imagen);
        try {
          const imagenRes = await imagesService.getById(carroceria.id_imagen);
          setImagenOriginal(imagenRes.data.imagenBase64);
        } catch (imgErr) {
          console.log('No se pudo cargar imagen original:', imgErr);
          setImagenOriginal(null);
        }
      }

      // La imagen procesada viene de la imagen_analizada del reporte
      if (imagenAnalizada?._id) {
        console.log('Cargando imagen procesada de imagen_analizada con ID:', imagenAnalizada._id);
        try {
          const imagenProcRes = await imagenResultado.getImage(imagenAnalizada._id);
          setImagenProcesada(imagenProcRes.data.imagenBase64);
        } catch (imgErr) {
          console.log('No se pudo cargar imagen procesada:', imgErr);
          setImagenProcesada(null);
        }
      }
    };

    if (carroceria || imagenAnalizada) {
      loadImages();
    }
  }, [carroceria, imagenAnalizada]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pendiente':
        return <Clock className="h-5 w-5 text-red-500" />;
      case 'procesando':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendiente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'procesando':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    try {
      await generateReportePDF(reporte, carroceria, usuario, prioridad, severidad, imagenAnalizada);
    } catch (error) {
      alert('Error al generar el PDF: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !reporte) {
    return (
      <Layout>
        <div className="text-center text-red-500 py-8">
          <p>{error || "No se pudo cargar el reporte"}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 sticky top-0 z-10 header-shown-false  shadow-sm border-b-2 border-emerald-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-[2px]">
            <div className="flex justify-between items-center py-5">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/reportes')}
                  className="flex items-center text-gray-100 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Volver a Reportes
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-2xl font-bold text-white">Reporte #{reporte.id}</h1>
              </div>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Status Badge */}
          <div className="mb-6 sm:mb-8">
            <div className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full border ${getStatusColor(reporte.status)}`}>
              {getStatusIcon(reporte.status)}
              <span className="ml-2 text-sm sm:text-base font-medium capitalize">{reporte.status || 'Sin estado'}</span>
            </div>
          </div>

          {/* Layout Responsive */}
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Información Principal - Ocupa 2 columnas en desktop, 1 en móvil */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Descripción */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mr-2 sm:mr-3" />
                  <h2 className="text-base sm:text-lg font-semibold text-white">Descripción</h2>
                </div>
                <p className="text-white leading-relaxed text-sm sm:text-base">
                  {reporte.descripcion || 'Sin descripción disponible'}
                </p>
              </div>

              {/* Detalles de la Carrocería */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Car className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3" />
                  <h2 className="text-base sm:text-lg font-semibold text-white">Información de la Carrocería</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Folio</label>
                    <p className="text-white font-medium text-sm sm:text-base">{carroceria?.folio || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Número de Parte</label>
                    <p className="text-white text-sm sm:text-base">{carroceria?.no_parte || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Panel</label>
                    <p className="text-white text-sm sm:text-base">{carroceria?.panel || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Lote</label>
                    <p className="text-white text-sm sm:text-base">{carroceria?.lote || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Descripción</label>
                    <p className="text-white text-sm sm:text-base">{carroceria?.descripcion || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Imágenes - Ocupan todo el ancho disponible */}
              <div className="space-y-4 sm:space-y-6">
                {/* Imagen Original */}
                <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Imagen Original</h3>
                  <div className="bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {imagenOriginal ? (
                      <img 
                        src={imagenOriginal} 
                        alt="Imagen Original" 
                        className="w-full h-auto max-h-64 sm:max-h-96 object-contain"
                      />
                    ) : (
                      <div className="text-gray-400 text-center py-8 sm:py-12">
                        <p className="text-sm sm:text-base">No disponible</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visualizador de Imperfecciones */}
                {imagenProcesada && imagenAnalizada?.imperfecciones && (
                  <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Análisis de Imperfecciones</h3>
                    <div className="w-full">
                      <ImperfeccionesVisualizador
                        imagenUrl={imagenProcesada}
                        imperfecciones={imagenAnalizada.imperfecciones}
                        colorDominante={imagenAnalizada.color_dominante}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Se apila en móvil, se mantiene a la derecha en desktop */}
            <div className="space-y-4 sm:space-y-6">
              {/* Información del Reporte */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Información del Reporte</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <label className="block text-xs font-medium text-gray-500">Fecha de Creación</label>
                      <p className="text-sm text-white truncate">{formatDate(reporte.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <label className="block text-xs font-medium text-gray-500">Usuario</label>
                      <p className="text-sm text-white truncate">{usuario?.nombre || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prioridad y Severidad */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Clasificación</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
                    <p className="text-sm text-white">{prioridad?.nombre || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Severidad</label>
                    <p className="text-sm text-white">{severidad?.nombre || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Botón de Descarga - Siempre visible */}
              <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <button
                  onClick={handleDownloadPDF}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ReporteDetalleView;

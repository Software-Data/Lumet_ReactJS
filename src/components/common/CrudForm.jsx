import { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { imagesService, carroceriasService } from '../../api/api';
import { Save, ArrowLeft, X, RefreshCcw, FileText } from "lucide-react"
import { ColorPicker } from 'primereact/colorpicker';
import Layout from "../layout/layout";
import { AuthContext } from '../../context/AuthContext';
const API_URL = import.meta.env.VITE_API_URL;


function CrudForm({ title, initialData, fields, onSubmit, loading, error, basePath, isEditing, tieneReporte, onRegenerarReporte }) {
  const [formData, setFormData] = useState(initialData || {})
  const [colorHEX, setColorHEX] = useState("FFFFFF");
  const [currentCameraField, setCurrentCameraField] = useState(null);
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [imagenPrevisualizacion, setImagenPrevisualizacion] = useState(null);
  const videoRef = useRef(null);
  const [folio, setFolio] = useState("");
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);


  const consultarImagen = async (id) => {
    const imagenRes = await imagesService.getById(id);
    return imagenRes.data.imagenBase64;
  }


  useEffect(() => {
    setFormData(initialData || {})
  }, [initialData])
  useEffect(() => {
    const obtenerFolio = async () => {
          const folioReq = await carroceriasService.getFolio();
          setFolio(folioReq.data.folio);
    }

    const cargarImagenExistente = async () => {
      if (isEditing && formData.id_imagen) {
        try {
          const base64Data = await consultarImagen(formData.id_imagen);
          setImagenPrevisualizacion(`${base64Data}`);
        } catch (error) {
          console.error("Error al cargar la imagen para previsualización:", error);
          setImagenPrevisualizacion(null);
        }
      } else {
        setImagenPrevisualizacion(null);
      }
    };

    cargarImagenExistente();
    obtenerFolio();
  }, [formData.id_imagen, isEditing]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    stopCamera();
    startCamera();
  };

  const takePhoto = () => {
    if (!currentCameraField) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");

    // Convertir base64 a File
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(bstr.length);
    while (n--) u8arr[n] = bstr.charCodeAt(n);

    const file = new File([u8arr], `${currentCameraField}.png`, { type: mime });

    // Guardar como File
    setImagenPrevisualizacion(dataUrl)
    setFormData((prev) => ({ ...prev, [currentCameraField]: file }));
    stopCamera();
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && currentCameraField) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPrevisualizacion(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, [currentCameraField]: file }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasFile = Object.values(formData).some((val) => val instanceof File);
    let dataToSend;

    if (hasFile) {
      dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return;
        }

        if (value instanceof File) {
          dataToSend.append(key, value);
        } else if (typeof value === 'boolean') {
          dataToSend.append(key, value ? 'true' : 'false');
        } else {
          dataToSend.append(key, value);
        }
      });
    } else {
      dataToSend = { ...formData };
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key];
        }
      });
    }

    const success = await onSubmit(dataToSend);

    if (success) {
      navigate(`/${basePath}`);
    }
  };

  const handleGenerarReporte = async () => {
    console.log('Generando reporte...', { isEditing, formDataId: formData.id, tieneReporte });
    
    if (!isEditing || !formData.id) {
      console.log('No se puede generar reporte:', { isEditing, formDataId: formData.id });
      alert('No se puede generar reporte en este momento');
      return;
    }

    setIsGeneratingReport(true);

    try {
      console.log('Enviando petición a:', `${API_URL}/carrocerias/${formData.id}/generar-reporte`);
      
      const response = await fetch(`${API_URL}/carrocerias/${formData.id}/generar-reporte`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: user.id,
          descripcion: "Reporte generado manualmente desde el formulario"
        })
      });

      console.log('Respuesta del servidor:', response.status);

      if (response.ok) {
        alert('✅ Reporte generado exitosamente');
        // Recargar la página para mostrar el nuevo estado
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`❌ Error al generar reporte: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('❌ Error al generar reporte. Intente nuevamente.');
    } finally {
      setIsGeneratingReport(false);
    }
  };
  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6  bg-gray-800 z-[50] border-b-2 border-b-emerald-800 h-20 px-6">
          <h1 className="text-2xl font-bold text-gray-50">{isEditing ? `Editar ${title}` : `Nuevo ${title}`}</h1>
          <button
            onClick={() => navigate(`/${basePath}`)}
            className="flex items-center text-gray-50 hover:text-red-500 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 mr-1 mt-1 text-white hover:text-red-500 cursor-pointer" />
            Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-black border-gray-50 border rounded-lg shadow p-6 mx-6 mb-6">
          <form onSubmit={handleSubmit} encType='multipart/form-data'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-50 mb-1">{field.label}</label>

                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      required={field.required}
                      disabled={field.disabled}
                      className="w-full px-3 py-2 border border-gray-300 bg-gray-900 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">{field.placeholder || `Seleccionar ${field.label}`}</option>
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      required={field.required}
                      disabled={field.disabled}
                      rows={field.rows || 3}
                      placeholder={field.placeholder || ""}
                      className="w-full px-3 py-2 border bg-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    ></textarea>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name={field.name}
                        checked={formData[field.name] || false}
                        value={(formData[field.name]) ? true : false}
                        onChange={handleChange}
                        disabled={field.disabled}
                        className="h-4 w-4 text-emerald-600 bg-gray-900 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">{field.checkboxLabel}</span>
                    </div>
                  ) : field.type === "colores" ? (
                    <div className="flex items-center justify-between gap-2 w-full">
                      {/* Input de tipo color como fondo */}
                      <div className="w-full relative">
                        <input
                          type="color"
                          value={formData[field.name] || "#FFFFFF"}
                          name={field.name}
                          onChange={(e) => {
                            const hex = e.target.value;
                            setColorHEX(hex.substring(1));
                            handleChange({
                              target: {
                                name: field.name,
                                value: hex,
                                type: "text"
                              }
                            });
                          }}
                          className="w-full px-[2px] py-[1px] h-[2.6em] bg-gray-900 border bg-transparent rounded-md cursor-pointer focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>

                      {/* Input de texto que muestra el valor HEX */}
                      <input
                        type="text"
                        value={formData[field.name] || "#FFFFFF"}
                        name={field.name}
                        required={field.required}
                        onChange={(e) => {
                          const hex = e.target.value.startsWith("#") ? e.target.value : "#" + e.target.value;
                          setColorHEX(hex.substring(1));
                          handleChange({
                            target: {
                              name: field.name,
                              value: hex,
                              type: "text"
                            }
                          });
                        }}
                        className="w-[50%] px-3 py-2 border bg-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  ) : field.type === "camera" ? (
                    <div
                      key={field.name}
                      className="col-span-2"
                      onMouseEnter={() => setCurrentCameraField(field.name)}
                    >
                      <div className="flex flex-col items-center gap-4 p-4 bg-gray-900 rounded-md border border-gray-300">
                        {!formData[field.name] && (
                          <>
                            <div className="relative w-full max-w-md">
                              <video ref={videoRef} autoPlay playsInline className="w-full border rounded-lg shadow-lg" />
                              {isCameraOn && (
                                <button
                                  onClick={stopCamera}
                                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg"
                                >
                                  <X size={24} />
                                </button>
                              )}
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
           
                            <div className="flex gap-2 flex-wrap justify-center">
                              {!isCameraOn && !formData[field.name] && (
                                <>
                                  <button
                                    type="button"
                                    onClick={startCamera}
                                    className="flex flex-col items-center justify-center bg-gray-800 px-4 py-2 hover:bg-gray-700 border-2 border-dashed border-gray-400 rounded-lg transition-all duration-300 ease-in-out"
                                  >
                                    <span className="text-sm text-white mt-1">Abrir Cámara</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 ease-in-out"
                                  >
                                    Subir Imagen
                                  </button>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    className="hidden"
                                    />
                                </>
                              )}

                              {isCameraOn && (
                                <>
                                  <button
                                    type="button"
                                    onClick={takePhoto}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 ease-in-out"
                                    >
                                    Tomar Foto
                                  </button>
                                  <button
                                    type="button"
                                    onClick={switchCamera}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
                                    >
                                    <RefreshCcw size={20} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={stopCamera}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out"
                                    >
                                    Cancelar
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                        <div className="flex flex-col items-center gap-2">
                          {imagenPrevisualizacion && (
                            <div className="flex flex-col">
                              <img src={imagenPrevisualizacion} alt="Previsualización" className="w-full max-w-md border rounded-lg shadow-lg" />
                              <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, [field.name]: null }))}
                                className=" my-2 py-2 bg-red-600 text-white rounded-lg"
                                >
                                Eliminar Imagen
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : field.type === "hidden" ? (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={field.readOnly && !isEditing ? folio : (formData[field.name] || "")}
                      onChange={handleChange}
                      required={field.required}
                      disabled={field.disabled}
                      placeholder={field.placeholder || ""}
                      className=""
                    />

                  ) : (
                    <input
                      type={field.type || "text"}
                      readOnly={field.readOnly}
                      name={field.name}
                      value={(!isEditing) ? (field.readOnly) ? folio : formData[field.name] : (formData[field.name] || "")}
                      onChange={handleChange}
                      required={field.required}
                      disabled={field.disabled}
                      placeholder={field.placeholder || ""}
                      className="w-full px-3 py-2 border bg-gray-900 border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  )}

                  {field.helpText && <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate(`/${basePath}`)}
                className="mr-3 px-4 py-2 border w-[200px] bg-red-900 border-red-900 rounded-md text-sm font-medium text-gray-100 hover:text-red-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border w-[200px] flex justify-center text-center border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </button>
              {isEditing && !tieneReporte && (
                <button
                  type="button"
                  onClick={handleGenerarReporte}
                  disabled={loading || isGeneratingReport}
                  className="px-4 py-2 border w-[200px] flex justify-center text-center border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center disabled:bg-orange-400 disabled:cursor-not-allowed"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? "Generando..." : "Generar Reporte"}
                </button>
              )}
              {isEditing && onRegenerarReporte && (
                <button
                  type="button"
                  onClick={onRegenerarReporte}
                  disabled={loading}
                  className="px-4 py-2 border w-[200px] flex justify-center text-center border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center disabled:bg-purple-400 disabled:cursor-not-allowed"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerar Reporte
                </button>
              )}
              {/* Debug info */}
              {isEditing && (
                <div className="text-xs text-gray-400 mt-2">
                  Debug: isEditing={isEditing.toString()}, tieneReporte={tieneReporte?.toString() || 'undefined'}, formDataId={formData.id}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default CrudForm

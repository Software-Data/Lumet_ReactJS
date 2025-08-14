import { useState, useRef, useEffect } from 'react';
import { MapPin, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

const ImperfeccionesVisualizador = ({ imagenUrl, imperfecciones, colorDominante }) => {
  const [mostrarImperfecciones, setMostrarImperfecciones] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (imagenUrl && imperfecciones && canvasRef.current) {
      drawImperfecciones();
    }
  }, [imagenUrl, imperfecciones, zoom, mostrarImperfecciones]);

  // Redibujar cuando cambie el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (imagenUrl && imperfecciones && canvasRef.current) {
        drawImperfecciones();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagenUrl, imperfecciones]);

  const drawImperfecciones = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Obtener el ancho del contenedor
      const containerWidth = containerRef.current?.clientWidth || 800;
      
      // Calcular dimensiones del canvas manteniendo proporción
      const aspectRatio = img.height / img.width;
      const canvasWidth = containerWidth - 32; // Restar padding
      const canvasHeight = canvasWidth * aspectRatio;
      
      // Configurar canvas con zoom
      canvas.width = canvasWidth * zoom;
      canvas.height = canvasHeight * zoom;
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar imagen escalada
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      if (mostrarImperfecciones && imperfecciones) {
        // Calcular factor de escala para las coordenadas
        const scaleX = canvasWidth / img.width;
        const scaleY = canvasHeight / img.height;
        
        // Dibujar imperfecciones
        imperfecciones.forEach((imperfeccion, index) => {
          const x = imperfeccion.x * scaleX * zoom;
          const y = imperfeccion.y * scaleY * zoom;
          
          // Círculo de fondo
          ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(x, y, 8 * zoom, 0, 2 * Math.PI);
          ctx.fill();
          
          // Borde del círculo
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2 * zoom;
          ctx.stroke();
          
          // Número de imperfección
          ctx.fillStyle = '#ffffff';
          ctx.font = `${12 * zoom}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((index + 1).toString(), x, y);
        });
      }
    };

    img.src = imagenUrl;
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  if (!imagenUrl) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <p className="text-gray-400">No hay imagen disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarImperfecciones(!mostrarImperfecciones)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              mostrarImperfecciones 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {mostrarImperfecciones ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {mostrarImperfecciones ? 'Ocultar' : 'Mostrar'} Imperfecciones
          </button>
          
          <span className="text-sm text-gray-300">
            {imperfecciones?.length || 0} imperfecciones detectadas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Zoom out"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-300 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Zoom in"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={resetZoom}
            className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Reset
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Visualizador de imagen con imperfecciones */}
      <div 
        ref={containerRef}
        className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden w-full"
      >
        <div className="relative overflow-auto max-h-[600px] w-full">
          <canvas
            ref={canvasRef}
            className="block mx-auto cursor-crosshair"
            style={{ 
              maxWidth: '100%',
              height: 'auto',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              borderRadius: '8px'
            }}
          />
        </div>
      </div>

      {/* Lista detallada de imperfecciones */}
      {imperfecciones && imperfecciones.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 w-full">
          <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-400" />
            Detalle de Imperfecciones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto w-full">
            {imperfecciones.map((imperfeccion, index) => (
              <div
                key={imperfeccion._id || index}
                className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-red-400 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-400">ID: {imperfeccion._id?.slice(-6) || index}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">X:</span>
                    <span className="font-mono font-medium text-gray-100">{imperfeccion.x}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Y:</span>
                    <span className="font-mono font-medium text-gray-100">{imperfeccion.y}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del análisis */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 w-full">
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Información del Análisis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Total de imperfecciones:</span>
              <span className="font-semibold text-gray-100">{imperfecciones?.length || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Densidad:</span>
              <span className="font-semibold text-gray-100">
                {imperfecciones?.length > 20 ? 'Alta' : imperfecciones?.length > 10 ? 'Media' : 'Baja'}
              </span>
            </div>
          </div>
          
          {colorDominante && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Color dominante:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-500"
                    style={{ backgroundColor: colorDominante }}
                  ></div>
                  <span className="font-mono text-sm font-medium text-gray-100">{colorDominante}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImperfeccionesVisualizador;

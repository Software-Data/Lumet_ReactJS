import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import {
  reportesService,
  prioridadesService,
  imperfeccionesService,
  carroceriasService,
  usuariosService,
} from "../../api/api";
import CrudView from "../common/CrudView";
import Layout from "../layout/layout";

function ReporteView() {
  const { id } = useParams();
  const [reporteData, setReporteData] = useState(null);
  const [prioridades, setPrioridades] = useState([]);
  const [imperfeccionDetalle, setImperfeccionDetalle] = useState(null);
  const [carrocerias, setCarrocerias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [reporteRes, prioridadesRes, usuariosRes, carroceriasRes] = await Promise.all([
          reportesService.getById(id),
          prioridadesService.getAll(),
          usuariosService.getAll(),
          carroceriasService.getAll(),
        ]);

        const reporte = reporteRes.data;
        setReporteData(reporte);
        setPrioridades(prioridadesRes.data);
        setUsuarios(usuariosRes.data);
        setCarrocerias(carroceriasRes.data);

        // Intentar obtener imperfección asociada
        try {
          const imperfeccionRes = await imperfeccionesService.getById(reporte.id_imperfecciones);
          setImperfeccionDetalle(imperfeccionRes.data);
        } catch (innerErr) {
          setImperfeccionDetalle(null); // No existe imperfección
        }

      } catch (err) {
        console.error("Error al cargar los datos del reporte:", err);
        setError("No se pudieron cargar los detalles. Intente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getNombrePrioridad = (id_prioridad) => {
    const prioridad = prioridades.find((p) => p.id === id_prioridad);
    return prioridad ? prioridad.nombre : "N/A";
  };

  const getNombreUsuario = (id_usuario) => {
    const usuario = usuarios.find((u) => u.id === id_usuario);
    return usuario ? usuario.nombre : "N/A";
  };

  const getFolioCarroceria = (id_carroceria) => {
    const carroceria = carrocerias.find((c) => c.id === id_carroceria);
    return carroceria ? carroceria.folio : "N/A";
  };

  const carroceriaDelReporte = carrocerias.find(c => c.id === reporteData?.id_carrocerias);

  const fullData = {
    ...reporteData,
    id_imagen: carroceriaDelReporte?.id_imagen || null,
    id_imagen_procesada: imperfeccionDetalle?.id_imagen_procesada || null,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      
      const dateFinal = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      return dateFinal.toUpperCase()[0] + dateFinal.slice(1) + " a las " + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Error al formatear fecha";
    }
  };
  // Campos comunes (siempre se muestran)
  const commonFields = [
    {
      name: "descripcion",
      label: "Descripción",
      type: "textarea",
      fullWidth: true
    },
    {
      name: "id_carrocerias",
      label: "Carrocería",
      type: "text",
      render: (value) => getFolioCarroceria(value)
    },
    {
      name: "id_usuario",
      label: "Usuario",
      type: "text",
      render: (value) => getNombreUsuario(value)
    },
    {
      name: "createdAt",
      label: "Fecha de Creación",
      type: "text",
      render: (value) => {
        return formatDate(value);
      }
    },
   ...(!imperfeccionDetalle ? [{
        name: "mensaje_sin_imperfeccion",
        type: "custom",
        render: () => (
        <p className="text-yellow-400 text-sm font-semibold text-center mb-2">
            No se ha encontrado ninguna imperfección dentro de la carrocería.
        </p>
        )
    }] : []),
    {
      name: "id_imagen",
      label: "Imagen Original",
      type: "camera"
    }
  ];

  // Campos que solo se muestran si hay imperfección
  const imperfeccionFields = imperfeccionDetalle ? [
    {
      name: "id_prioridad",
      label: "Prioridad",
      type: "text",
      render: (value) => getNombrePrioridad(value)
    },
    {
      name: "id_severidad",
      label: "Severidad",
      type: "text"
    },
    {
      name: "coordenadas",
      label: "Coordenadas",
      type: "text"
    },
    {
      name: "id_imagen_procesada",
      label: "Imagen Procesada",
      type: "imperfeccion"
    }
  ] : [];

  const fields = [...commonFields, ...imperfeccionFields];

  if (loading) {
    return <Layout><p className="text-center text-white">Cargando...</p></Layout>;
  }

  if (error) {
    return <Layout><p className="text-center text-red-500">{error}</p></Layout>;
  }

  return (
      <CrudView
        title="Reporte"
        data={fullData}
        fields={fields}
        basePath="reportes"
      />
  );
}

export default ReporteView;

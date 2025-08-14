import { useState, useEffect } from "react"
import { reportesService, prioridadesService, imperfeccionesService, carroceriasService, usuariosService } from "../../api/api"
import CrudList from "../common/CrudList"

function ReportesList() {
  const [reportes, setReportes] = useState([])
  const [prioridades, setPrioridades] = useState([])
  const [imperfecciones, setImperfecciones] = useState([])
  const [carrocerias, setCarrocerias] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("") 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportesRes, prioridadesRes , imperfeccionesRes, carroceriasRes, usuariosRes] = await Promise.all([
          reportesService.getAll(),
          prioridadesService.getAll(),
          imperfeccionesService.getAll(),
          carroceriasService.getAll(),
          usuariosService.getAll(),
        ]);

        setReportes(reportesRes.data);
        setPrioridades(prioridadesRes.data);
        setImperfecciones(imperfeccionesRes.data);
        setCarrocerias(carroceriasRes.data);
        setUsuarios(usuariosRes.data);

      } catch (error) {
        console.error("Error al cargar los datos:", error);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este reporte?")) {
      try {
        await reportesService.delete(id)
        setReportes(reportes.filter((reporte) => reporte.id !== id))
      } catch (error) {
        console.error("Error al eliminar el reporte:", error)
        setError("Error al eliminar el reporte. Intente nuevamente.")
      }
    }
  }

  const getNombrePrioridad = (id_prioridad) => {
    const prioridad = prioridades.find((p) => p.id === id_prioridad)
    return prioridad ? prioridad.nombre : "N/A"
  }

  const getNombreImperfeccion = (id_imperfecciones) => {
    const imperfeccion = imperfecciones.find((i) => i.id === id_imperfecciones)
    return imperfeccion ? imperfeccion.nombre : "N/A"
  }

  const getFolioCarroceria = (id_carrocerias) => {
    const carroceria = carrocerias.find((c) => c.id === id_carrocerias)
    return carroceria ? carroceria.folio : "N/A"
  }

  const getNombreUsuario = (id_usuario) => {
    const usuario = usuarios.find((u) => u.id === id_usuario)
    return usuario ? usuario.nombre : "N/A"
  }

  const columns = [
    { key: "id", header: "ID" },
    { key: "descripcion", header: "Descripción" },
    { 
      key: "status",
      header: "Estado",
      render: (reporte) => {
        const getStatusDisplay = (status) => {
          switch (status?.toLowerCase()) {
            case 'completado':
              return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completado</span>;
            case 'pendiente':
              return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Pendiente</span>;
            case 'procesando':
              return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Procesando</span>;
            case 'error':
              return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Error</span>;
            default:
              return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status || 'N/A'}</span>;
          }
        };
        return getStatusDisplay(reporte.status);
      }
    },
    { 
      key: "id_carrocerias",
      header: "Carrocería",
      render: (reporte) => getFolioCarroceria(reporte.id_carrocerias)
    },
    { 
      key: "id_usuario",
      header: "Usuario",
      render: (reporte) => getNombreUsuario(reporte.id_usuario)
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (reporte) => new Date(reporte.createdAt).toLocaleDateString()
    }
  ]
  

  return (
    <CrudList
      title="Reportes"
      items={reportes}
      columns={columns}
      loading={loading}
      error={error}
      basePath="reportes"
      onDelete={handleDelete}
      searchFields={["descripcion", "id"]}
    />
  )
}

export default ReportesList


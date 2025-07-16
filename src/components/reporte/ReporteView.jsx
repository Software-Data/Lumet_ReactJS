import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { 
    reportesService, 
    prioridadesService, 
    imperfeccionesService, 
    carroceriasService, 
    usuariosService 
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
                const [reporteRes, prioridadesRes, carroceriasRes, usuariosRes] = await Promise.all([
                    reportesService.getById(id),
                    prioridadesService.getAll(),
                    carroceriasService.getAll(),
                    usuariosService.getAll(),
                ]);

                const reporte = reporteRes.data;
                setReporteData(reporte);
                setPrioridades(prioridadesRes.data);
                setCarrocerias(carroceriasRes.data);
                setUsuarios(usuariosRes.data);

                // Obtener detalles de la imperfección (incluyendo imagen)
                const imperfeccionRes = await imperfeccionesService.getById(reporte.id_imperfecciones);
                setImperfeccionDetalle(imperfeccionRes.data);
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

    const getFolioCarroceria = (id_carrocerias) => {
        const carroceria = carrocerias.find((c) => c.id === id_carrocerias);
        return carroceria ? carroceria.folio : "N/A";
    };

    const getNombreUsuario = (id_usuario) => {
        const usuario = usuarios.find((u) => u.id === id_usuario);
        return usuario ? usuario.nombre : "N/A";
    };

    const fields = [
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
            render: (value) => new Date(value).toLocaleString()
        },
        { 
            name: "coordenadas", 
            label: "Coordenadas", 
            type: "text" 
        },
        // Campo para mostrar imagen procesada desde imperfección asociada
        {
            name: "id_imagen_procesada",
            label: "Imagen Procesada",
            type: "imperfeccion"
        },
    ];

    // Si aún se está cargando o hay un error
    if (loading) {
        return <Layout><p className="text-center text-white">Cargando...</p></Layout>;
    }

    if (error) {
        return <Layout><p className="text-center text-red-500">{error}</p></Layout>;
    }

    // Fusionamos los datos del reporte con los de la imperfección
    const fullData = {
        ...reporteData,
        id_imagen_procesada: imperfeccionDetalle?.id_imagen_procesada || null,
    };

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

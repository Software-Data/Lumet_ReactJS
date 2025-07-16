import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { reportesService, prioridadesService, imperfeccionesService, carroceriasService, usuariosService } from "../../api/api";
import CrudView from "../common/CrudView";
import Layout from "../layout/layout";

function ReporteView() {
    const { id } = useParams();
    const [reporteData, setReporteData] = useState(null);
    const [prioridades, setPrioridades] = useState([]);
    const [imperfecciones, setImperfecciones] = useState([]);
    const [carrocerias, setCarrocerias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchReporte = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [reporteRes, prioridadesRes, imperfeccionesRes, carroceriasRes, usuariosRes] = await Promise.all([
                    reportesService.getById(id),
                    prioridadesService.getAll(),
                    imperfeccionesService.getAll(),
                    carroceriasService.getAll(),
                    usuariosService.getAll(),
                ]);
                
                setReporteData(reporteRes.data);
                setPrioridades(prioridadesRes.data);
                setImperfecciones(imperfeccionesRes.data);
                setCarrocerias(carroceriasRes.data);
                setUsuarios(usuariosRes.data);
            } catch (err) {
                console.error("Error al cargar los datos del reporte:", err);
                setError("No se pudieron cargar los detalles. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchReporte();
    }, [id]);

    const getNombrePrioridad = (id_prioridad) => {
        const prioridad = prioridades.find((p) => p.id === id_prioridad);
        return prioridad ? prioridad.nombre : "N/A";
    };

    const getNombreImperfeccion = (id_imperfecciones) => {
        const imperfeccion = imperfecciones.find((i) => i.id === id_imperfecciones);
        return imperfeccion ? imperfeccion.nombre : "N/A";
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
        { name: "descripcion", label: "Descripción", type: "textarea", fullWidth: true },
        { 
            name: "id_imperfecciones", 
            label: "Imperfección", 
            type: "text",
            render: (value) => getNombreImperfeccion(value)
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
        }
    ];
    
    if (loading) {
        return <Layout><p className="text-center text-white">Cargando...</p></Layout>;
    }
    
    if (error) {
        return <Layout><p className="text-center text-red-500">{error}</p></Layout>;
    }

    return (
        <CrudView
            title="Reporte"
            data={reporteData}
            fields={fields}
            basePath="reportes"
        />
    );
}

export default ReporteView;
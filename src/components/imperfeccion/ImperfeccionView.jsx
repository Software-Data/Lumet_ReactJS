import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { imperfeccionesService } from "../../api/api";
import CrudView from "../common/CrudView"; // Asegúrate que la ruta sea correcta
import Layout from "../layout/layout"; // Importa tu Layout si CrudView no lo hace

function ImperfeccionView() {
    const { id } = useParams();
    const [imperfeccionData, setImperfeccionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchImperfeccion = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await imperfeccionesService.getById(id);
                setImperfeccionData(response.data);
            } catch (err) {
                console.error("Error al cargar los datos de la reporte:", err);
                setError("No se pudieron cargar los detalles. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchImperfeccion();
    }, [id]);

    const fields = [
        { name: "id", label: "ID", type: "text" },
        { name: "coordenadas", label: "Coordenadas", type: "text" },
        { name: "id_severidad", label: "Severidad", type: "text" },
        { name: "id_imagen_procesada", label: "Imagen Procesada", type: "imperfeccion" },
        { name: "id_usuario", label: "Usuario", type: "text" },
    ];
    
    // Mientras carga o si hay un error, puedes mostrar un mensaje.
    if (loading) {
        return <Layout><p className="text-center text-white">Cargando...</p></Layout>;
    }
    
    if (error) {
        return <Layout><p className="text-center text-red-500">{error}</p></Layout>;
    }

    return (
        <CrudView
            title="Imperfecciones"
            data={imperfeccionData}
            fields={fields}
            basePath="imperfecciones"
        />
    );
}

export default ImperfeccionView;
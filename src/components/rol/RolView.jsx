import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { rolesService } from "../../api/api";
import CrudView from "../common/CrudView"; // Asegúrate que la ruta sea correcta
import Layout from "../layout/layout"; // Importa tu Layout si CrudView no lo hace

function RolView() {
    const { id } = useParams();
    const [rolData, setRolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRol = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await rolesService.getById(id);
                setRolData(response.data);
            } catch (err) {
                console.error("Error al cargar los datos de la rol:", err);
                setError("No se pudieron cargar los detalles. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchRol();
    }, [id]);

    const fields = [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "descripcion", label: "Descripción", type: "text" },
        { name: "createdAt", label: "Creado el", type: "date" },
        { name: "codigo", label: "Código", type: "text" },
        { name: "updatedAt", label: "Actualizado el", type: "date" },
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
            title="Carrocería"
            data={rolData}
            fields={fields}
            basePath="roles"
        />
    );
}

export default RolView;
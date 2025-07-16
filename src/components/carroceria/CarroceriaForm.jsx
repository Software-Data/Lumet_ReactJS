import { useContext, useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { carroceriasService, rolesService } from "../../api/api";
import CrudForm from "../common/CrudForm";
import { AuthContext } from '../../context/AuthContext';

function CarroceriaForm() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        no_parte: "",
        color: "",
        panel: "",
        folio: "",
        descripcion: "",
        id_imagen: "", // Es mejor inicializar los archivos como null
        lote: "",
        estado: false,
        id_usuario: user.id,
    });

    // El estado de roles no parece usarse, pero lo dejamos por si acaso
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // La carga de datos iniciales estaba bien
        const fetchData = async () => {
            setLoading(true);
            try {
                // Si necesitas los roles para un select, esta llamada es correcta
                const rolesRes = await rolesService.getAll();
                setRoles(rolesRes.data);

                if (isEditing) {
                    const carroceriaRes = await carroceriasService.getById(id);
                    const carroceria = carroceriaRes.data;
                    setFormData({
                        id: carroceria.id, // Importante: incluir el ID
                        no_parte: carroceria.no_parte || "",
                        color: carroceria.color || "",
                        panel: carroceria.panel || "",
                        folio: carroceria.folio || "",
                        descripcion: carroceria.descripcion || "",
                        // No se puede pre-llenar un input[type=file], se deja como null
                        id_imagen: carroceria.id_imagen || "",
                        lote: carroceria.lote || "",
                        estado: carroceria.estado || false,
                        id_usuario: carroceria.id_usuario,
                        tiene_reporte: carroceria.tiene_reporte || false, // Incluir la información del reporte
                    });
                }
            } catch (error) {
                console.error("Error al cargar datos:", error);
                setError("Error al cargar los datos. Intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditing]);

    //
    // --- CAMBIO PRINCIPAL AQUÍ ---
    // Esta función ahora es muy simple. Solo recibe los datos ya procesados por CrudForm.
    //
    const handleSubmit = async (dataToSend) => {
        setLoading(true);
        setError("");

        try {
            if (isEditing) {
                await carroceriasService.update(id, dataToSend);
            } else {
                await carroceriasService.create(dataToSend);
            }
            return true; // Devuelve true para que CrudForm sepa que tuvo éxito
        } catch (error) {
            console.error("Error al guardar la carrocería:", error);
            setError(error.response?.data?.message || "Error al guardar. Verifique los campos.");
            return false; // Devuelve false en caso de error
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        // La definición de tus campos está bien
        { name: "no_parte", label: "Número de parte", type: "number", required: true, placeholder: "Ingrese el número de parte" },
        { name: "color", label: "Color", type: "colores", required: true, placeholder: "Ingrese el color" },
        { name: "folio", label: "Folio", type: "text", required: true, readOnly: true },
        { name: "panel", label: "Panel", type: "text", required: true, placeholder: "Ingrese el panel" },
        { name: "lote", label: "Lote", type: "text", required: true, placeholder: "Ingrese el lote" },
        { name: "descripcion", label: "Descripción", type: "textarea", required: true, placeholder: "Ingrese la descripción" },
        { name: "estado", label: "Estado", type: "checkbox", checkboxLabel: "Activo" },
        { name: "id_usuario", label: "", type: "hidden" },
        { name: "id_imagen", label: "Imágen", type: "camera", imageIdFieldName: "id_imagen", required: !isEditing } // La imagen puede ser requerida solo al crear
    ];

    return (
        <CrudForm
            title="Carrocería"
            initialData={formData}
            fields={fields}
            onSubmit={handleSubmit} 
            loading={loading}
            error={error}
            basePath="carrocerias"
            isEditing={isEditing}
            tieneReporte={formData.tiene_reporte}
        />
    );
}

export default CarroceriaForm;
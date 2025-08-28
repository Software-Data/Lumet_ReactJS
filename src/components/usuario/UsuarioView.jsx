import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { usuariosService, rolesService } from "../../api/api";
import CrudView from "../common/CrudView";
import Layout from "../layout/layout";

function UsuarioView() {
    const { id } = useParams();
    const [usuarioData, setUsuarioData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);   
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsuario = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Cargar roles primero
                const rolesRes = await rolesService.getAll();
                console.log('Roles cargados:', rolesRes);
                setRoles(rolesRes.data || []);

                // Cargar usuario
                const usuarioRes = await usuariosService.getById(id);
                console.log('Usuario cargado:', usuarioRes);
                
                if (usuarioRes.data) {
                    setUsuarioData(usuarioRes.data);
                } else {
                    setError("No se encontró el usuario");
                }
            } catch (err) {
                console.error("Error al cargar los datos del usuario:", err);
                setError("No se pudieron cargar los detalles. Intente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [id]);

    const getRolNombre = (rolId) => {
        console.log('Buscando rol con ID:', rolId, 'en roles:', roles);
        const rol = roles.find((r) => r.id === rolId);
        console.log('Rol encontrado:', rol);
        return rol ? rol.nombre : "N/A";
    };

    const fields = [
        { name: "id", label: "ID", type: "string" },
        { name: "nombre", label: "Nombre", type: "string" },
        { name: "correo", label: "Correo", type: "string" },
        {
            name: "id_rol", // Cambiado de id_rol a rol_id
            label: "Rol",
            render: (usuario) => {
                // Intentar diferentes campos posibles para el rol
                const rolId = usuario.id_rol;
                return getRolNombre(rolId);
            },
            type: "string"
        },
        {
            name: "estado", 
            label: "Estado",
            type: "checkbox",
            checkboxLabel: "Usuario activo",
            readonly: true,
            render: (usuario) => {
                // Intentar diferentes campos posibles para el estado
                const isActivo = usuario.estado !== undefined ? usuario.estado : false;
                
                return (
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isActivo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                    >
                        {isActivo ? "Activo" : "Inactivo"}
                    </span>
                );
            },
        },
        // Agregar campo de verificación si existe
        {
            name: "verificado",
            label: "Verificado",
            type: "checkbox",
            checkboxLabel: "Usuario verificado",
            readonly: true,
            render: (usuario) => {
                const isVerificado = usuario.verificado !== undefined ? usuario.verificado : false;
                return (
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isVerificado ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                        {isVerificado ? "Verificado" : "Pendiente"}
                    </span>
                );
            },
        },
    ];
    
    // Debug: mostrar datos cargados
    useEffect(() => {
        if (usuarioData) {
            console.log('Usuario data final:', usuarioData);
            console.log('Roles disponibles:', roles);
        }
    }, [usuarioData, roles]);
    
    // Mientras carga o si hay un error, puedes mostrar un mensaje.
    if (loading) {
        return <Layout><p className="text-center text-white">Cargando...</p></Layout>;
    }
    
    if (error) {
        return <Layout><p className="text-center text-red-500">{error}</p></Layout>;
    }

    if (!usuarioData) {
        return <Layout><p className="text-center text-red-500">No se encontró el usuario</p></Layout>;
    }

    return (
        <CrudView
            title="Usuario"
            data={usuarioData}
            fields={fields}
            basePath="usuarios"
        />
    );
}

export default UsuarioView;
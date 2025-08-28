import { useState, useEffect, useRef } from "react"
import { usuariosService, rolesService } from "../../api/api"
import CrudList from "../common/CrudList"

function UsuariosList() {
  const [usuarios, setUsuarios] = useState([]) 
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("") 

  let usuariosRef = useRef([])
  let rolesRef = useRef([]) 

useEffect(() => {
  const fetchData = async () => {

    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll()
      ]);

      setUsuarios(usuariosRes.data);
      setRoles(rolesRes.data);

    } catch (error) {
      console.error("Error al cargar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []); 

  

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      try {
        await usuariosService.delete(id)
        setUsuarios(usuarios.filter((usuario) => usuario.id !== id))
      } catch (error) {
        console.error("Error al eliminar usuario:", error)
        setError("Error al eliminar el usuario. Intente nuevamente.")
      }
    }
  }

  const getRolNombre = (id_rol) => {
    const rol = roles.find((r) => r.id === id_rol)
    return rol ? rol.nombre : "N/A"
  }

  const columns = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "correo", header: "Correo" },
    {
      key: "id_rol",
      header: "Rol",
      render: (usuario) => getRolNombre(usuario.id_rol),
    },
    {
      key: "verificado",
      header: "Verificado",
      render: (usuario) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            usuario.verificado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {usuario.verificado ? "Verificado" : "Pendiente"}
        </span>
      ),
    },
{
  key: "estado",
  header: "Estado",
  render: (usuario) => (
<span
  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
usuario.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }`}
>
  {usuario.estado ? "Activo" : "Inactivo"}
</span>
  ),
   },
  ]
  

  return (
    <CrudList
      title="Usuarios"
      items={usuarios}
      columns={columns}
      loading={loading}
      error={error}
      basePath="usuarios"
      onDelete={handleDelete}
      searchFields={["nombre", "email"]}
    />
  )
}

export default UsuariosList


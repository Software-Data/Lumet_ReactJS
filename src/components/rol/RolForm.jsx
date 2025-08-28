import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { usuariosService, rolesService } from "../../api/api"
import CrudForm from "../common/CrudForm"

function RolForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    codigo: "",
    createdAt: "",
    updatedAt: "",
  })

  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await rolesService.getAll()
        setRoles(rolesRes.data)

        if (isEditing) {
          const rolRes = await rolesService.getById(id)
          const rol = rolRes.data
          setFormData({
            nombre: rol.nombre || ""
          })
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setError("Error al cargar los datos. Intente nuevamente.")
      }
    }

    fetchData()
  }, [id, isEditing])

  const handleSubmit = async (data) => {
    setLoading(true)
    setError("")

    try {
      const rolData = { ...data }
      if (isEditing && !rolData.password) {
        delete rolData.password
      }

      if (isEditing) {
        await rolesService.update(id, rolData)
      } else {
        await rolesService.create(rolData)
      }

      return true // Éxito
    } catch (error) {
      console.error("Error al guardar rol:", error)
      setError("Error al guardar el rol. Intente nuevamente.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Ingrese el nombre del rol",
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      required: true,
      placeholder: "Ingrese la descripción del rol",
    },
    {
      name: "codigo",
      label: "Código",
      type: "text",
      required: true,
      placeholder: "Ingrese el código del rol",
    },
  ]

  return (
    <CrudForm
      title="Rol"
      initialData={formData}
      fields={fields}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      basePath="roles"
      isEditing={isEditing}
    />
  )
}

export default RolForm


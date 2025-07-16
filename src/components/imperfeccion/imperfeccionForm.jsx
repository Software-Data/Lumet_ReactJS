import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { imperfeccionesService, prioridadesService, carroceriasService } from "../../api/api"
import CrudForm from "../common/CrudForm"

function ImperfeccionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({ nombre: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados para las opciones de los selects
  const [prioridades, setPrioridades] = useState([])
  const [imperfecciones, setImperfecciones] = useState([])
  const [carrocerias, setCarrocerias] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carga las opciones de los selects
        const [prioridadesRes, imperfeccionesRes, carroceriasRes] = await Promise.all([
          prioridadesService.getAll(),
          imperfeccionesService.getAll(),
          carroceriasService.getAll(),
        ])
        setPrioridades(prioridadesRes.data)
        setImperfecciones(imperfeccionesRes.data)
        setCarrocerias(carroceriasRes.data)

        if (isEditing) {
          const imperfeccionRes = await imperfeccionesService.getById(id)
          const imperfeccion = imperfeccionRes.data
          setFormData({
            id_prioridad: imperfeccion.id_prioridad || "",
            descripcion: imperfeccion.descripcion || "",
            id_imperfecciones: imperfeccion.id_imperfecciones || "",
            id_carrocerias: imperfeccion.id_carrocerias || "",
            // id_usuario lo manejas tú
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
      const imperfeccionData = { ...data }
      if (isEditing) {
        await imperfeccionesService.update(id, imperfeccionData)
      } else {
        await imperfeccionesService.create(imperfeccionData)
      }
      return true
    } catch (error) {
      console.error("Error al guardar la imperfeccion:", error)
      setError("Error al guardar la imperfeccion. Intente nuevamente.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Mapea las opciones para los selects
  const fields = [
    {
      name: "id_prioridad",
      label: "Prioridad",
      type: "select",
      required: true,
      options: prioridades.map(p => ({ value: p.id, label: p.nombre })),
      placeholder: "Selecciona la prioridad"
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      required: true,
      placeholder: "Ingrese la descripción del imperfeccion"
    },
    {
      name: "id_imperfecciones",
      label: "Imperfección",
      type: "select",
      required: false,
      options: imperfecciones.map(i => ({ value: i.id, label: i.nombre })),
      placeholder: "Selecciona la imperfección"
    },
    {
      name: "id_carrocerias",
      label: "Carrocería",
      type: "select",
      required: true,
      options: carrocerias.map(c => ({ value: c.id, label: c.lote })),
      placeholder: "Selecciona la carrocería"
    },
    {
      name: "id_usuario",
      label: "",
      type: "hidden"
    }
  ]

  return (
    <CrudForm
      title="Imperfeccion"
      initialData={formData}
      fields={fields}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      basePath="imperfeccions"
      isEditing={isEditing}
    />
  )
}

export default ImperfeccionForm